use rusqlite::{params, Connection, Result};
use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum LockError {
    #[error("Path is currently locked by agent '{holder_agent}' for task '{task}' (expires at {expires_at})")]
    Conflict {
        path: String,
        holder_agent: String,
        task: String,
        expires_at: String,
    },
    #[error("Database error: {0}")]
    Db(#[from] rusqlite::Error),
    #[error("Invalid path: {0}")]
    InvalidPath(String),
}

/// Normalize path for consistent lock comparison (strips trailing slashes, resolves relative markers)
pub fn normalize_path<P: AsRef<Path>>(path: P) -> String {
    let p = path.as_ref();
    let components: Vec<_> = p.components().map(|c| c.as_os_str().to_string_lossy()).collect();
    let mut normalized = PathBuf::new();
    for comp in components {
        if comp == "." {
            continue;
        }
        normalized.push(comp);
    }
    let s = normalized.to_string_lossy().to_string();
    if s.is_empty() {
        ".".to_string()
    } else {
        s
    }
}

pub struct LockEvaluator<'a> {
    conn: &'a Connection,
}

impl<'a> LockEvaluator<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    /// Clean up any expired locks in the database
    pub fn cleanup_expired(&self) -> Result<usize> {
        let count = self.conn.execute(
            "DELETE FROM locks WHERE expires_at <= CURRENT_TIMESTAMP",
            [],
        )?;
        Ok(count)
    }

    /// Check if target_path collides with any active unexpired locks
    pub fn check_collision(&self, target_path: &str, is_dir: bool) -> Result<(), LockError> {
        self.cleanup_expired()?;

        let norm_target = normalize_path(target_path);

        // Retrieve all active locks
        let mut stmt = self.conn.prepare(
            r#"
            SELECT l.path, l.scope, a.name, s.task, l.expires_at
            FROM locks l
            JOIN agents a ON l.agent_id = a.id
            JOIN sessions s ON l.session_id = s.id
            WHERE l.expires_at > CURRENT_TIMESTAMP
            "#,
        )?;

        let active_locks = stmt.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
            ))
        })?;

        for lock_res in active_locks {
            let (locked_path, scope, holder_agent, task, expires_at) = lock_res?;
            let norm_locked = normalize_path(&locked_path);

            // Case 1: Exact Match
            if norm_locked == norm_target {
                return Err(LockError::Conflict {
                    path: norm_target,
                    holder_agent,
                    task,
                    expires_at,
                });
            }

            // Case 2: Ancestor Lock Check (locked_path is parent directory of target_path)
            if scope == "dir" && norm_target.starts_with(&format!("{}/", norm_locked)) {
                return Err(LockError::Conflict {
                    path: norm_locked,
                    holder_agent,
                    task,
                    expires_at,
                });
            }

            // Case 3: Subtree Check (target_path is a directory and parent of locked_path)
            if is_dir && norm_locked.starts_with(&format!("{}/", norm_target)) {
                return Err(LockError::Conflict {
                    path: norm_locked,
                    holder_agent,
                    task,
                    expires_at,
                });
            }
        }

        Ok(())
    }

    /// Acquire exclusive lock on target_path
    pub fn acquire(
        &self,
        agent_id: &str,
        session_id: &str,
        path: &str,
        is_dir: bool,
        ttl_minutes: i64,
    ) -> Result<(), LockError> {
        let norm_path = normalize_path(path);
        self.check_collision(&norm_path, is_dir)?;

        let scope = if is_dir { "dir" } else { "file" };

        self.conn.execute(
            r#"
            INSERT INTO locks (path, scope, agent_id, session_id, expires_at)
            VALUES (?1, ?2, ?3, ?4, DATETIME('now', ?5 || ' minutes'))
            "#,
            params![norm_path, scope, agent_id, session_id, ttl_minutes.to_string()],
        )?;

        self.conn.execute(
            r#"
            INSERT INTO events (event_type, session_id, agent_id, path, details)
            VALUES ('lock_acquired', ?1, ?2, ?3, ?4)
            "#,
            params![session_id, agent_id, norm_path, format!("TTL: {} mins", ttl_minutes)],
        )?;

        Ok(())
    }

    /// Release lock for session
    pub fn release(&self, session_id: &str, reason: &str) -> Result<bool> {
        let mut stmt = self.conn.prepare("SELECT path, agent_id FROM locks WHERE session_id = ?1")?;
        let lock_info: Option<(String, String)> = stmt.query_row(params![session_id], |row| {
            Ok((row.get(0)?, row.get(1)?))
        }).ok();

        if let Some((path, agent_id)) = lock_info {
            self.conn.execute("DELETE FROM locks WHERE session_id = ?1", params![session_id])?;
            self.conn.execute(
                "INSERT INTO events (event_type, session_id, agent_id, path, details) VALUES ('lock_released', ?1, ?2, ?3, ?4)",
                params![session_id, agent_id, path, reason],
            )?;
            Ok(true)
        } else {
            Ok(false)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::DatabaseManager;

    #[test]
    fn test_lock_collision_cascades() {
        let db = DatabaseManager::init(":memory:").unwrap();
        let conn = db.conn();
        let evaluator = LockEvaluator::new(conn);

        // Setup session
        conn.execute(
            "INSERT INTO sessions (id, agent_id, task, status) VALUES ('sess1', 'antigravity', 'Refactor API', 'running')",
            [],
        ).unwrap();

        // Lock /src/api (directory)
        evaluator.acquire("antigravity", "sess1", "src/api", true, 15).unwrap();

        // Attempting to lock child file /src/api/routes.rs should fail with Conflict
        let err = evaluator.check_collision("src/api/routes.rs", false);
        assert!(matches!(err, Err(LockError::Conflict { .. })));

        // Locking unrelated path /src/db.rs should succeed
        assert!(evaluator.check_collision("src/db.rs", false).is_ok());
    }
}
