"use client"

import { motion } from "framer-motion"
import { AgentAnalysis } from "@/lib/types"

interface CrossRunComparisonProps {
  agentA: AgentAnalysis
  agentB: AgentAnalysis
}

export function CrossRunComparison({ agentA, agentB }: CrossRunComparisonProps) {
  const riskDiff = Math.abs(agentA.riskScore - agentB.riskScore)
  const avgScore = (agentA.riskScore + agentB.riskScore) / 2
  const semanticAlignment = Math.max(0, 100 - riskDiff * 2)

  // Find common findings
  const commonFindings = agentA.findings.filter((f) =>
    agentB.findings.some(
      (bf) =>
        bf.toLowerCase().includes(f.toLowerCase().split(" ")[0]) ||
        f.toLowerCase().includes(bf.toLowerCase().split(" ")[0])
    )
  )

  // Find unique findings
  const uniqueA = agentA.findings.filter(
    (f) =>
      !agentB.findings.some(
        (bf) =>
          bf.toLowerCase().includes(f.toLowerCase().split(" ")[0]) ||
          f.toLowerCase().includes(bf.toLowerCase().split(" ")[0])
      )
  )

  const uniqueB = agentB.findings.filter(
    (f) =>
      !agentA.findings.some(
        (af) =>
          af.toLowerCase().includes(f.toLowerCase().split(" ")[0]) ||
          f.toLowerCase().includes(af.toLowerCase().split(" ")[0])
      )
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Semantic Alignment Score */}
      <motion.div variants={itemVariants} className="glass-effect p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm">Semantic Alignment</h4>
          <span className="text-xl font-bold gradient-text">{semanticAlignment.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${semanticAlignment}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Risk score variance: {riskDiff.toFixed(1)} points • Average: {avgScore.toFixed(1)}/100
        </p>
      </motion.div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Risk Analysis", agent: agentA },
          { label: "Contract Behavior", agent: agentB },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="glass-effect p-4 rounded-lg hover-lift glow-border"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-primary">{item.label}</h4>
              <motion.div
                className="text-2xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span
                  style={{
                    color: item.agent.riskScore < 33 ? "#22d3ee" : 
                           item.agent.riskScore < 66 ? "#f59e0b" : "#ef4444",
                  }}
                >
                  {item.agent.riskScore.toFixed(1)}
                </span>
              </motion.div>
            </div>

            {/* Score bar */}
            <div className="mb-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Risk Level</span>
                <span>{(item.agent.confidence * 100).toFixed(0)}% confidence</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.agent.riskScore / 100) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                />
              </div>
            </div>

            {/* Findings */}
            <div className="pt-3 border-t border-border/20 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Critical Findings:</p>
              <motion.ul
                className="space-y-1 text-xs"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {item.agent.findings.slice(0, 2).map((finding, i) => (
                  <motion.li
                    key={i}
                    variants={itemVariants}
                    className="flex gap-2 text-foreground/70"
                  >
                    <span className="text-primary">→</span>
                    <span className="line-clamp-2">{finding}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Common & Unique Findings */}
      <div className="grid grid-cols-3 gap-4">
        {/* Common */}
        <motion.div variants={itemVariants} className="glass-effect p-4 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-cyan-400">Common</h4>
            <motion.div
              className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-1 rounded"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {commonFindings.length}
            </motion.div>
          </div>
          <motion.ul className="space-y-1 text-xs">
            {commonFindings.map((finding, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-cyan-400/70 line-clamp-2 flex gap-1"
              >
                <span>✓</span>
                <span>{finding}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Unique A */}
        <motion.div variants={itemVariants} className="glass-effect p-4 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-cyan-400">Agent A Only</h4>
            <motion.div
              className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-1 rounded"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              {uniqueA.length}
            </motion.div>
          </div>
          <motion.ul className="space-y-1 text-xs">
            {uniqueA.map((finding, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-cyan-400/70 line-clamp-2 flex gap-1"
              >
                <span>→</span>
                <span>{finding}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Unique B */}
        <motion.div variants={itemVariants} className="glass-effect p-4 rounded-lg border border-indigo-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-indigo-400">Agent B Only</h4>
            <motion.div
              className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-1 rounded"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            >
              {uniqueB.length}
            </motion.div>
          </div>
          <motion.ul className="space-y-1 text-xs">
            {uniqueB.map((finding, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-indigo-400/70 line-clamp-2 flex gap-1"
              >
                <span>→</span>
                <span>{finding}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </motion.div>
  )
}
