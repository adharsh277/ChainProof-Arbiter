"use client"

import { motion } from "framer-motion"
import { Grid } from "lucide-react"
import { ArbitrationBundle } from "@/lib/types"

interface DisagreementHeatmapProps {
  bundle: ArbitrationBundle
}

export function DisagreementHeatmap({ bundle }: DisagreementHeatmapProps) {
  const agentA = bundle.agent_a_result
  const agentB = bundle.agent_b_result

  // Calculate differences
  const riskDiff = Math.abs(agentA.riskScore - agentB.riskScore)
  
  // Calculate behavioral difference (based on findings overlap)
  const uniqueFindingsA = agentA.findings.filter(
    (f) => !agentB.findings.some((bf) => bf.toLowerCase().includes(f.toLowerCase().split(" ")[0]))
  ).length
  const uniqueFindingsB = agentB.findings.filter(
    (f) => !agentA.findings.some((af) => af.toLowerCase().includes(f.toLowerCase().split(" ")[0]))
  ).length
  const behaviorDiff = ((uniqueFindingsA + uniqueFindingsB) / (agentA.findings.length + agentB.findings.length)) * 100

  // Validator difference (based on validator score deviation)
  const validatorDiff = Math.abs(100 - bundle.validator_score.overallScore)

  const getDiffColor = (diff: number) => {
    if (diff < 5) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (diff < 15) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getDiffIntensity = (diff: number) => {
    if (diff < 5) return 0.2
    if (diff < 15) return 0.5
    return 0.8
  }

  const agents = [
    { id: "risk", name: "Risk", shortName: "Risk" },
    { id: "behavior", name: "Behavior", shortName: "Behavior" },
    { id: "validator", name: "Validator", shortName: "Validator" },
  ]

  const matrix = [
    [null, riskDiff, validatorDiff * 0.5],
    [riskDiff, null, behaviorDiff * 0.4],
    [validatorDiff * 0.5, behaviorDiff * 0.4, null],
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-effect p-6 rounded-lg border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-secondary/10">
          <Grid className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Multi-Agent Disagreement Heatmap</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Divergence analysis across agent dimensions</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header row */}
          <div className="flex items-center mb-2">
            <div className="w-24" /> {/* Empty corner */}
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="w-24 text-center"
              >
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {agent.shortName}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Matrix rows */}
          {agents.map((rowAgent, rowIndex) => (
            <div key={rowAgent.id} className="flex items-center mb-2">
              {/* Row label */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + rowIndex * 0.1 }}
                className="w-24 text-right pr-4"
              >
                <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                  {rowAgent.shortName}
                </span>
              </motion.div>

              {/* Matrix cells */}
              {agents.map((colAgent, colIndex) => {
                const value = matrix[rowIndex][colIndex]
                const isNull = value === null

                return (
                  <motion.div
                    key={`${rowAgent.id}-${colAgent.id}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.7 + (rowIndex * agents.length + colIndex) * 0.05,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ scale: isNull ? 1 : 1.1 }}
                    className="w-24 h-16 flex items-center justify-center mx-0.5"
                  >
                    {isNull ? (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                        <span className="text-lg text-muted-foreground/30">—</span>
                      </div>
                    ) : (
                      <div 
                        className={`w-full h-full flex flex-col items-center justify-center rounded-lg border ${getDiffColor(value || 0)} relative overflow-hidden`}
                        style={{
                          backgroundColor: `rgba(172, 47, 255, ${getDiffIntensity(value || 0) * 0.3})`
                        }}
                      >
                        <motion.div
                          animate={{
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0"
                        />
                        <span className="text-xl font-bold relative z-10">
                          {value?.toFixed(0)}
                        </span>
                        <span className="text-xs relative z-10">%</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-4 pt-4 border-t border-white/5 flex items-center gap-6 text-xs"
      >
        <span className="text-muted-foreground">Divergence Level:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          <span className="text-muted-foreground">Low (&lt;5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30" />
          <span className="text-muted-foreground">Medium (5-15%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          <span className="text-muted-foreground">High (&gt;15%)</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
