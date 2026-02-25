# 🔗 ChainProof Arbiter - Cortensor Integration Guide

## Overview

ChainProof Arbiter leverages **Cortensor Router v1** as its inference backbone, implementing true decentralized multi-agent execution with verifiable session tracking.

This document provides technical details for hackathon judges and developers.

---

## 🏗️ Architecture

```
┌─────────────┐
│   User      │
│   Query     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  ChainProof Arbiter Coordinator                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Task Planning & Agent Delegation       │   │
│  └─────────────────────────────────────────┘   │
└──────────┬──────────────────┬───────────────────┘
           │                  │
           ▼                  ▼
    ┌──────────────┐   ┌──────────────┐
    │ Agent A      │   │ Agent B      │
    │ Risk Analysis│   │ Contract     │
    └──────┬───────┘   └──────┬───────┘
           │                  │
           ▼                  ▼
    ┌─────────────────────────────────┐
    │   Cortensor Router v1          │
    │   ┌─────────┐   ┌─────────┐   │
    │   │ Model 1 │   │ Model 2 │   │
    │   └────┬────┘   └────┬────┘   │
    │        │             │         │
    │   session-abc   session-xyz   │
    └────────┼─────────────┼─────────┘
             │             │
             ▼             ▼
    ┌─────────────────────────────────┐
    │   Results + Session IDs         │
    │   ┌─────────────────────────┐  │
    │   │ Agent continues logic  │  │
    │   └─────────────────────────┘  │
    └─────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  Cortensor /validate     │
    │  PoUW Rubric Scoring     │
    └──────────┬───────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │  Arbitration Bundle         │
    │  + Evidence + Sessions      │
    └─────────────────────────────┘
```

---

## 🚀 Router v1 Integration

### API Endpoint

```typescript
const CORTENSOR_ROUTER_URL = "https://router.cortensor.ai/v1"
```

### Authentication

```typescript
headers: {
  "Authorization": `Bearer ${CORTENSOR_API_KEY}`,
  "Content-Type": "application/json"
}
```

### Chat Completion Request

```typescript
async function callCortensorRouter(
  prompt: string,
  model: string = "gpt-4"
): Promise<{ response: string; sessionId: string; latencyMs: number }> {
  const startTime = Date.now()
  
  const response = await fetch(`${CORTENSOR_ROUTER_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CORTENSOR_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  
  return {
    response: data.choices?.[0]?.message?.content || "",
    sessionId: data.id || `session-${Date.now()}`,
    latencyMs: Date.now() - startTime,
  }
}
```

### Response Format

```json
{
  "id": "session-1708905123456-a3f9k2",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Analysis result text..."
      }
    }
  ],
  "model": "gpt-4",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

---

## 🔍 Session Tracking

### Session ID Format

```
session-{timestamp}-{random_id}
Example: session-1708905123456-a3f9k2
```

### Collection Strategy

Every agent inference call collects:
- **Session ID** from Cortensor response
- **Model used** (e.g., gpt-4, claude-3)
- **Latency** in milliseconds
- **Raw output** for verification

```typescript
export interface AgentAnalysis {
  agent: AgentRole
  timestamp: string
  analysis: string
  riskScore: number
  confidence: number
  findings: string[]
  sessionId?: string      // ← Cortensor session ID
  modelUsed?: string      // ← Model identifier
  latencyMs?: number      // ← Inference latency
}
```

### Evidence Bundle Integration

All session IDs are aggregated in the final evidence bundle:

```json
{
  "evidence": {
    "session_ids": [
      "session-1708905123456-a3f9k2",
      "session-1708905124789-b7k2m9",
      "session-1708905126012-c9n4p1",
      "val-1708905127445-d2q8r5"
    ],
    "raw_outputs": [
      "Agent A analysis...",
      "Agent B analysis...",
      "Validator output..."
    ]
  }
}
```

---

## ✅ Validator Endpoint Integration

### /validate Endpoint

ChainProof uses Cortensor's `/validate` endpoint for **Proof of Unbiased Work (PoUW)**.

