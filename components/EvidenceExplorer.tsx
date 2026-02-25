"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArbitrationBundle } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check } from "lucide-react"

interface EvidenceExplorerProps {
  bundle: ArbitrationBundle
}

export function EvidenceExplorer({ bundle }: EvidenceExplorerProps) {
  const [copied, setCopied] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("summary")

  const handleDownload = () => {
    const dataStr = JSON.stringify(bundle, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `arbitration-bundle-${bundle.taskId}.json`
    link.click()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sections = [
    {
      id: "summary",
      title: "Executive Summary",
      icon: "📋",
    },
    {
      id: "agents",
      title: "Agent Results",
      icon: "🤖",
    },
    {
      id: "validation",
      title: "Validation Details",
      icon: "✓ ",
    },
    {
      id: "evidence",
      title: "Evidence Bundle",
      icon: "📦",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="font-semibold text-lg">Evidence Explorer</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy JSON
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => setExpandedSection(section.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              expandedSection === section.id
                ? "bg-primary text-primary-foreground neon-glow"
                : "glass-effect text-muted-foreground hover:text-foreground"
            }`}
          >
            {section.icon} {section.title}
          </motion.button>
        ))}
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {expandedSection === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-effect p-6 rounded-lg space-y-3"
          >
            <h4 className="font-semibold">Analysis Summary</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Task ID:</span>
                <span className="font-mono ml-2 text-accent">{bundle.taskId}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-mono ml-2 text-accent">
                  {new Date(bundle.timestamp).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Final Decision:</span>
                <span className="font-semibold ml-2 gradient-text">{bundle.final_decision}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-semibold ml-2 text-primary">
                  {(bundle.confidence * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {expandedSection === "agents" && (
          <motion.div
            key="agents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {[
              { label: "Risk Analysis Agent", data: bundle.agent_a_result },
              { label: "Contract Behavior Agent", data: bundle.agent_b_result },
            ].map((agent, index) => (
              <motion.div
                key={index}
                className="glass-effect p-4 rounded-lg space-y-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div>
                  <h4 className="font-semibold text-primary">{agent.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{agent.data.agent}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Risk Score</span>
                    <p className="font-semibold text-lg">
                      {agent.data.riskScore.toFixed(1)}/100
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence</span>
                    <p className="font-semibold text-lg">
                      {(agent.data.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timestamp</span>
                    <p className="font-mono text-xs">
                      {new Date(agent.data.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/20">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Findings:</p>
                  <ul className="text-xs space-y-1">
                    {agent.data.findings.map((finding, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">→</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {expandedSection === "validation" && (
          <motion.div
            key="validation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-effect p-6 rounded-lg space-y-4"
          >
            <div>
              <h4 className="font-semibold mb-3">Rubric Scoring ({bundle.validator_score.rubricUsed})</h4>
              <div className="space-y-3">
                {Object.entries(bundle.validator_score.criteriaRated).map(
                  ([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize">{key.replace("-", " ")}</span>
                        <span className="font-semibold text-primary">{value.toFixed(1)}/10</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border/20">
                <p className="text-sm text-muted-foreground mb-2">Justification:</p>
                <p className="text-sm">{bundle.validator_score.justification}</p>
              </div>
            </div>
          </motion.div>
        )}

        {expandedSection === "evidence" && (
          <motion.div
            key="evidence"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-effect p-6 rounded-lg space-y-4"
          >
            <h4 className="font-semibold">Proof Metadata</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proof Type:</span>
                <span className="font-mono capitalize">{bundle.proof_metadata.proof_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-mono">{bundle.proof_metadata.proof_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validator Runs:</span>
                <span className="font-mono">{bundle.evidence.validator_runs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cross-run Consistency:</span>
                <span className="font-mono">
                  {bundle.evidence.cross_run_consistency ? "✓ Verified" : "✗ Failed"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agreement Threshold:</span>
                <span className="font-mono">{bundle.evidence.agreement_threshold}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actual Agreement:</span>
                <span className="font-mono">{bundle.evidence.actual_agreement}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
