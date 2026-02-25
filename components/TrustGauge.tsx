"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface TrustGaugeProps {
  confidence: number // 0-1
  decision: string
  riskLevel: "low" | "medium" | "high" | "critical"
}

export function TrustGauge({ confidence, decision, riskLevel }: TrustGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const target = Math.round(confidence * 100)
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setDisplayValue(target)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [confidence])

  const getRiskColor = () => {
    switch (riskLevel) {
      case "critical":
        return "#ff3333"
      case "high":
        return "#ff9933"
      case "medium":
        return "#ffcc33"
      case "low":
        return "#33ff33"
      default:
        return "#ac2fff"
    }
  }

  const angle = (displayValue / 100) * 180 - 90

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-48 h-48">
        {/* Gauge background circle */}
        <svg className="w-full h-full" viewBox="0 0 200 220">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
            opacity="0.3"
          />

          {/* Colored arc based on risk level */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getRiskColor()}
            strokeWidth="3"
            strokeDasharray={`${(displayValue / 100) * 251.2} 251.2`}
            opacity="0.8"
            style={{ transition: "stroke-dasharray 0.1s linear" }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = (tick / 100) * 180 - 90
            const tickRad = (tickAngle * Math.PI) / 180
            const x1 = 100 + 75 * Math.cos(tickRad)
            const y1 = 100 + 75 * Math.sin(tickRad)
            const x2 = 100 + 85 * Math.cos(tickRad)
            const y2 = 100 + 85 * Math.sin(tickRad)
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                opacity="0.5"
              />
            )
          })}

          {/* Center circle */}
          <circle cx="100" cy="100" r="12" fill="hsl(var(--primary))" opacity="0.8" />
        </svg>

        {/* Needle using transform */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-2 h-24 origin-bottom"
          style={{
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="w-full h-full bg-gradient-to-t from-primary to-accent rounded-full neon-glow" />
        </motion.div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 neon-glow" />
      </div>

      {/* Display values */}
      <div className="text-center space-y-2">
        <motion.div
          className="text-4xl font-bold gradient-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {displayValue}%
        </motion.div>
        <div className="text-sm text-muted-foreground">Trust Confidence</div>
        <motion.div
          className={`text-lg font-semibold px-3 py-1 rounded-full inline-block border`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            borderColor: getRiskColor(),
            color: getRiskColor(),
          }}
        >
          {decision}
        </motion.div>
      </div>
    </div>
  )
}