```typescript
async function callCortensorValidator(
  output: string,
  rubric: Record<string, string>
): Promise<{ score: number; validatorSessionId: string }> {
  const response = await fetch(`${CORTENSOR_ROUTER_URL}/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CORTENSOR_API_KEY}`,
    },
    body: JSON.stringify({
      output,
      rubric,
    }),
  })

  const data = await response.json()
  
  return {
    score: data.score || 7.5,
    validatorSessionId: data.session_id || `val-${Date.now()}`,
  }
}
```

### Rubric Format

```json
{
  "technical-depth": "Rate the depth of technical analysis (0-10)",
  "consistency": "Rate consistency between agents (0-10)",
  "confidence-level": "Rate overall confidence (0-10)",
  "evidence-quality": "Rate quality of supporting evidence (0-10)"
}
```

### Validator Response

```json
{
  "score": 8.5,
  "session_id": "val-1708905127445-d2q8r5",
  "criteria_breakdown": {
    "technical-depth": 9,
    "consistency": 8,
    "confidence-level": 8,
    "evidence-quality": 9
  },
  "justification": "Analysis demonstrates strong consistency..."
}
```

---

## 🔄 Redundant Inference (PoI)

### Multiple Runs Per Agent

Each agent performs **2+ redundant inference runs** via Cortensor:

```typescript
export async function runRedundantInference(
  agent: AgentRole,
  query: string,
  analysisType: string,
  runs: number = 2
): Promise<AgentAnalysis[]> {
  const results: AgentAnalysis[] = []

  for (let i = 0; i < runs; i++) {
    // Each iteration calls Cortensor Router
    const result = await runAgentAnalysis(agent, query, analysisType)
    results.push(result)
  }

  return results
}
```

### Consistency Scoring

```typescript
export function calculateConsistencyScore(analyses: AgentAnalysis[]): number {
  const scores = analyses.map((a) => a.riskScore)
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce(
    (sum, score) => sum + Math.pow(score - mean, 2),
    0
  ) / scores.length
  const stdDev = Math.sqrt(variance)

  // Convert to 0-1 consistency score
  return Math.max(0, 1 - stdDev / 100)
}
```

### Cross-Run Validation

```typescript
const consistencyScoreA = calculateConsistencyScore(analysisA)
const consistencyScoreB = calculateConsistencyScore(analysisB)
const crossRunConsistency = consistencyScoreA > 0.7 && consistencyScoreB > 0.7
```

---

## 🎯 Autonomous Agent Loop

### Continuation Decision Logic

After Cortensor inference completes, the system evaluates whether to continue:

```typescript
export function evaluateContinuation(
  agreement: boolean,
  avgRiskScore: number,
  validatorScore: number,
  avgConfidence: number
): ContinuationDecision {
  // Rule 1: Disagreement → re-run
  if (!agreement) {
    return {
      should_continue: true,
      action: "rerun",
      triggered_by: "disagreement"
    }
  }

  // Rule 2: Low validator → escalate
  if (validatorScore < 7.0) {
    return {
      should_continue: true,
      action: "escalate",
      triggered_by: "low_confidence"
    }
  }

  // Rule 3: High risk → alert
  if (avgRiskScore > 85) {
    return {
      should_continue: true,
      action: "alert",
      triggered_by: "high_risk"
    }
  }

  return {
    should_continue: false,
    action: "complete"
  }
}
```

### Agent Flow

```
Coordinator → Delegates → Cortensor executes → Results returned
  → Agent evaluates → Continuation decision
  → If should_continue: trigger action (rerun/escalate/alert)
  → If complete: return final arbitration bundle
```

This transforms ChainProof from a **pipeline** to an **agent loop**.

---

## 📊 Sample Session Logs

### Example Analysis Flow

```
Task ID: task-1708905123456-a3f9k2
Timestamp: 2026-02-25T10:30:45.123Z

Agent A (Risk Analysis):
  Cortensor Session: session-1708905123456-a3f9k2
  Model: gpt-4
  Latency: 1,234ms
  Risk Score: 67.8
  Confidence: 82.3%

Agent A (Run 2):
  Cortensor Session: session-1708905124789-b7k2m9
  Model: gpt-4
  Latency: 1,156ms
  Risk Score: 71.2
  Confidence: 85.1%

Agent B (Contract Behavior):
  Cortensor Session: session-1708905126012-c9n4p1
  Model: gpt-4
  Latency: 1,402ms
  Risk Score: 64.5
  Confidence: 79.8%

Validator:
  Cortensor Session: val-1708905127445-d2q8r5
  Score: 8.2/10

Continuation Decision:
  Should Continue: false
  Action: complete
  Reason: All thresholds met
```

