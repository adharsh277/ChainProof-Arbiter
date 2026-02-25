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

  const getRiskGlowColor = () => {
    switch (riskLevel) {
      case "critical":
        return "rgba(255, 51, 51, 0.4)"
      case "high":
        return "rgba(255, 153, 51, 0.4)"
      case "medium":
        return "rgba(255, 204, 51, 0.4)"
      case "low":
        return "rgba(51, 255, 51, 0.4)"
      default:
        return "rgba(172, 47, 255, 0.4)"
    }
  }

  const angle = (displayValue / 100) * 180 - 90

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <motion.div
        className="relative w-48 h-48"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer glow layer 1 */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${getRiskGlowColor()}, transparent)`,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Outer glow layer 2 */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${getRiskGlowColor()}, transparent)`,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />

        {/* Gauge SVG */}
        <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 200 220">
          {/* Background arc with glow */}
          <defs>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
            opacity="0.3"
          />

          {/* Colored arc based on risk level with glow */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getRiskColor()}
            strokeWidth="4"
            strokeDasharray={`${(displayValue / 100) * 251.2} 251.2`}
            opacity="0.9"
            filter="url(#glow-filter)"
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
                opacity="0.6"
              />
            )
          })}

          {/* Tick labels */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = (tick / 100) * 180 - 90
            const tickRad = (tickAngle * Math.PI) / 180
            const x = 100 + 60 * Math.cos(tickRad)
            const y = 100 + 60 * Math.sin(tickRad)
            return (
              <text
                key={`label-${tick}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="12"
                opacity="0.6"
              >
                {tick}
              </text>
            )
          })}

          {/* Center circle with glow */}
          <circle
            cx="100"
            cy="100"
            r="14"
            fill={getRiskColor()}
            opacity="0.3"
            filter="url(#glow-filter)"
          />
          <circle cx="100" cy="100" r="12" fill="hsl(var(--primary))" opacity="0.9" />
        </svg>

        {/* Needle using transform with glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-24 origin-bottom drop-shadow-lg"
          style={{
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            filter: `drop-shadow(0 0 10px ${getRiskColor()})`,
          }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `linear-gradient(to top, ${getRiskColor()}, rgba(172, 47, 255, 0.3))`,
            }}
          />
        </motion.div>

        {/* Center dot with pulse */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: getRiskColor(),
            boxShadow: `0 0 20px ${getRiskColor()}`,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Display values with enhanced animations */}
      <div className="text-center space-y-3">
        <motion.div
          className="text-5xl font-bold gradient-text"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {displayValue}%
        </motion.div>
        <motion.div
          className="text-sm text-muted-foreground uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Trust Confidence Score
        </motion.div>
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getRiskColor(), boxShadow: `0 0 8px ${getRiskColor()}` }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div
            className="text-lg font-semibold px-4 py-2 rounded-lg border backdrop-blur-sm"
            style={{
              borderColor: getRiskColor(),
              color: getRiskColor(),
              boxShadow: `0 0 15px ${getRiskColor()}33`,
            }}
          >
            {decision}
          </div>
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getRiskColor(), boxShadow: `0 0 8px ${getRiskColor()}` }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>
      </div>
    </div>
  )
}
