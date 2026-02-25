"use client"

import { motion } from "framer-motion"
import { ArbitrationBundle } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

interface ArbitrationReportProps {
  bundle: ArbitrationBundle
}

export function ArbitrationReport({ bundle }: ArbitrationReportProps) {
  const criteria = bundle.validator_score.criteriaRated

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-effect p-6 rounded-lg space-y-4"
      >
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Final Decision
          </h3>
          <p className="text-2xl font-bold gradient-text mt-2">{bundle.final_decision}</p>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed">
          {bundle.agent_a_result.analysis}
        </p>
      </motion.div>

      {/* Scoring Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-effect p-6 rounded-lg space-y-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Validation Scoring (Rubric: {bundle.validator_score.rubricUsed})
        </h3>

        <div className="space-y-4">
          {Object.entries(criteria).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm capitalize text-foreground/80">
                  {key.replace("-", " ")}
                </span>
                <span className="text-sm font-semibold text-primary">{value.toFixed(1)}/10</span>
              </div>
              <Progress value={(value / 10) * 100} className="h-2" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4 border-t border-border/20"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold">Overall Validator Score</span>
            <span className="text-lg font-bold gradient-text">
              {bundle.validator_score.overallScore.toFixed(1)}/10
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {bundle.validator_score.justification}
          </p>
        </motion.div>
      </motion.div>

      {/* Agent Analysis Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Risk Analysis Agent", data: bundle.agent_a_result },
          { label: "Contract Behavior Agent", data: bundle.agent_b_result },
        ].map((agent, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="glass-effect p-4 rounded-lg space-y-3"
          >
            <div className="text-xs font-semibold text-primary uppercase">
              {agent.label}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Risk Score</span>
                <span className="font-semibold">{agent.data.riskScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span className="font-semibold">{(agent.data.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="pt-2 border-t border-border/20">
                <p className="text-xs text-muted-foreground mb-2">Findings:</p>
                <ul className="text-xs space-y-1">
                  {agent.data.findings.slice(0, 3).map((finding, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-foreground/70">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Evidence Metadata */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-effect p-4 rounded-lg"
      >
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
          Evidence Metadata
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Proof Type</span>
            <p className="font-semibold text-foreground mt-1 capitalize">
              {bundle.proof_metadata.proof_type}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Validator Runs</span>
            <p className="font-semibold text-foreground mt-1">
              {bundle.evidence.validator_runs}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Agreement Threshold</span>
            <p className="font-semibold text-foreground mt-1">
              {bundle.evidence.agreement_threshold}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Cross-run Consistency</span>
            <p className="font-semibold text-foreground mt-1">
              {bundle.evidence.cross_run_consistency ? "✓ Verified" : "✗ Inconsistent"}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
