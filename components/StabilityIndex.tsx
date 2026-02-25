"use client"

import { motion } from "framer-motion"
import { Activity, GitBranch, TrendingUp } from "lucide-react"
import { ArbitrationBundle } from "@/lib/types"

interface StabilityIndexProps {
  bundle: ArbitrationBundle
}

export function StabilityIndex({ bundle }: StabilityIndexProps) {
  // Calculate consensus stability (0-100%)
  const consensusStability = bundle.disagreement_analysis.agreementScore

  // Calculate agent divergence based on risk score difference
  const riskDiff = Math.abs(bundle.agent_a_result.riskScore - bundle.agent_b_result.riskScore)
  const divergenceLevel = riskDiff < 10 ? "Low" : riskDiff < 25 ? "Medium" : "High"
  const divergenceColor = 
    divergenceLevel === "Low" ? "text-cyan-400" : 
    divergenceLevel === "Medium" ? "text-yellow-400" : 
    "text-red-400"

  // Calculate run variability (variance between runs)
  const avgConfidence = (bundle.agent_a_result.confidence + bundle.agent_b_result.confidence) / 2
  const confidenceDiff = Math.abs(bundle.agent_a_result.confidence - bundle.agent_b_result.confidence)
  const runVariability = (confidenceDiff / avgConfidence) * 100

  const getStabilityColor = (score: number) => {
    if (score >= 80) return "text-cyan-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getStabilityRing = (score: number) => {
    if (score >= 80) return "ring-cyan-500/30"
    if (score >= 60) return "ring-yellow-500/30"
    return "ring-red-500/30"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-effect p-6 rounded-lg border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Consensus Stability Index</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consensus Stability */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border ${getStabilityRing(consensusStability)}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-4 h-4 ${getStabilityColor(consensusStability)}`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Consensus Stability</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
            className="flex items-baseline gap-2"
          >
            <span className={`text-3xl font-bold ${getStabilityColor(consensusStability)}`}>
              {consensusStability.toFixed(0)}
            </span>
            <span className="text-lg text-muted-foreground">%</span>
          </motion.div>
          <p className="text-xs text-muted-foreground mt-2">
            {consensusStability >= 80 ? "High confidence" : consensusStability >= 60 ? "Moderate confidence" : "Low confidence"}
          </p>
        </motion.div>

        {/* Agent Divergence */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className={`w-4 h-4 ${divergenceColor}`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Agent Divergence</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            className="flex items-baseline gap-2"
          >
            <span className={`text-3xl font-bold ${divergenceColor}`}>
              {divergenceLevel}
            </span>
          </motion.div>
          <p className="text-xs text-muted-foreground mt-2">
            Risk delta: {riskDiff.toFixed(1)} points
          </p>
        </motion.div>

        {/* Run Variability */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Run Variability</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-3xl font-bold text-indigo-400">
              {runVariability.toFixed(1)}
            </span>
            <span className="text-lg text-muted-foreground">%</span>
          </motion.div>
          <p className="text-xs text-muted-foreground mt-2">
            {bundle.redundant_inference_runs} inference runs
          </p>
        </motion.div>
      </div>

      {/* Additional Context */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 pt-4 border-t border-white/5"
      >
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span>Cross-run validated: {bundle.cross_run_consistency ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Validator score: {bundle.validator_score.overallScore.toFixed(1)}/100</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
