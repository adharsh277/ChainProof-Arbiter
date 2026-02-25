import { AgentAnalysis, AgentRole } from "@/lib/types"

const RISK_FACTORS = {
  "contract-audit": [
    "Reentrancy vulnerabilities detected",
    "Integer overflow patterns",
    "Unchecked external calls",
    "Access control issues",
    "Logic flaws in state transitions",
  ],
  "token-safety": [
    "Centralized minting authority",
    "Suspicious liquidity patterns",
    "Whitelisted address anomalies",
    "Hidden owner privileges",
    "Unusual fee structures",
  ],
  "transaction-pattern": [
    "Sandwich attack indicators",
    "MEV extraction patterns",
    "Non-standard call sequences",
    "Flash loan usage",
    "Multi-hop routing anomalies",
  ],
}

const AGENT_CONFIGS = {
  "risk-analysis": {
    name: "Risk Analysis Agent",
    description: "Specializes in identifying blockchain security risks",
    keywords: ["security", "vulnerabilities", "threats"],
  },
  "contract-behavior": {
    name: "Contract Behavior Agent",
    description: "Analyzes smart contract execution patterns",
    keywords: ["behavior", "execution", "state"],
  },
  "transaction-pattern": {
    name: "Transaction Pattern Agent",
    description: "Detects suspicious transaction patterns",
    keywords: ["patterns", "sequences", "anomalies"],
  },
}

export async function runAgentAnalysis(
  agent: AgentRole,
  query: string,
  analysisType: string
): Promise<AgentAnalysis> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

  const factors = RISK_FACTORS[analysisType as keyof typeof RISK_FACTORS] || []
  const selectedFactors = factors
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.random() > 0.5 ? 3 : 4)

  const riskScore = Math.random() * 100
  const confidence = 0.7 + Math.random() * 0.25

  return {
    agent,
    timestamp: new Date().toISOString(),
    analysis: `Comprehensive analysis from ${AGENT_CONFIGS[agent].name} for query: "${query}". Identified ${selectedFactors.length} key risk factors.`,
    riskScore,
    confidence,
    findings: selectedFactors,
  }
}

export async function runRedundantInference(
  agent: AgentRole,
  query: string,
  analysisType: string,
  runs: number = 3
): Promise<AgentAnalysis[]> {
  const results: AgentAnalysis[] = []

  for (let i = 0; i < runs; i++) {
    const result = await runAgentAnalysis(agent, query, analysisType)
    results.push(result)
  }

  return results
}

export function calculateConsistencyScore(analyses: AgentAnalysis[]): number {
  if (analyses.length === 0) return 0

  const scores = analyses.map((a) => a.riskScore)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)

  // Convert standard deviation to consistency score (0-1, where 1 is perfect consistency)
  return Math.max(0, 1 - stdDev / 100)
}

export function assessAgreement(
  analysisA: AgentAnalysis,
  analysisB: AgentAnalysis,
  threshold: number = 20
): boolean {
  return Math.abs(analysisA.riskScore - analysisB.riskScore) <= threshold
}

export function generateValidatorScore(
  analysisA: AgentAnalysis,
  analysisB: AgentAnalysis,
  agreement: boolean
): {
  score: number
  justification: string
  criteria: Record<string, number>
} {
  const avgScore = (analysisA.riskScore + analysisB.riskScore) / 2
  const avgConfidence = (analysisA.confidence + analysisB.confidence) / 2

  // Rubric scoring
  const criteria = {
    "technical-depth": analysisA.findings.length > 0 && analysisB.findings.length > 0 ? 9 : 7,
    "consistency": agreement ? 10 : 6,
    "confidence-level": Math.round(avgConfidence * 10),
    "evidence-quality":
      analysisA.findings.some((f: string) => f.length > 20) &&
      analysisB.findings.some((f: string) => f.length > 20)
        ? 9
        : 7,
  }

  const overallScore =
    (criteria["technical-depth"] +
      criteria["consistency"] +
      criteria["confidence-level"] +
      criteria["evidence-quality"]) /
    4

  return {
    score: overallScore,
    justification: `Analysis demonstrates ${agreement ? "strong" : "moderate"} consistency across agent runs with an average confidence of ${(avgConfidence * 100).toFixed(1)}%. Risk assessment averaged ${avgScore.toFixed(1)}/100.`,
    criteria,
  }
}

export function generateArbitrationDecision(
  agreement: boolean,
  avgRiskScore: number,
  validatorScore: number
): { decision: string; reasoning: string } {
  let decision = "Medium Risk"
  let reasoning = ""

  if (avgRiskScore < 25) {
    decision = "Low Risk"
    reasoning = "After multi-agent analysis and validation, this asset presents minimal security concerns."
  } else if (avgRiskScore < 50) {
    decision = "Medium Risk"
    reasoning =
      "The analysis reveals potential vulnerabilities that warrant caution. Not recommended for high-value transactions without additional review."
  } else if (avgRiskScore < 75) {
    decision = "High Risk"
    reasoning = "Significant security concerns identified across multiple analysis vectors. Proceed with extreme caution or avoid entirely."
  } else {
    decision = "Critical Risk"
    reasoning = "Critical vulnerabilities detected. This asset/transaction is not recommended for any use."
  }

  if (!agreement) {
    reasoning += " Note: Agent disagreement suggests complexity; recommend manual review."
  }

  if (validatorScore < 5) {
    reasoning += " Validator confidence is low; recommend additional analysis."
  }

  return { decision, reasoning }
}
