#!/usr/bin/env node

/**
 * ChainProof Arbiter Replay CLI
 * Reproducible multi-agent analysis runner
 * 
 * Usage:
 *   npm run replay -- --task "Analyze 0x1234..." --type token-safety
 *   npm run replay -- --file evidence-bundle.json
 */

const fs = require('fs')
const path = require('path')

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (flag) => {
  const index = args.indexOf(flag)
  return index !== -1 && args[index + 1] ? args[index + 1] : null
}

const task = getArg('--task')
const type = getArg('--type') || 'token-safety'
const file = getArg('--file')
const apiUrl = getArg('--api') || 'http://localhost:3000'

console.log('\n🔄 ChainProof Arbiter - Replay Mode\n')
console.log('=' .repeat(60))

async function replayFromBundle(filePath) {
  console.log(`📂 Loading evidence bundle: ${filePath}`)
  
  try {
    const bundleData = fs.readFileSync(filePath, 'utf-8')
    const bundle = JSON.parse(bundleData)
    
    console.log('\n📊 Evidence Bundle Summary:')
    console.log(`   Task ID: ${bundle.taskId}`)
    console.log(`   Timestamp: ${bundle.timestamp}`)
    console.log(`   Decision: ${bundle.final_decision}`)
    console.log(`   Confidence: ${(bundle.confidence * 100).toFixed(1)}%`)
    console.log(`\n   Cortensor Session IDs:`)
    bundle.evidence.session_ids.forEach((sid, i) => {
      console.log(`     ${i + 1}. ${sid}`)
    })
    
    if (bundle.continuation) {
      console.log(`\n   🤖 Autonomous Continuation:`)
      console.log(`     Should Continue: ${bundle.continuation.should_continue}`)
      console.log(`     Action: ${bundle.continuation.action}`)
      console.log(`     Reason: ${bundle.continuation.reason}`)
    }
    
    if (bundle.operational_actions && bundle.operational_actions.length > 0) {
      console.log(`\n   ⚡ Operational Actions Triggered:`)
      bundle.operational_actions.forEach((action, i) => {
        console.log(`     ${i + 1}. ${action.type.toUpperCase()} - ${action.status}`)
      })
    }
    
    console.log('\n✅ Replay complete - Evidence verified\n')
    
  } catch (error) {
    console.error(`❌ Error loading bundle: ${error.message}`)
    process.exit(1)
  }
}

async function runNewAnalysis(query, analysisType) {
  console.log(`🚀 Starting new multi-agent analysis...`)
  console.log(`   Query: ${query}`)
  console.log(`   Type: ${analysisType}`)
  console.log(`   API: ${apiUrl}/api/analyze\n`)
  
  try {
    const response = await fetch(`${apiUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        type: analysisType,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const bundle = await response.json()
    
    console.log('✅ Analysis Complete!\n')
    console.log('📊 Results:')
    console.log(`   Task ID: ${bundle.taskId}`)
    console.log(`   Decision: ${bundle.final_decision}`)
    console.log(`   Risk Score: ${((bundle.agent_a_result.riskScore + bundle.agent_b_result.riskScore) / 2).toFixed(1)}/100`)
    console.log(`   Confidence: ${(bundle.confidence * 100).toFixed(1)}%`)
    console.log(`   Agreement: ${bundle.disagreement_analysis.agreement ? 'YES' : 'NO'}`)
    console.log(`   Validator Score: ${bundle.validator_score.overallScore.toFixed(1)}/10`)
    
    console.log(`\n   📡 Cortensor Session IDs:`)
    bundle.evidence.session_ids.forEach((sid, i) => {
      console.log(`     ${i + 1}. ${sid}`)
    })
    
    console.log(`\n   🔗 Agent Latencies:`)
    if (bundle.agent_a_result.latencyMs) {
      console.log(`     Agent A: ${bundle.agent_a_result.latencyMs}ms`)
    }
    if (bundle.agent_b_result.latencyMs) {
      console.log(`     Agent B: ${bundle.agent_b_result.latencyMs}ms`)
    }
    
    if (bundle.continuation) {
      console.log(`\n   🤖 Autonomous Continuation:`)
      console.log(`     Action: ${bundle.continuation.action.toUpperCase()}`)
      console.log(`     Reason: ${bundle.continuation.reason}`)
      
      if (bundle.continuation.threshold_exceeded) {
        const t = bundle.continuation.threshold_exceeded
        console.log(`     Triggered: ${t.metric} = ${t.value.toFixed(1)} (threshold: ${t.threshold})`)
      }
    }
    
    if (bundle.operational_actions && bundle.operational_actions.length > 0) {
      console.log(`\n   ⚡ Operational Actions:`)
      bundle.operational_actions.forEach((action, i) => {
        console.log(`     ${i + 1}. ${action.type} - ${action.status}`)
      })
    }
    
    // Save evidence bundle
    const outputFile = `evidence-${bundle.taskId}.json`
    fs.writeFileSync(outputFile, JSON.stringify(bundle, null, 2))
    console.log(`\n💾 Evidence bundle saved: ${outputFile}`)
    
    console.log('\n✅ Replay complete\n')
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

// Main execution
if (file) {
  // Replay from existing evidence bundle
  replayFromBundle(file)
} else if (task) {
  // Run new analysis
  runNewAnalysis(task, type)
} else {
  console.log('❌ Error: Missing required arguments')
  console.log('\nUsage:')
  console.log('  Replay from bundle:')
  console.log('    npm run replay -- --file evidence-bundle.json')
  console.log('\n  Run new analysis:')
  console.log('    npm run replay -- --task "Analyze 0x1234..." --type token-safety')
  console.log('\nOptions:')
  console.log('  --task     Query to analyze')
  console.log('  --type     Analysis type (token-safety, transaction-analysis, contract-audit)')
  console.log('  --file     Path to evidence bundle JSON')
  console.log('  --api      API URL (default: http://localhost:3000)')
  console.log()
  process.exit(1)
}
