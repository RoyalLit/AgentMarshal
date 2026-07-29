use clap::{Parser, Subcommand};
use orchestrator_core::{get_adapter, DatabaseManager, LockEvaluator};
use rusqlite::params;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Parser)]
#[command(name = "agentmarshal")]
#[command(about = "Multi-agent coding session orchestrator & lock engine", long_about = None)]
struct Cli {
    /// Output results as formatted JSON
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize .orchestrator/state.db in the current project
    Init {
        #[arg(long)]
        agent: Option<String>,
    },
    /// Acquire lock on a file or directory for an agent task
    Lock {
        /// Target file or directory path
        path: String,
        /// Agent ID (claude-code, opencode, antigravity)
        #[arg(long)]
        agent: String,
        /// Task prompt / description
        #[arg(long)]
        task: String,
        /// TTL in minutes (default: 15)
        #[arg(long, default_value_t = 15)]
        ttl: i64,
        /// Treat target path as directory
        #[arg(long)]
        dir: bool,
    },
    /// Confirm completion of a manual-handoff task session
    Confirm {
        /// Session ID
        session_id: String,
        /// Mark session as failed instead of completed
        #[arg(long)]
        failed: bool,
    },
    /// Force release a lock for a session
    Release {
        /// Session ID
        session_id: String,
    },
    /// List active locks and active sessions
    Status {
        #[arg(long)]
        path: Option<String>,
        #[arg(long)]
        agent: Option<String>,
    },
    /// Display audit log of orchestration events
    Log {
        #[arg(long)]
        session: Option<String>,
    },
}

fn get_db_path() -> PathBuf {
    PathBuf::from(".orchestrator/state.db")
}