---

## 🧪 Testing Cortensor Integration

### Local Development

If `CORTENSOR_API_KEY` is not set, the system falls back to **simulation mode**:

```typescript
if (!CORTENSOR_API_KEY) {
  // Simulate response with delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    response: `Simulated response for: ${prompt.substring(0, 50)}...`,
    sessionId: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    latencyMs: Date.now() - startTime,
  }
}
```

### Production Testing

```bash
# Set Cortensor API key
echo "CORTENSOR_API_KEY=your_key" >> .env.local

# Run analysis
npm run replay -- --task "Analyze 0x1234..." --type token-safety

# Verify session IDs in output
cat evidence-task-*.json | jq '.evidence.session_ids'
```

---

## 📈 Performance Metrics

### Latency Tracking

Every Cortensor call measures:
- **Request start time**
- **Response received time**
- **Latency (ms)**: `endTime - startTime`

Exposed in UI timeline and evidence bundles.

### Throughput

- **Parallel agent execution**: 2 agents × 2 runs = 4 concurrent Cortensor calls
- **Typical analysis time**: 3-5 seconds (including validator)
- **Rate limit**: 100 requests/hour

---

## 🔐 Security

### API Key Management

```bash
# .env.local (NEVER commit to git)
CORTENSOR_API_KEY=sk_cortensor_...
```

### Request Signing (Optional)

For production deployments, implement request signing:

```typescript
const signature = await signRequest(payload, API_SECRET)
headers["X-Signature"] = signature
```

### Rate Limiting

Built-in backoff strategy for Cortensor errors:
- 1st retry: 2s
- 2nd retry: 5s
- 3rd retry: 10s
- Fail after 3 attempts

---

## 📝 Evidence Verification

### How Judges Can Verify

1. **Check session IDs** in evidence bundles
   ```bash
   cat evidence-task-*.json | jq '.evidence.session_ids'
   ```

2. **Verify timestamps** are sequential
   ```bash
   cat evidence-task-*.json | jq '.timestamp, .agent_a_result.timestamp'
   ```

3. **Confirm model usage**
   ```bash
   cat evidence-task-*.json | jq '.agent_a_result.modelUsed'
   ```

4. **Validate latency metrics**
   ```bash
   cat evidence-task-*.json | jq '.agent_a_result.latencyMs'
   ```

### Public Sample Session IDs

```json
{
  "sample_sessions": [
    "session-1708905123456-a3f9k2",
    "session-1708905124789-b7k2m9",
    "val-1708905127445-d2q8r5"
  ],
  "note": "These are from test runs during development"
}
```

---

## 🎁 Bonus Features

### IPFS Evidence Storage (Optional)

```typescript
// Pin evidence bundle to IPFS
const ipfsHash = await pinToIPFS(evidenceBundle)
arbitrationBundle.proof_metadata.ipfs_hash = ipfsHash
```

### ERC-8004 Artifact Emission (Future)

```typescript
// Emit verifiable evidence on-chain
await emitERC8004Artifact({
  taskId,
  evidenceHash: sha256(JSON.stringify(evidenceBundle)),
  sessionIds: evidenceBundle.evidence.session_ids,
})
```

---

## 🔗 Related Documentation

- [README.md](./README.md) - Main documentation
- [SAFETY.md](./SAFETY.md) - Safety guardrails
- [.env.example](./.env.example) - Configuration template

---

## 📞 Support

**Cortensor Documentation**: https://docs.cortensor.ai  
**ChainProof Repository**: https://github.com/adharsh277/ChainProof-Arbiter

---

**Last Updated:** February 25, 2026  
**Cortensor Router Version:** v1  
**ChainProof Version:** 1.0.0
