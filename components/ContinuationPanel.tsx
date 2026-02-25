"use client"

import { ArbitrationBundle } from "@/lib/types"
import { AlertCircle, PlayCircle, Upload, CheckCircle, XCircle, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface ContinuationPanelProps {
  bundle: ArbitrationBundle
}

export function ContinuationPanel({ bundle }: ContinuationPanelProps) {
  const { continuation, operational_actions } = bundle

  if (!continuation) return null

  const getActionIcon = (action: string) => {
    switch (action) {
      case "rerun":
        return <PlayCircle className="w-4 h-4" />
      case "escalate":
        return <Upload className="w-4 h-4" />
      case "alert":
        return <AlertCircle className="w-4 h-4" />
      case "complete":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "rerun":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30"
      case "escalate":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
      case "alert":
        return "text-red-400 bg-red-500/10 border-red-500/30"
      case "complete":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-3 h-3 text-cyan-400" />
      case "pending":
        return <Clock className="w-3 h-3 text-yellow-400" />
      case "failed":
        return <XCircle className="w-3 h-3 text-red-400" />
      default:
        return <Clock className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Continuation Decision */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-secondary" />
          Autonomous Continuation Logic
        </h3>
        
        <div
          className={`border rounded-lg p-4 ${getActionColor(continuation.action)}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getActionIcon(continuation.action)}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm uppercase">
                  {continuation.action}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    continuation.should_continue
                      ? "bg-orange-500/20 text-orange-300"
                      : "bg-cyan-500/20 text-cyan-300"
                  }`}
                >
                  {continuation.should_continue ? "Action Required" : "Completed"}
                </span>
              </div>
              
              <p className="text-sm opacity-90">{continuation.reason}</p>
              
              {continuation.threshold_exceeded && (
                <div className="text-xs opacity-75 space-y-1 pt-2 border-t border-current/20">
                  <div className="font-mono">
                    <span className="opacity-60">Trigger: </span>
                    {continuation.triggered_by}
                  </div>
                  <div className="font-mono">
                    <span className="opacity-60">Metric: </span>
                    {continuation.threshold_exceeded.metric} ={" "}
                    {continuation.threshold_exceeded.value.toFixed(1)} (threshold:{" "}
                    {continuation.threshold_exceeded.threshold})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Actions */}
      {operational_actions && operational_actions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent" />
            Operational Actions Triggered
          </h3>
          
          <div className="space-y-2">
            {operational_actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-card-foreground/10 rounded-lg p-3 bg-card/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-accent">
                      {action.type}
                    </span>
                    {getStatusIcon(action.status)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {action.endpoint && (
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {action.endpoint}
                  </div>
                )}
                
                {action.payload && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.type === "webhook" && typeof action.payload.message === "string" && (
                      <span>{action.payload.message}</span>
                    )}
                    {action.type === "escalation" && (
                      <span className="text-yellow-400">⚠ Human review required</span>
                    )}
                    {action.type === "report" && (
                      <span className="text-blue-400">📄 Incident report generated</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