fn main() {
    let cli = Cli::parse();
    let db_path = get_db_path();

    match cli.command {
        Commands::Init { agent: _ } => {
            match DatabaseManager::init(&db_path) {
                Ok(_) => {
                    if cli.json {
                        println!(r#"{{"status":"ok","db_path":"{}"}}"#, db_path.display());
                    } else {
                        println!("✅ Initialized AgentMarshal state database at {}", db_path.display());
                    }
                }
                Err(e) => {
                    eprintln!("❌ Failed to initialize database: {}", e);
                    std::process::exit(1);
                }
            }
        }
        Commands::Lock { path, agent, task, ttl, dir } => {
            let db = match DatabaseManager::init(&db_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("❌ Database error: {}", e);
                    std::process::exit(1);
                }
            };

            let adapter = match get_adapter(&agent) {
                Some(a) => a,
                None => {
                    eprintln!("❌ Unknown agent: {}. Supported agents: claude-code, opencode, antigravity", agent);
                    std::process::exit(1);
                }
            };

            let session_id = Uuid::new_v4().to_string();
            let is_manual = adapter.mode() == orchestrator_core::InvocationMode::Manual;
            let session_status = if is_manual { "awaiting_handoff" } else { "running" };

            // Create session
            if let Err(e) = db.conn().execute(
                "INSERT INTO sessions (id, agent_id, task, status) VALUES (?1, ?2, ?3, ?4)",
                params![session_id, agent, task, session_status],
            ) {
                eprintln!("❌ Failed to create session: {}", e);
                std::process::exit(1);
            }

            // Attempt lock acquisition
            let evaluator = LockEvaluator::new(db.conn());
            match evaluator.acquire(&agent, &session_id, &path, dir, ttl) {
                Ok(()) => {
                    let handoff = adapter.generate_handoff(&session_id, &path, &task);
                    if cli.json {
                        println!("{}", serde_json::to_string_pretty(&handoff).unwrap());
                    } else {
                        println!("🔒 Lock acquired!");
                        println!("📌 Session ID: {}", session_id);
                        println!("{}", handoff.instruction);
                    }
                }
                Err(e) => {
                    if cli.json {
                        println!(r#"{{"error":"conflict","message":"{}"}}"#, e);
                    } else {
                        eprintln!("🛑 Lock Rejected: {}", e);
                    }
                    std::process::exit(1);
                }
            }
        }
        Commands::Confirm { session_id, failed } => {
            let db = match DatabaseManager::init(&db_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("❌ Database error: {}", e);
                    std::process::exit(1);
                }
            };

            let evaluator = LockEvaluator::new(db.conn());
            let status = if failed { "failed" } else { "completed" };

            db.conn().execute(
                "UPDATE sessions SET status = ?1, ended_at = CURRENT_TIMESTAMP WHERE id = ?2",
                params![status, session_id],
            ).ok();

            let released = evaluator.release(&session_id, "user confirm signal").unwrap_or(false);

            if cli.json {
                println!(r#"{{"session_id":"{}","status":"{}","lock_released":{}}}"#, session_id, status, released);
            } else {
                println!("✅ Session {} marked as {}. Lock released: {}", session_id, status, released);
            }
        }
        Commands::Release { session_id } => {
            let db = match DatabaseManager::init(&db_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("❌ Database error: {}", e);
                    std::process::exit(1);
                }
            };

            let evaluator = LockEvaluator::new(db.conn());
            let released = evaluator.release(&session_id, "manual force release override").unwrap_or(false);

            if cli.json {
                println!(r#"{{"session_id":"{}","released":{}}}"#, session_id, released);
            } else {
                println!("🔓 Lock for session {} released: {}", session_id, released);
            }
        }
        Commands::Status { path: _, agent: _ } => {
            let db = match DatabaseManager::init(&db_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("❌ Database error: {}", e);
                    std::process::exit(1);
                }
            };

            let evaluator = LockEvaluator::new(db.conn());
            evaluator.cleanup_expired().ok();

            let mut stmt = db.conn().prepare(
                r#"
                SELECT l.path, l.scope, a.name, s.task, l.expires_at, s.id, s.status
                FROM locks l
                JOIN agents a ON l.agent_id = a.id
                JOIN sessions s ON l.session_id = s.id
                "#,
            ).unwrap();

            let locks: Vec<_> = stmt.query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                    row.get::<_, String>(5)?,
                    row.get::<_, String>(6)?,
                ))
            }).unwrap().filter_map(Result::ok).collect();

            if cli.json {
                println!("{}", serde_json::to_string_pretty(&locks).unwrap());
            } else if locks.is_empty() {
                println!("ℹ️  No active locks found.");
            } else {
                println!("📌 Active Locks ({}):", locks.len());
                for (p, scope, agent_name, task, expires, sess_id, status) in locks {
                    println!(" - Path: {} ({}) | Agent: {} | Task: {} | Status: {} | Expires: {} [Session: {}]",
                        p, scope, agent_name, task, status, expires, sess_id
                    );
                }
            }
        }
        Commands::Log { session } => {
            let db = match DatabaseManager::init(&db_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("❌ Database error: {}", e);
                    std::process::exit(1);
                }
            };

            let query = match session {
                Some(s) => format!("SELECT id, ts, event_type, agent_id, path, details FROM events WHERE session_id = '{}' ORDER BY id DESC", s),
                None => "SELECT id, ts, event_type, agent_id, path, details FROM events ORDER BY id DESC LIMIT 50".to_string(),
            };

            let mut stmt = db.conn().prepare(&query).unwrap();
            let events: Vec<_> = stmt.query_map([], |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, Option<String>>(3)?,
                    row.get::<_, Option<String>>(4)?,
                    row.get::<_, Option<String>>(5)?,
                ))
            }).unwrap().filter_map(Result::ok).collect();

            if cli.json {
                println!("{}", serde_json::to_string_pretty(&events).unwrap());
            } else {
                println!("📜 Audit Event Log (latest {}):", events.len());
                for (id, ts, etype, agent_id, path, details) in events {
                    println!("[{}] {} | Type: {} | Agent: {} | Path: {} | {}",
                        id, ts, etype,
                        agent_id.unwrap_or_default(),
                        path.unwrap_or_default(),
                        details.unwrap_or_default()
                    );
                }
            }
        }
    }
}
