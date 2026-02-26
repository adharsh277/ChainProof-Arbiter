"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface RouterStatus {
  connected: boolean
  status?: string
  version?: string
  uptime?: number
  activeModels?: string[]
  mode: "real" | "simulated"
  error?: string
}

export function RouterStatus() {
  const [status, setStatus] = useState<RouterStatus>({
    connected: false,
    mode: "simulated",
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string>("")

  const checkRouterStatus = async () => {
    setLoading(true)
    setTestResult("")
    
    try {
      const response = await fetch("/api/router-status")
      const data = await response.json()
      
      setStatus({
        connected: data.connected,
        status: data.status,
        version: data.version,
        uptime: data.uptime,
        activeModels: data.activeModels,
        mode: data.mode,
        error: data.error,
      })
    } catch (error) {
      setStatus({
        connected: false,
        mode: "simulated",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const testInference = async () => {
    setTesting(true)
    setTestResult("")

    try {
      const response = await fetch("/api/test-router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Test Router connection with a simple query.",
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResult(
          `✅ Test successful!\nSession ID: ${data.sessionId}\nLatency: ${data.latencyMs}ms\nResponse: ${data.response.substring(0, 100)}...`
        )
      } else {
        setTestResult(`❌ Test failed: ${data.error}`)
      }
    } catch (error) {
      setTestResult(`❌ Test error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    checkRouterStatus()
  }, [])

  const getStatusColor = () => {
    if (!status.connected) return "text-yellow-500"
    if (status.mode === "simulated") return "text-blue-500"
    return "text-green-500"
  }

  const getStatusText = () => {
    if (!status.connected) return "Disconnected"
    if (status.mode === "simulated") return "Simulation Mode"
    return "Connected"
  }

  const formatUptime = (ms?: number) => {
    if (!ms) return "N/A"
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-black/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Cortensor Router Status
        </h3>
        <Button
          onClick={checkRouterStatus}
          disabled={loading}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {loading ? "Checking..." : "Refresh"}
        </Button>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Status:</span>
          <span className={`text-sm font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Mode:</span>
          <span className="text-sm text-white">
            {status.mode === "simulated" ? "🎭 Simulated" : "🚀 Production"}
          </span>
        </div>

        {/* Version */}
        {status.version && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Version:</span>
            <span className="text-sm text-white">{status.version}</span>
          </div>
        )}

        {/* Uptime */}
        {status.uptime !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Uptime:</span>
            <span className="text-sm text-white">
              {formatUptime(status.uptime)}
            </span>
          </div>
        )}

        {/* Active Models */}
        {status.activeModels && status.activeModels.length > 0 && (
          <div className="flex items-start justify-between">
            <span className="text-sm text-zinc-400">Models:</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
              {status.activeModels.map((model) => (
                <span
                  key={model}
                  className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {status.error && (
          <div className="mt-3 p-3 rounded bg-red-950/30 border border-red-900/50">
            <p className="text-sm text-red-400">{status.error}</p>
          </div>
        )}

        {/* Status Info */}
        {status.mode === "simulated" && (
          <div className="mt-3 p-3 rounded bg-blue-950/30 border border-blue-900/50">
            <p className="text-xs text-blue-400">
              Running in simulation mode. Configure CORTENSOR_API_KEY to connect
              to a real Router node.
            </p>
          </div>
        )}

        {/* Test Inference Button */}
        <div className="pt-3 border-t border-zinc-800">
          <Button
            onClick={testInference}
            disabled={testing}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {testing ? "Testing Router..." : "Test Inference"}
          </Button>

          {testResult && (
            <pre className="mt-3 text-xs text-white bg-zinc-900 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {testResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
