"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, Clock, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { TimelineEvent } from "@/lib/types"

interface ConsensusTimelineProps {
  events: TimelineEvent[]
}

export function ConsensusTimeline({ events }: ConsensusTimelineProps) {
  const getStatusIcon = (status: string) => {
    if (status === "complete") return <Check className="w-5 h-5 text-green-400" />
    if (status === "error") return <AlertCircle className="w-5 h-5 text-red-400" />
    if (status === "warning") return <AlertCircle className="w-5 h-5 text-yellow-400" />
    if (status === "in-progress") return <Zap className="w-5 h-5 text-primary animate-pulse" />
    return <Clock className="w-5 h-5 text-muted-foreground" />
  }

  const getTimeDiff = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return date.toLocaleTimeString()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "from-blue-500 to-blue-600"
      case "analysis":
        return "from-purple-500 to-purple-600"
      case "agreement":
        return "from-yellow-500 to-yellow-600"
      case "validation":
        return "from-green-500 to-green-600"
      case "complete":
        return "from-emerald-500 to-emerald-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getConsensusStatusBadge = (status?: string) => {
    if (!status) return null
    
    const badges = {
      agreement: { text: "In Agreement", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      diverged: { text: "Diverged", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      escalated: { text: "Escalated", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    }
    
    const badge = badges[status as keyof typeof badges]
    if (!badge) return null
    
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full border ${badge.color} font-medium`}>
        {badge.text}
      </span>
    )
  }

  const getDeltaIndicator = (delta?: number) => {
    if (delta === undefined || delta === null) return null
    
    const isPositive = delta > 0
    const isNeutral = Math.abs(delta) < 0.5
    
    if (isNeutral) {
      return (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Minus className="w-3 h-3" />
          <span>±{Math.abs(delta).toFixed(1)}</span>
        </span>
      )
    }
    
    return (
      <span className={`flex items-center gap-1 text-xs ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{isPositive ? '+' : ''}{delta.toFixed(1)}</span>
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {events.map((event, index) => {
          const isLatest = index === 0
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex gap-4 items-start"
            >
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getTypeColor(
                    event.type
                  )} p-0.5 ${isLatest ? 'ring-2 ring-primary/50' : ''}`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    ...(isLatest ? {
                      boxShadow: [
                        "0 0 0 0 rgba(172, 47, 255, 0.4)",
                        "0 0 0 10px rgba(172, 47, 255, 0)",
                        "0 0 0 0 rgba(172, 47, 255, 0)"
                      ]
                    } : {})
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200,
                    ...(isLatest ? { 
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                      }
                    } : {})
                  }}
                >
                  <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                    {getStatusIcon(event.status)}
                  </div>
                </motion.div>
                {index < events.length - 1 && (
                  <motion.div
                    className={`w-0.5 h-12 bg-gradient-to-b from-primary/50 to-transparent my-1 ${
                      isLatest ? 'shadow-[0_0_10px_rgba(172,47,255,0.5)]' : ''
                    }`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>

              {/* Content */}
              <motion.div
                className={`flex-1 glass-effect p-3 rounded-lg ${
                  isLatest ? 'ring-1 ring-primary/20' : ''
                }`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  ...(isLatest ? {
                    boxShadow: [
                      "0 0 15px rgba(172, 47, 255, 0.1)",
                      "0 0 20px rgba(172, 47, 255, 0.2)",
                      "0 0 15px rgba(172, 47, 255, 0.1)"
                    ]
                  } : {})
                }}
                transition={{ 
                  delay: 0.1,
                  ...(isLatest ? {
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity
                    }
                  } : {})
                }}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{event.message}</p>
                    {event.agent && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Agent: <span className="text-primary font-semibold">{event.agent}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getTimeDiff(event.timestamp)}
                  </span>
                </div>

                {/* Enhanced Intelligence Metrics */}
                {(event.confidence || event.riskScore !== undefined || event.delta !== undefined || event.consensusStatus || event.latency) && (
                  <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
                    {event.riskScore !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Score:</span>
                        <span className="text-sm font-bold text-foreground">{event.riskScore.toFixed(1)}</span>
                        {getDeltaIndicator(event.delta)}
                      </div>
                    )}
                    
                    {event.confidence !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <span className="text-sm font-semibold text-secondary">{event.confidence}%</span>
                      </div>
                    )}
                    
                    {event.latency !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Latency:</span>
                        <span className="text-sm font-mono text-foreground">{event.latency.toFixed(2)}s</span>
                      </div>
                    )}
                    
                    {event.consensusStatus && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        {getConsensusStatusBadge(event.consensusStatus)}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
