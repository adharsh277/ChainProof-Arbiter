// Agent types
export type AgentRole = "risk-analysis" | "contract-behavior" | "transaction-pattern"

export interface AgentAnalysis {
  agent: AgentRole
  timestamp: string
  analysis: string
  riskScore: number
  confidence: number
  findings: string[]
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
  }
  proof_metadata: {
    proof_type: "arbitration"
    proof_version: string
    proof_timestamp: string
  }
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
