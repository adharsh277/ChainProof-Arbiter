"use client"

import { motion } from "framer-motion"

interface SystemStatusProps {
  routerStatus?: "online" | "offline" | "connecting"
  validatorStatus?: "active" | "inactive" | "busy"
  redundancyEnabled?: boolean
}

export function SystemStatus({
  routerStatus = "online",
  validatorStatus = "active",
  redundancyEnabled = true,
}: SystemStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "active":
        return "status-online"
      case "connecting":
        return "status-active"
      case "offline":
      case "inactive":
        return "status-warning"
      default:
        return "status-active"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-16 right-6 z-40"
    >
      <div className="glass-effect p-4 rounded-lg space-y-2">
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
            <div className={`status-indicator ${redundancyEnabled ? "status-online" : "status-warning"}`} />
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
      </div>
    </motion.div>
  )
}
