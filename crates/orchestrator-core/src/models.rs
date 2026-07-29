use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum InvocationMode {
    Headless,
    Manual,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AgentStatus {
    Idle,
    Active,
    AwaitingHandoff,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub invocation_mode: InvocationMode,
    pub status: AgentStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LockScope {
    File,
    Dir,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lock {
    pub id: i64,
    pub path: String,
    pub scope: LockScope,
    pub agent_id: String,
    pub session_id: String,
    pub acquired_at: String,
    pub expires_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
    Running,
    AwaitingHandoff,
    Completed,
    Failed,
    Abandoned,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub agent_id: String,
    pub task: String,
    pub status: SessionStatus,
    pub started_at: String,
    pub ended_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub id: i64,
    pub ts: String,
    pub event_type: String,
    pub session_id: Option<String>,
    pub agent_id: Option<String>,
    pub path: Option<String>,
    pub details: Option<String>,
}
