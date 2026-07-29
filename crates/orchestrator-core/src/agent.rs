use crate::models::InvocationMode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandoffInstruction {
    pub session_id: String,
    pub agent_id: String,
    pub path: String,
    pub task: String,
    pub instruction: String,
}

pub trait AgentAdapter {
    fn id(&self) -> &'static str;
    fn display_name(&self) -> &'static str;
    fn mode(&self) -> InvocationMode;
    fn generate_handoff(&self, session_id: &str, path: &str, task: &str) -> HandoffInstruction;
}

pub struct ClaudeCodeAdapter;
impl AgentAdapter for ClaudeCodeAdapter {
    fn id(&self) -> &'static str {
        "claude-code"
    }
    fn display_name(&self) -> &'static str {
        "Claude Code"
    }
    fn mode(&self) -> InvocationMode {
        InvocationMode::Headless
    }
    fn generate_handoff(&self, session_id: &str, path: &str, task: &str) -> HandoffInstruction {
        HandoffInstruction {
            session_id: session_id.to_string(),
            agent_id: self.id().to_string(),
            path: path.to_string(),
            task: task.to_string(),
            instruction: format!("Automated headless task runner: claude -p \"{}\"", task),
        }
    }
}

pub struct OpenCodeAdapter;
impl AgentAdapter for OpenCodeAdapter {
    fn id(&self) -> &'static str {
        "opencode"
    }
    fn display_name(&self) -> &'static str {
        "opencode"
    }
    fn mode(&self) -> InvocationMode {
        InvocationMode::Manual
    }
    fn generate_handoff(&self, session_id: &str, path: &str, task: &str) -> HandoffInstruction {
        HandoffInstruction {
            session_id: session_id.to_string(),
            agent_id: self.id().to_string(),
            path: path.to_string(),
            task: task.to_string(),
            instruction: format!(
                "👉 Lock acquired on '{}'. Open opencode editor, complete task: '{}'. When finished, execute:\n  agentmarshal confirm {}",
                path, task, session_id
            ),
        }
    }
}

pub struct AntigravityAdapter;
impl AgentAdapter for AntigravityAdapter {
    fn id(&self) -> &'static str {
        "antigravity"
    }
    fn display_name(&self) -> &'static str {
        "Antigravity"
    }
    fn mode(&self) -> InvocationMode {
        InvocationMode::Manual
    }
    fn generate_handoff(&self, session_id: &str, path: &str, task: &str) -> HandoffInstruction {
        HandoffInstruction {
            session_id: session_id.to_string(),
            agent_id: self.id().to_string(),
            path: path.to_string(),
            task: task.to_string(),
            instruction: format!(
                "👉 Lock acquired on '{}'. Run Antigravity agent on task: '{}'. When complete, execute:\n  agentmarshal confirm {}",
                path, task, session_id
            ),
        }
    }
}

pub fn get_adapter(agent_id: &str) -> Option<Box<dyn AgentAdapter>> {
    match agent_id {
        "claude-code" => Some(Box::new(ClaudeCodeAdapter)),
        "opencode" => Some(Box::new(OpenCodeAdapter)),
        "antigravity" => Some(Box::new(AntigravityAdapter)),
        _ => None,
    }
}
