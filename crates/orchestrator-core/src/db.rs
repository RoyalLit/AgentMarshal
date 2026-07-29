use rusqlite::{Connection, Result};
use std::path::Path;

pub struct DatabaseManager {
    conn: Connection,
}

impl DatabaseManager {
    /// Initialize a SQLite database in WAL mode at the specified path
    pub fn init<P: AsRef<Path>>(db_path: P) -> Result<Self> {
        if let Some(parent) = db_path.as_ref().parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(db_path)?;

        // Performance & concurrency pragmas
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "busy_timeout", 5000)?;
        conn.pragma_update(None, "foreign_keys", "ON")?;

        let manager = Self { conn };
        manager.run_migrations()?;
        Ok(manager)
    }

    /// Run initial schema creation migrations
    fn run_migrations(&self) -> Result<()> {
        self.conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                invocation_mode TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'idle'
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                agent_id TEXT NOT NULL REFERENCES agents(id),
                task TEXT NOT NULL,
                status TEXT NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS locks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT NOT NULL UNIQUE,
                scope TEXT NOT NULL,
                agent_id TEXT NOT NULL REFERENCES agents(id),
                session_id TEXT NOT NULL REFERENCES sessions(id),
                acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            );

            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                event_type TEXT NOT NULL,
                session_id TEXT,
                agent_id TEXT,
                path TEXT,
                details TEXT
            );

            -- Register default supported agents if not already present
            INSERT OR IGNORE INTO agents (id, name, invocation_mode, status) VALUES
                ('claude-code', 'Claude Code', 'headless', 'idle'),
                ('opencode', 'opencode', 'manual', 'idle'),
                ('antigravity', 'Antigravity', 'manual', 'idle');
            "#
        )?;
        Ok(())
    }

    pub fn conn(&self) -> &Connection {
        &self.conn
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_db_initialization() {
        let manager = DatabaseManager::init(":memory:").expect("Failed to init in-memory DB");
        let conn = manager.conn();

        let mut stmt = conn
            .prepare("SELECT COUNT(*) FROM agents")
            .expect("Failed to prepare query");
        let count: i64 = stmt.query_row([], |row| row.get(0)).unwrap();
        assert_eq!(count, 3);
    }
}
