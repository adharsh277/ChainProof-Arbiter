"use client"

import { ArbitrationBundle } from "@/lib/types"
import { Download, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SessionTrackerProps {
  bundle: ArbitrationBundle
}

export function SessionTracker({ bundle }: SessionTrackerProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const sessionIds = bundle.evidence?.session_ids || []

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadEvidence = async () => {
    try {
      const response = await fetch("/api/download-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle),
      })

      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chainproof-evidence-${bundle.taskId}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Cortensor Session IDs */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-secondary" />
          Cortensor Session IDs
          <span className="text-xs text-muted-foreground font-normal">
            ({sessionIds.length} sessions)
          </span>
        </h3>
        
        <div className="space-y-2">
          {sessionIds.map((sessionId, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded border border-card-foreground/10 bg-card/30 font-mono text-xs"
            >
              <span className="truncate flex-1 text-muted-foreground">
                {sessionId}
              </span>
              <button
                onClick={() => copyToClipboard(sessionId)}
                className="ml-2 p-1 hover:bg-accent/10 rounded transition-colors"
                title="Copy to clipboard"
              >
                {copied === sessionId ? (
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Model Information */}
      {bundle.agent_a_result.modelUsed && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Model:</span>
            <span className="font-mono">{bundle.agent_a_result.modelUsed}</span>
          </div>
          {bundle.agent_a_result.latencyMs && (
            <div className="flex items-center justify-between">
              <span>Avg Latency:</span>
              <span className="font-mono">
                {Math.round(
                  ((bundle.agent_a_result.latencyMs || 0) +
                    (bundle.agent_b_result.latencyMs || 0)) /
                    2
                )}
                ms
              </span>
            </div>
          )}
        </div>
      )}

      {/* Download Evidence Bundle */}
      <Button
        onClick={downloadEvidence}
        className="w-full gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30"
        variant="outline"
      >
        <Download className="w-4 h-4" />
        Download Evidence Bundle
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Includes session IDs, timestamps, raw outputs, and validator scores
      </p>
    </div>
  )
}
