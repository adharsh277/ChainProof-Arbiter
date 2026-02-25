# 🚀 ChainProof Arbiter - Quick Start Guide

## ⚡ Fast Setup (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000
```

---

## 🎮 How to Use

### Step 1: Enter a Query
In the **Query Console** on the left, choose a query type:
- **Token Safety**: "Is 0x... token safe?"
- **Transaction Analysis**: "Analyze transaction 0x... for MEV"
- **Contract Audit**: "Audit this contract for vulnerabilities"

### Step 2: Watch the Workflow
The **Agent Activity Timeline** shows real-time execution:
1. Task received
2. Agents delegated
3. Redundant inference runs (PoI)
4. Agreement detected
5. Validation scoring (PoUW)
6. Final arbitration decision

### Step 3: Review Results
Once complete, you'll see:

- **Trust Gauge**: Animated confidence % with risk level
- **Disagreement Indicator**: Agent agreement status
- **Arbitration Report**: Detailed analysis breakdown
- **Evidence Explorer**: Full JSON proof (downloadable)

---

## 🔧 Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linting checks
npm run lint
```

---

## 📊 What Each UI Section Does

### Query Console (Top Left)
- Select analysis type
- Enter your query
- See quick examples
- Submit for analysis

### Agent Activity Timeline (Bottom Left)
- Real-time event stream
- Shows agent names & actions
- Status indicators
- Timestamps

### Trust Gauge (Top Right)
- Animated confidence percentage
- Color-coded risk level
- Final decision badge

### Disagreement Indicator (Next to Gauge)
- Shows if agents agreed
- Agreement confidence score
- Overall reasoning

### Arbitration Report (Tab 1)
- Executive summary
- Scoring breakdown by criteria
- Agent comparison
- Evidence metadata

### Evidence Explorer (Tab 2)
- Detailed results view
- Agent findings
- Validator details
- Download/Copy JSON

---

## 🤖 Under the Hood

### The 5-Stage Workflow

```
STAGE 1: Coordinator Planning
├─ Receives user query
└─ Plans analysis strategy

STAGE 2: Agent Delegation
├─ Risk Analysis Agent activated
└─ Contract Behavior Agent activated

STAGE 3: Redundant Inference (PoI)
├─ Agent A runs 2x (cross-run comparison)
├─ Agent B runs 2x (cross-run comparison)
└─ Calculate consistency scores

STAGE 4: Disagreement Detection
├─ Compare agent outputs
├─ Check if difference > threshold
└─ Flag if disagreement

STAGE 5: Validation & Arbitration (PoUW)
├─ Apply rubric scoring
├─ Calculate overall score
├─ Generate final decision
└─ Create structured proof bundle
```

---

## 📦 Sample Analysis Query

**Input:**
```
Query: "Is this token safe for trading?"
Type: token-safety
```

**Output Bundle:**
```json
{
  "taskId": "task-1740484967484-abc123def",
  "final_decision": "Medium Risk",
  "confidence": 0.89,
  "agent_a_result": {
    "riskScore": 42.3,
    "confidence": 0.85,
    "findings": ["Centralized minting", "Unusual patterns"]
  },
  "agent_b_result": {
    "riskScore": 38.7,
    "confidence": 0.88,
    "findings": ["Unusual fees", "Access issues"]
  },
  "validator_score": 9.25,
  "evidence": {
    "cross_run_consistency": true,
    "rubric_used": "risk-assessment-v1"
  }
}
```

---

## 🎯 Example Queries to Try

### Token Safety:
```
Is 0x1234567890123456789012345678901234567890 token safe for trading?
```

### Transaction Analysis:
```
Analyze transaction 0xabcd1234... for suspicious patterns and MEV extraction
```

### Contract Audit:
```
Audit this smart contract for vulnerabilities and security issues
```

_(Click "Quick Examples" to auto-fill)_

---

## 🔌 Real Cortensor Integration

Currently using mock agents. To connect real Cortensor:

1. **Update lib/agents.ts:**
   ```typescript
   import { CortensorRouter } from "@cortensor/sdk"
   
   const router = new CortensorRouter(process.env.CORTENSOR_API_KEY)
   
   export async function runAgentAnalysis(agent, query, type) {
     return await router.inference({
       model: agent,
       input: { query, type },
       redundantRuns: 2,
     })
   }
   ```

2. **Add environment variables:**
   ```
   CORTENSOR_API_KEY=your_key_here
   CORTENSOR_ROUTER_ADDRESS=0x...
   ```

3. **Connect blockchain RPC:**
   ```typescript
   import { ethers } from "ethers"
   const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
   ```

---

## 📊 Performance Tips

- **Large queries**: May take 5-10 seconds (intentional for agent coordination)
- **Timeline**: Shows every step in real-time
- **Memory**: Stores last 10 analyses in browser
- **Data**: All proofs are exportable

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill existing process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Build Fails
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
# Check types
npm run lint
```

---

## 📚 Architecture Overview

```
ChainProof Arbiter
├── Frontend Layer
│   ├── Query Console (input)
│   ├── Timeline View (visualization)
│   ├── Results Dashboard (output)
│   └── Evidence Explorer (proof)
│
├── API Layer
│   └── /api/analyze (orchestration)
│
├── Agent Layer
│   ├── Coordinator
│   ├── Risk Analysis Agent
│   ├── Contract Behavior Agent
│   └── Transaction Pattern Agent
│
└── Infrastructure Layer
    ├── Mock Cortensor (ready for real API)
    ├── Redundant Inference (PoI)
    └── Validator Scoring (PoUW)
```

---

## 🎓 Key Concepts

### Proof of Insight (PoI)
- Multiple inference runs of same agent
- Consistency scoring across runs
- Verifies computation reliability

### Proof of Unbiased Work (PoUW)
- Rubric-based evaluation framework
- Multiple scoring criteria
- Transparent justification

### Arbitration Bundle
- Structured JSON proof artifact
- Complete audit trail
- Downloadable evidence

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted
```bash
npm run build
npm start
```

---

## 📞 Support

For questions or issues:
1. Check this guide
2. Review code comments
3. See SUBMISSION_SUMMARY.md for architecture
4. Check README.md for detailed docs

---

## ✨ Next Steps

After running locally:

1. **Try different queries** to see how agents respond
2. **Download evidence bundles** to see JSON structure
3. **Explore the timeline** to understand the workflow
4. **Read the code** to see implementation details
5. **Integrate Cortensor API** for production use

---

**Happy analyzing! 🚀**
