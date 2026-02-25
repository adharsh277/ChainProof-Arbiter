# 🛡️ ChainProof Arbiter - Safety & Constraints

## Overview

ChainProof Arbiter implements **strict operational guardrails** to ensure responsible, reliable, and auditable AI agent execution. This document defines what the system will and will not do autonomously.

---

## ❌ Absolute Refusals

The ChainProof Arbiter agent **REFUSES** to:

### 1. Financial Advice
- ❌ No investment recommendations
- ❌ No trading signals or market predictions
- ❌ No portfolio optimization advice
- ❌ No price forecasts

**Rationale:** Prevents liability and ensures compliance with financial regulations.

### 2. Autonomous Execution
- ❌ No on-chain transaction execution
- ❌ No wallet interactions
- ❌ No token transfers or contract calls
- ❌ No governance votes

**Rationale:** Prevents unauthorized actions and financial loss.

### 3. Unsupported Chains
- ❌ Analysis blocked for chains not in whitelist
- ❌ No experimental/testnet-only networks in production
- ❌ No unverified contract sources

**Rationale:** Ensures data quality and prevents misleading analysis.

### 4. Biased Validation
- ❌ No subjective scoring without rubric
- ❌ No single-agent decision making
- ❌ No validation without cross-referencing

**Rationale:** Maintains PoUW integrity and prevents bias.

---

## ⚙️ Operational Thresholds

### Agent Confidence

| Range | Status | Action |
|-------|--------|--------|
| **≥ 80%** | High Confidence | Proceed normally |
| **60-79%** | Moderate Confidence | Log warning, continue |
| **< 60%** | Low Confidence | **ESCALATE TO HUMAN** |

**Implementation:**
```typescript
if (avgConfidence * 100 < SAFETY_GUARDRAILS.min_confidence_threshold) {
  return {
    action: "escalate",
    reason: "Agent confidence below minimum threshold"
  }
}
```

### Validator Score

| Range | Status | Action |
|-------|--------|--------|
| **≥ 8.0/10** | Excellent | High trust |
| **7.0-7.9/10** | Good | Acceptable |
| **< 7.0/10** | Poor | **ESCALATE** |

**Implementation:**
```typescript
if (validatorScore < 7.0) {
  return {
    action: "escalate",
    reason: "Validator score below quality threshold"
  }
}
```

### Risk Score

| Range | Level | Action |
|-------|-------|--------|
| **0-24** | Low Risk | Informational |
| **25-49** | Medium Risk | Caution advised |
| **50-74** | High Risk | Warning issued |
| **75-84** | Very High Risk | Alert logged |
| **≥ 85** | Critical Risk | **TRIGGER WEBHOOK ALERT** |

**Implementation:**
```typescript
if (avgRiskScore > SAFETY_GUARDRAILS.max_risk_auto_action) {
  return {
    action: "alert",
    reason: "Critical risk level detected"
  }
}
```

### Agreement Score

| Range | Status | Action |
|-------|--------|--------|
| **≥ 80%** | Agreement | Proceed |
| **50-79%** | Partial Disagreement | Log warning |
| **< 50%** | Disagreement | **AUTO RE-RUN** |

**Implementation:**
```typescript
if (!agreement) {
  return {
    action: "rerun",
    reason: "Agent disagreement detected exceeding threshold"
  }
}
```

---

## 🔒 Rate Limiting

### Request Limits
- **100 requests per hour** per API key
- **10 concurrent analyses** maximum
- **5-minute deduplication window** for identical queries

### Enforcement
```typescript
// Rate limit tracking
const rateLimiter = {
  max_requests_per_hour: 100,
  window_seconds: 3600,
  block_duration: 600 // 10 minutes
}
```

### Backoff Strategy
- **1st retry**: 2 seconds
- **2nd retry**: 5 seconds
- **3rd retry**: 10 seconds
- **4th+ retry**: Fail with error

---

## 📋 Escalation Policy

### When Escalation Occurs

1. **Low Confidence** (< 60%)
   - Human review required before final decision
   - Analysis flagged in dashboard with ⚠️ warning
   - Evidence bundle sent to review queue

2. **Low Validator Score** (< 7.0)
   - Quality check failed
   - Manual oversight needed
   - Additional context requested

3. **Agent Disagreement** (< 80% agreement)
   - Automatic re-run triggered
   - 3rd validator agent invoked
   - Cross-validation required

