// Agent types
export type AgentRole = "risk-analysis" | "contract-behavior" | "transaction-pattern"

export interface AgentAnalysis {
  agent: AgentRole
  timestamp: string
  analysis: string
  riskScore: number
  confidence: number
  findings: string[]
  sessionId?: string // Cortensor session ID
  modelUsed?: string // Model identifier from Cortensor
  latencyMs?: number // Inference latency in milliseconds
}

export interface AgentTask {
  id: string
  type: "token-safety" | "transaction-analysis" | "contract-audit"
  query: string
  status: "pending" | "analyzing" | "complete" | "error"
  timestamp: string
}

// Analysis types
export interface AnalysisRequest {
  query: string
  type: "token-safety" | "transaction-analysis" | "contract-audit"
  details?: string
}

export interface AgreementAnalysis {
  agreement: boolean
  agreementScore: number
  disagreementReason?: string
}

export interface ValidatorScoring {
  rubricUsed: string
  criteriaRated: Record<string, number>
  overallScore: number
  justification: string
}

export interface ArbitrationBundle {
  task: string
  taskId: string
  timestamp: string
  agent_a_result: AgentAnalysis
  agent_b_result: AgentAnalysis
  disagreement_analysis: AgreementAnalysis
  redundant_inference_runs: number
  cross_run_consistency: boolean
  validator_score: ValidatorScoring
  final_decision: string
  confidence: number
  evidence: {
    cross_run_consistency: boolean
    rubric_used: string
    validator_runs: number
    agreement_threshold: number
    actual_agreement: number
    session_ids: string[] // All Cortensor session IDs
    raw_outputs?: string[] // Raw model outputs for verification
  }
  proof_metadata: {
    proof_type: "arbitration"
    proof_version: string
    proof_timestamp: string
    ipfs_hash?: string // Optional IPFS hash for evidence
  }
  continuation?: ContinuationDecision // Autonomous follow-up actions
  operational_actions?: OperationalAction[] // Triggered workflows
}

// Autonomous continuation types
export interface ContinuationDecision {
  should_continue: boolean
  reason: string
  action: "rerun" | "escalate" | "alert" | "complete"
  triggered_by: "disagreement" | "low_confidence" | "high_risk" | "manual"
  threshold_exceeded?: {
    metric: string
    value: number
    threshold: number
  }
}

export interface OperationalAction {
  type: "webhook" | "alert" | "report" | "escalation"
  triggered: boolean
  endpoint?: string
  payload?: Record<string, unknown>
  timestamp: string
  status: "pending" | "sent" | "failed"
}

// Safety guardrails types
export interface SafetyConstraints {
  refuses_financial_advice: boolean
  refuses_auto_execution: boolean
  requires_human_review_below_confidence: number
  blocks_unsupported_chains: string[]
  rate_limit_per_hour: number
}

// UI types
export interface TimelineEvent {
  id: string
  timestamp: string
  agent?: AgentRole
  message: string
  type: "task" | "analysis" | "agreement" | "validation" | "complete"
  status: "pending" | "in-progress" | "complete" | "warning" | "error"
  // Enhanced consensus intelligence fields
  confidence?: number // Agent confidence percentage
  riskScore?: number // Current risk score
  delta?: number // Change from previous run
  consensusStatus?: "agreement" | "diverged" | "escalated" // Multi-agent consensus state
  latency?: number // Time taken in seconds
}
