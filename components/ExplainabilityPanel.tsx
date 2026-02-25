"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, AlertTriangle, GitCompare, Hash } from "lucide-react"
import { ArbitrationBundle } from "@/lib/types"

interface ExplainabilityPanelProps {
  bundle: ArbitrationBundle
}

export function ExplainabilityPanel({ bundle }: ExplainabilityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Extract top 3 risk drivers from agent findings
  const allFindings = [...bundle.agent_a_result.findings, ...bundle.agent_b_result.findings]
  const topRiskDrivers = allFindings
    .filter((finding, index, self) => self.indexOf(finding) === index) // Deduplicate
    .slice(0, 3)

  // Generate evidence hash (mock - in production this would be a real cryptographic hash)
  const evidenceHash = `0x${bundle.taskId.substring(0, 16)}...${bundle.taskId.substring(bundle.taskId.length - 8)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-effect rounded-lg border border-white/10 overflow-hidden"
    >
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-base">
              Why {bundle.final_decision}?
            </h3>
            <p className="text-xs text-muted-foreground">
              {isExpanded ? "Hide" : "View"} detailed risk analysis & evidence trail
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-6">
              {/* Top 3 Risk Drivers */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Top Risk Drivers
                  </h4>
                </div>
                <div className="space-y-3">
                  {topRiskDrivers.map((driver, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold border border-red-500/30">
                        {index + 1}
                      </div>
                      <p className="text-sm text-foreground flex-1">{driver}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Agent Disagreement Reasoning */}
              {bundle.disagreement_analysis.disagreementReason && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <GitCompare className="w-4 h-4 text-yellow-400" />
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Multi-Agent Disagreement Analysis
                    </h4>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-sm text-foreground italic">
                      &ldquo;{bundle.disagreement_analysis.disagreementReason}&rdquo;
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Agreement Score: <span className="text-yellow-400 font-semibold">{bundle.disagreement_analysis.agreementScore}%</span></span>
                      <span>•</span>
                      <span>Status: <span className="text-yellow-400 font-semibold">{bundle.disagreement_analysis.agreement ? "Aligned" : "Diverged"}</span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Supporting Evidence Hash */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Supporting Evidence Trail
                  </h4>
                </div>
                <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Evidence Hash:</span>
                      <code className="text-xs font-mono text-cyan-400">{evidenceHash}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Proof Type:</span>
                      <span className="text-xs font-semibold text-foreground uppercase">{bundle.proof_metadata.proof_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Validator Runs:</span>
                      <span className="text-xs font-semibold text-foreground">{bundle.evidence.validator_runs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Cross-Run Consistency:</span>
                      <span className={`text-xs font-semibold ${bundle.cross_run_consistency ? 'text-cyan-400' : 'text-red-400'}`}>
                        {bundle.cross_run_consistency ? "Verified ✓" : "Failed ✗"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Validator Rubric Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4 border-t border-white/5"
              >
                <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">
                  Validator Scoring Criteria
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(bundle.validator_score.criteriaRated).map(([criterion, score], index) => (
                    <motion.div
                      key={criterion}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="flex items-center justify-between p-2 rounded bg-white/5"
                    >
                      <span className="text-xs text-muted-foreground capitalize">{criterion.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold text-secondary">{score}/10</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
