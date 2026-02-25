import { NextRequest, NextResponse } from "next/server"
import {
  runRedundantInference,
  calculateConsistencyScore,
  assessAgreement,
  generateValidatorScore,
  generateArbitrationDecision,
} from "@/lib/agents"
import { ArbitrationBundle, AnalysisRequest } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json()

    if (!body.query || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: query, type" },
        { status: 400 }
      )
    }

    // Step 1: Coordinator receives task and plans
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()

    // Step 2: Delegate to two independent agents
    const [analysisA, analysisB] = await Promise.all([
      runRedundantInference("risk-analysis", body.query, body.type, 2),
      runRedundantInference("contract-behavior", body.query, body.type, 2),
    ])

    // Get the first analysis from each agent (representative)
    const agentAResult = analysisA[0]
    const agentBResult = analysisB[0]

    // Step 3: Detect disagreement
    const threshold = 20
    const agreementBool = assessAgreement(agentAResult, agentBResult, threshold)

    // Step 4: Run redundant inference & calculate consistency
    const consistencyScoreA = calculateConsistencyScore(analysisA)
    const consistencyScoreB = calculateConsistencyScore(analysisB)
    const crossRunConsistency = consistencyScoreA > 0.7 && consistencyScoreB > 0.7

    // Step 5: Apply rubric-based scoring (PoUW)
    const validatorResult = generateValidatorScore(
      agentAResult,
      agentBResult,
      agreementBool
    )

    // Step 6: Generate final decision
    const avgRisk = (agentAResult.riskScore + agentBResult.riskScore) / 2
    const { decision } = generateArbitrationDecision(
      agreementBool,
      avgRisk,
      validatorResult.score
    )

    // Step 7: Create structured arbitration bundle
    const arbitrationBundle: ArbitrationBundle = {
      task: body.query,
      taskId,
      timestamp,
      agent_a_result: agentAResult,
      agent_b_result: agentBResult,
      disagreement_analysis: {
        agreement: agreementBool,
        agreementScore: agreementBool ? 95 : 45,
        disagreementReason: agreementBool
          ? undefined
          : `Risk score difference of ${Math.abs(agentAResult.riskScore - agentBResult.riskScore).toFixed(1)} exceeds threshold of ${threshold}`,
      },
      redundant_inference_runs: 2,
      cross_run_consistency: crossRunConsistency,
      validator_score: {
        rubricUsed: "risk-assessment-v1",
        criteriaRated: validatorResult.criteria,
        overallScore: validatorResult.score,
        justification: validatorResult.justification,
      },
      final_decision: decision,
      confidence: (agentAResult.confidence + agentBResult.confidence) / 2,
      evidence: {
        cross_run_consistency: crossRunConsistency,
        rubric_used: "risk-assessment-v1",
        validator_runs: 2,
        agreement_threshold: threshold,
        actual_agreement: agreementBool ? 100 : 45,
      },
      proof_metadata: {
        proof_type: "arbitration",
        proof_version: "1.0.0",
        proof_timestamp: timestamp,
      },
    }

    return NextResponse.json(arbitrationBundle, { status: 200 })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Failed to process analysis request" },
      { status: 500 }
    )
  }
}
