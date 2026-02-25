"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Check } from "lucide-react"

interface DisagreementIndicatorProps {
  agreement: boolean
  agreementScore: number
  disagreementReason?: string
}

export function DisagreementIndicator({
  agreement,
  agreementScore,
  disagreementReason,
}: DisagreementIndicatorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-lg border-2 p-4 glass-effect ${
          agreement
            ? "border-green-500/50 bg-green-500/5"
            : "border-yellow-500/50 bg-yellow-500/5"
        }`}
      >
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {agreement ? (
              <Check className="w-6 h-6 text-green-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            )}
          </motion.div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">
                {agreement ? "Agents Aligned" : "Disagreement Detected"}
              </h4>
              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">
                {agreementScore.toFixed(0)}% confidence
              </span>
            </div>

            {!agreement && disagreementReason && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                {disagreementReason}
              </motion.p>
            )}

            {agreement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                Both agents have independently verified the analysis with high consistency.
              </motion.div>
            )}

            {/* Agreement bar */}
            <motion.div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full transition-all duration-1000 ${
                  agreement
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${agreementScore}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
