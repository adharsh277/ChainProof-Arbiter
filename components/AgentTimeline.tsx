"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, Clock, Zap } from "lucide-react"
import { TimelineEvent } from "@/lib/types"

interface AgentTimelineProps {
  events: TimelineEvent[]
}

export function AgentTimeline({ events }: AgentTimelineProps) {
  const getStatusIcon = (status: string) => {
    if (status === "complete") return <Check className="w-5 h-5 text-cyan-400" />
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
        return "from-cyan-500 to-cyan-600"
      case "complete":
        return "from-indigo-500 to-indigo-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {events.map((event, index) => (
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
                )} p-0.5`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                  {getStatusIcon(event.status)}
                </div>
              </motion.div>
              {index < events.length - 1 && (
                <motion.div
                  className="w-0.5 h-12 bg-gradient-to-b from-primary/50 to-transparent my-1"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>

            {/* Content */}
            <motion.div
              className="flex-1 glass-effect p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{event.message}</p>
                  {event.agent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Agent: <span className="text-primary">{event.agent}</span>
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {getTimeDiff(event.timestamp)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