4. **Critical Risk** (≥ 90)
   - Immediate notification sent
   - Incident report generated automatically
   - Security team alerted via webhook

### Escalation Outputs

```json
{
  "type": "escalation",
  "taskId": "task-...",
  "reason": "Agent confidence below minimum threshold",
  "requires_human_review": true,
  "evidence_bundle_url": "/api/download-evidence?id=...",
  "timestamp": "2026-02-25T10:30:45.123Z"
}
```

---

## 🔗 Operational Actions

### Webhook Alerts

**Triggered when:**
- Risk score > 85
- Critical vulnerability detected
- System anomaly identified

**Payload:**
```json
{
  "severity": "critical",
  "taskId": "task-...",
  "riskScore": 87.3,
  "recommendation": "Immediate investigation required",
  "timestamp": "2026-02-25T10:30:45.123Z"
}
```

**Endpoints:**
- `ALERT_WEBHOOK_URL`: High-priority alerts (PagerDuty, Slack)
- `ESCALATION_WEBHOOK_URL`: Review queue (Jira, Linear)

### Incident Reports

**Triggered when:**
- Risk score > 90
- Multiple high-severity findings
- Automated response recommended

**Output:**
```json
{
  "type": "report",
  "report_type": "incident_summary",
  "risk_level": "critical",
  "findings": ["...", "..."],
  "recommendation": "Block token interaction immediately",
  "evidence_hash": "sha256:...",
  "timestamp": "2026-02-25T10:30:45.123Z"
}
```

---

## 📊 Audit Trail

### Evidence Logging

Every analysis produces an **immutable evidence bundle** containing:

- ✅ All Cortensor session IDs
- ✅ Agent confidence scores
- ✅ Validator scores with rubric
- ✅ Raw model outputs
- ✅ Timestamps (ISO 8601 format)
- ✅ Continuation decisions
- ✅ Operational actions taken

### Compliance

**Regulatory compliance features:**
- Audit logs retained for 90 days minimum
- Evidence bundles cryptographically signed
- Session IDs traceable to Cortensor infrastructure
- Human-in-the-loop for critical decisions

**Optional IPFS storage:**
- Evidence bundles can be pinned to IPFS
- Immutable proof of analysis
- Decentralized verification

---

## 🧪 Testing Safety Constraints

### Validation Tests

```bash
# Test low confidence escalation
npm run replay -- --task "Ambiguous query..." --type token-safety

# Test disagreement re-run
npm run replay -- --task "Edge case contract" --type contract-audit

# Test critical risk alert
npm run replay -- --task "Known scam token 0x..." --type token-safety
```

### Expected Behaviors

| Test Case | Expected Action |
|-----------|----------------|
| Confidence < 60% | Escalate to human |
| Agreement < 80% | Auto re-run |
| Risk > 85 | Webhook alert sent |
| Validator < 7.0 | Manual review flagged |

---

## 🎯 False Positive Prevention

### Multi-Layer Verification

1. **Redundant Inference (PoI)**
   - 2+ runs per agent
   - Consistency scoring
   - Outlier detection

2. **Multi-Agent Consensus**
   - Risk Analysis + Contract Behavior agents
   - Agreement threshold (80%)
   - Disagreement flagging

3. **Rubric-Based Validation (PoUW)**
   - Objective scoring criteria
   - 0-10 scale per criterion
   - Weighted overall score

4. **Human-in-the-Loop**
   - Escalation for low confidence
   - Manual review for edge cases
   - Override capability

---

## 📝 Summary

ChainProof Arbiter is designed as a **decision support system**, not an autonomous executor.

**Key Principles:**
- ✅ Transparency: All decisions logged
- ✅ Verifiability: Evidence bundles downloadable
- ✅ Safety: Strict thresholds enforced
- ✅ Responsibility: Human oversight required for critical actions

**What it IS:**
- Intelligence dashboard
- Multi-agent analysis system
- Evidence generation platform

**What it IS NOT:**
- Financial advisor
- Autonomous trading bot
- Execution platform

---

## 🔗 Related Documentation

- [README.md](./README.md) - Main documentation
- [CORTENSOR_INTEGRATION.md](./CORTENSOR_INTEGRATION.md) - Technical integration guide
- [.env.example](./.env.example) - Configuration template

---

**Last Updated:** February 25, 2026  
**Version:** 1.0.0
