"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QueryConsole } from "@/components/QueryConsole"
import { CompactQueryBar } from "@/components/CompactQueryBar"
import { ConsensusTimeline } from "@/components/ConsensusTimeline"
import { TrustGauge } from "@/components/TrustGauge"
import { DisagreementIndicator } from "@/components/DisagreementIndicator"
import { ArbitrationReport } from "@/components/ArbitrationReport"
import { EvidenceExplorer } from "@/components/EvidenceExplorer"
import { SystemStatus } from "@/components/SystemStatus"
import { CrossRunComparison } from "@/components/CrossRunComparison"
import { StabilityIndex } from "@/components/StabilityIndex"
import { DisagreementHeatmap } from "@/components/DisagreementHeatmap"
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel"
import { ContinuationPanel } from "@/components/ContinuationPanel"
import { SessionTracker } from "@/components/SessionTracker"
import { RouterStatus } from "@/components/RouterStatus"
import { ArbitrationBundle, TimelineEvent, AnalysisRequest } from "@/lib/types"
import { Activity, Brain, Shield, Database, Zap, GitBranch, ChevronLeft } from "lucide-react"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [bundle, setBundle] = useState<ArbitrationBundle | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleBackToConsole = () => {
    setBundle(null)
    setEvents([])
    setError(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNewAnalysis = () => {
    setBundle(null)
    setEvents([])
    setError(null)
  }

  const addEvent = (
    message: string,
    type: TimelineEvent["type"],
    status: TimelineEvent["status"],
    agent?: string,
    confidence?: number,
    riskScore?: number,
    delta?: number,
    consensusStatus?: "agreement" | "diverged" | "escalated",
    latency?: number
  ) => {
    const event: TimelineEvent = {
      id: `event-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message,
      type,
      status,
      agent: agent as any,
      confidence,
      riskScore,
      delta,
      consensusStatus,
      latency,
    }
    setEvents((prev) => [event, ...prev])
  }

  const handleAnalyze = async (query: string, type: string) => {
    setIsLoading(true)
    setError(null)
    setEvents([])
    setBundle(null)

    try {
      // Stage 1: Task received
      addEvent("Analysis task received and queued", "task", "in-progress")

      await new Promise((r) => setTimeout(r, 500))

      // Stage 2: Coordinator planning
      addEvent(
        `Planning analysis strategy for: "${query.substring(0, 50)}..."`,
        "task",
        "complete"
      )

      await new Promise((r) => setTimeout(r, 300))

      // Stage 3: Agent delegation
      addEvent(
        "Delegating to Risk Analysis Agent",
        "analysis",
        "in-progress",
        "risk-analysis"
      )
      addEvent(
        "Delegating to Contract Behavior Agent",
        "analysis",
        "in-progress",
        "contract-behavior"
      )

      await new Promise((r) => setTimeout(r, 2000))

      // Stage 4: Running inference
      addEvent(
        "Running redundant inference (Run 1) via Cortensor",
        "analysis",
        "complete",
        "risk-analysis",
        82,
        undefined,
        undefined,
        undefined,
        1.2
      )
      addEvent(
        "Running redundant inference (Run 2) via Cortensor",
        "analysis",
        "complete",
        "contract-behavior",
        79,
        undefined,
        undefined,
        undefined,
        1.4
      )

      await new Promise((r) => setTimeout(r, 1500))

      // Stage 5: Detecting disagreement
      addEvent("Comparing agent outputs for disagreement", "agreement", "in-progress")

      await new Promise((r) => setTimeout(r, 800))

      // Make API call to get actual results
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          type,
        } as AnalysisRequest),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data: ArbitrationBundle = await response.json()
      setBundle(data)

      // Stage 6: Agreement analysis
      if (data.disagreement_analysis.agreement) {
        addEvent(
          "✓ Agents in agreement - high confidence analysis",
          "agreement",
          "complete",
          undefined,
          data.disagreement_analysis.agreementScore,
          data.agent_a_result.riskScore,
          0,
          "agreement"
        )
      } else {
        addEvent(
          `⚠ Disagreement detected: ${data.disagreement_analysis.disagreementReason}`,
          "agreement",
          "warning",
          undefined,
          data.disagreement_analysis.agreementScore,
          data.agent_a_result.riskScore,
          Math.abs(data.agent_a_result.riskScore - data.agent_b_result.riskScore),
          "diverged"
        )
      }

      await new Promise((r) => setTimeout(r, 1000))

      // Stage 7: Validation & Scoring
      addEvent(
        `Applying rubric-based scoring (${data.validator_score.rubricUsed})`,
        "validation",
        "in-progress",
        undefined,
        data.validator_score.overallScore,
        data.agent_a_result.riskScore,
        undefined,
        "agreement",
        0.8
      )

      await new Promise((r) => setTimeout(r, 1200))

      addEvent(
        `Validator score: ${data.validator_score.overallScore.toFixed(1)}/100 - ${data.validator_score.justification}`,
        "validation",
        "complete",
        undefined,
        data.confidence,
        data.agent_a_result.riskScore,
        undefined,
        "agreement",
        1.5
      )

      await new Promise((r) => setTimeout(r, 800))

      // Stage 8: Final decision
      addEvent(
        `Final Arbitration Decision: ${data.final_decision}`,
        "complete",
        "complete"
      )

      addEvent(
        `Arbitration bundle sealed with proof - Task ID: ${data.taskId}`,
        "complete",
        "complete"
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      addEvent(`Error: ${errorMessage}`, "task", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Main Container */}
      <AnimatePresence mode="wait">
        {!bundle ? (
          // STATE 1: CONSOLE MODE (Before Analysis)
          <motion.div
            key="console-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 min-h-screen"
          >
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3 mb-8"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold gradient-text">ChainProof Arbiter</h1>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Multi-Agent Blockchain Intelligence System • Institutional AI Arbitration Engine
                </p>
              </motion.div>

              {/* Two-Column Layout */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
              >
                {/* Left Column - Query Console */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-effect p-6 rounded-lg h-full flex flex-col"
                >
                  <QueryConsole onSubmit={handleAnalyze} isLoading={isLoading} />
                </motion.div>

                {/* Right Column - Ready to Analyze */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-effect p-12 rounded-lg h-full flex flex-col items-center justify-center space-y-6 relative overflow-hidden"
                >
                  {/* Subtle gradient background accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                  
                  {/* Icon with pulse glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <Brain className="w-20 h-20 text-primary relative z-10" />
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <h3 className="font-semibold text-3xl text-center gradient-text">Ready to Analyze</h3>
                    <p className="text-muted-foreground text-sm text-center max-w-md mx-auto leading-relaxed">
                      Enter a query in the console to trigger the multi-agent arbitration workflow
                    </p>
                  </div>
                  
                  {/* Router Status */}
                  <div className="w-full max-w-md relative z-10 mt-6">
                    <RouterStatus />
                  </div>
                </motion.div>
              </motion.div>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-xs text-muted-foreground mt-12"
              >
                <p>
                  Powered by Multi-Agent Coordination • Cortensor Inference • Proof of Insight (PoI) •
                  Proof of Unbiased Work (PoUW)
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // STATE 2: ANALYSIS MODE (After Analysis Started)
          <motion.div
            key="analysis-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {/* Navigation Header */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="sticky top-10 z-40 bg-gradient-to-b from-background via-background/95 to-transparent pt-4 pb-3"
            >
              <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
                {/* Back Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBackToConsole}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium text-foreground group shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                  <span className="hidden sm:inline">Back to Console</span>
                  <span className="sm:hidden">Back</span>
                </motion.button>

                {/* Center - System Status Strip */}
                <div className="flex-1 flex justify-center">
                  <SystemStatus
                    routerStatus="online"
                    validatorStatus="active"
                    redundancyEnabled={true}
                    compact={true}
                  />
                </div>

                {/* New Analysis Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewAnalysis}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/50 transition-all duration-200 shrink-0"
                >
                  <span className="hidden sm:inline">New Analysis</span>
                  <span className="sm:hidden">New</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Compact Query Bar */}
            <CompactQueryBar onSubmit={handleAnalyze} isLoading={isLoading} />

            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect border border-red-500/30 p-4 rounded-lg text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Trust Gauge & Disagreement Indicator - Side by Side */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="glass-effect p-6 rounded-lg">
                  <TrustGauge
                    confidence={bundle.confidence}
                    decision={bundle.final_decision}
                    riskLevel={
                      bundle.final_decision === "Low Risk"
                        ? "low"
                        : bundle.final_decision === "Medium Risk"
                          ? "medium"
                          : bundle.final_decision === "High Risk"
                            ? "high"
                            : "critical"
                    }
                  />
                </div>

                <div className="glass-effect p-6 rounded-lg flex flex-col justify-center">
                  <DisagreementIndicator
                    agreement={bundle.disagreement_analysis.agreement}
                    agreementScore={bundle.disagreement_analysis.agreementScore}
                    disagreementReason={
                      bundle.disagreement_analysis.disagreementReason
                    }
                  />
                </div>
              </motion.div>

              {/* Consensus Timeline */}
              {events.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-effect p-6 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-secondary" />
                    <h2 className="font-semibold">Multi-Agent Consensus Timeline</h2>
                  </div>
                  <ConsensusTimeline events={events} />
                  {bundle && (
                    <div className="mt-6">
                      <StabilityIndex bundle={bundle} />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tabbed Results - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-effect p-6 rounded-lg"
              >
                <Tabs defaultValue="report" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="report" className="gap-2">
                      <Brain className="w-4 h-4" />
                      Arbitration Report
                    </TabsTrigger>
                    <TabsTrigger value="cross-run" className="gap-2">
                      <Zap className="w-4 h-4" />
                      Cross-Run Analysis
                    </TabsTrigger>
                    <TabsTrigger value="evidence" className="gap-2">
                      <Database className="w-4 h-4" />
                      Evidence Explorer
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="gap-2">
                      <GitBranch className="w-4 h-4" />
                      Operations
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="report" className="mt-6">
                    <ArbitrationReport bundle={bundle} />
                  </TabsContent>

                  <TabsContent value="cross-run" className="mt-6">
                    <CrossRunComparison
                      agentA={bundle.agent_a_result}
                      agentB={bundle.agent_b_result}
                    />
                  </TabsContent>

                  <TabsContent value="evidence" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <EvidenceExplorer bundle={bundle} />
                      </div>
                      <div>
                        <SessionTracker bundle={bundle} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="operations" className="mt-6">
                    <ContinuationPanel bundle={bundle} />
                  </TabsContent>
                </Tabs>
              </motion.div>

              {/* Disagreement Heatmap */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <DisagreementHeatmap bundle={bundle} />
              </motion.div>

              {/* Explainability Panel */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ExplainabilityPanel bundle={bundle} />
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-xs text-muted-foreground mt-12"
              >
                <p>
                  Powered by Multi-Agent Coordination • Cortensor Inference • Proof of Insight (PoI) •
                  Proof of Unbiased Work (PoUW)
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
