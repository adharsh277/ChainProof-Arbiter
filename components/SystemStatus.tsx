"use client"

import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SystemStatusProps {
  routerStatus?: "online" | "offline" | "connecting"
  validatorStatus?: "active" | "inactive" | "busy"
  redundancyEnabled?: boolean
  compact?: boolean
}

export function SystemStatus({
  routerStatus = "online",
  validatorStatus = "active",
  redundancyEnabled = true,
  compact = false,
}: SystemStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "active":
        return "bg-cyan-400"
      case "connecting":
      case "busy":
        return "bg-amber-400"
      case "offline":
      case "inactive":
        return "bg-red-400"
      default:
        return "bg-cyan-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "online":
        return "Router Online"
      case "offline":
        return "Router Offline"
      case "connecting":
        return "Router Connecting"
      case "active":
        return "Validators Active"
      case "inactive":
        return "Validators Inactive"
      case "busy":
        return "Validators Busy"
      default:
        return "Status Unknown"
    }
  }

  // Compact inline version (for header)
  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-3">
          {/* Router Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1 cursor-help"
              >
                <div className={`w-2 h-2 rounded-full ${getStatusColor(routerStatus)} animate-pulse`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide hidden sm:inline">Router</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {getStatusLabel(routerStatus)}
            </TooltipContent>
          </Tooltip>

          {/* Validator Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                className="flex items-center gap-1 cursor-help"
              >
                <div className={`w-2 h-2 rounded-full ${getStatusColor(validatorStatus)} animate-pulse`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide hidden sm:inline">Validators</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {getStatusLabel(validatorStatus)}
            </TooltipContent>
          </Tooltip>

          {/* Redundancy Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                className="flex items-center gap-1 cursor-help"
              >
                <div className={`w-2 h-2 rounded-full ${redundancyEnabled ? "bg-cyan-400" : "bg-red-400"} animate-pulse`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide hidden sm:inline">Redundant</span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Redundant Mode: {redundancyEnabled ? "Enabled" : "Disabled"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  // Full card version (legacy, for other contexts)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect p-4 rounded-lg space-y-2"
    >
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        System Status
      </div>

      <div className="space-y-2 text-xs">
        {/* Router Status */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={`status-indicator ${getStatusColor(routerStatus)}`} />
          <span className="text-muted-foreground">
            Router:{" "}
            <span className="text-foreground capitalize font-medium">{routerStatus}</span>
          </span>
        </motion.div>

        {/* Validator Status */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={`status-indicator ${getStatusColor(validatorStatus)}`} />
          <span className="text-muted-foreground">
            Validators:{" "}
            <span className="text-foreground capitalize font-medium">{validatorStatus}</span>
          </span>
        </motion.div>

        {/* Redundancy Mode */}
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className={`status-indicator ${redundancyEnabled ? "bg-cyan-400" : "bg-red-400"}`} />
          <span className="text-muted-foreground">
            Redundant Mode:{" "}
            <span className="text-foreground capitalize font-medium">
              {redundancyEnabled ? "Enabled" : "Disabled"}
            </span>
          </span>
        </motion.div>
      </div>

      {/* Activity Indicator */}
      <motion.div
        className="h-px bg-gradient-to-r from-primary/20 via-secondary/50 to-primary/20 mt-3"
        animate={{ backgroundPosition: ["0%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  )
}
