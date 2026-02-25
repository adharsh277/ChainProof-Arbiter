"use client"

import { motion } from "framer-motion"

interface ProcessingPipelineProps {
  currentStep?: number
  steps?: Array<{
    label: string
    description: string
  }>
}

export function ProcessingPipeline({
  currentStep = 0,
  steps = [
    { label: "Planning", description: "Strategy" },
    { label: "Delegating", description: "Agents" },
    { label: "Executing", description: "PoI Runs" },
    { label: "Comparing", description: "Agreement" },
    { label: "Validating", description: "PoUW" },
    { label: "Arbitrating", description: "Bundle" },
  ],
}: ProcessingPipelineProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const stepVariants = {
    inactive: { scale: 0.8, opacity: 0.4 },
    active: {
      scale: 1.1,
      opacity: 1,
      boxShadow: "0 0 30px rgba(124, 58, 237, 0.6)",
    },
    completed: {
      scale: 1,
      opacity: 1,
      boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)",
    },
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Pipeline Visualization */}
      <div className="glass-effect p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-6">
          Agent Execution Pipeline
        </h3>

        <div className="flex items-center justify-between gap-2 mb-4">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep
            const isCompleted = idx < currentStep
            let state: keyof typeof stepVariants = "inactive"
            if (isCompleted) state = "completed"
            else if (isActive) state = "active"

            return (
              <motion.div key={idx} className="flex flex-col items-center flex-1">
                {/* Step Node */}
                <motion.div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                      : isActive
                        ? "bg-primary/30 border border-primary text-primary"
                        : "bg-muted border border-muted text-muted-foreground"
                  }`}
                  variants={stepVariants}
                  animate={state}
                  initial={state}
                >
                  {isCompleted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <span>{idx + 1}</span>
                  )}

                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.div
                  className="text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-xs font-semibold text-foreground">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Connection Lines - NOT VISIBLE but for spacing */}
        <div className="relative h-2 mb-2 -mt-14">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Progress text */}
        <motion.div
          className="text-xs text-muted-foreground text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Step {currentStep + 1} of {steps.length}
        </motion.div>
      </div>

      {/* Current Step Details */}
      <motion.div
        className="glass-effect p-4 rounded-lg border border-primary/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            className="w-3 h-3 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-sm font-semibold gradient-text">
            {steps[currentStep]?.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {steps[currentStep]?.description && `Executing: ${steps[currentStep].description}`}
        </p>
      </motion.div>

      {/* Inference Badges */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Inference Run", count: "1/2", icon: "⚙️" },
          { label: "Validator Stage", count: "Active", icon: "✓" },
        ].map((badge, idx) => (
          <motion.div
            key={idx}
            className="glass-effect p-3 rounded-lg border border-primary/20 flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <motion.div
              className="text-xl"
              animate={{ rotate: idx === 0 ? 360 : 0 }}
              transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
            >
              {badge.icon}
            </motion.div>
            <div>
              <div className="text-xs font-semibold text-foreground">{badge.label}</div>
              <motion.div
                className="text-xs text-primary font-bold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {badge.count}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
