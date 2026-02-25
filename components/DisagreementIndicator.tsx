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
        animate={{
          opacity: 1,
          y: 0,
          ...(
            !agreement
              ? {
                boxShadow: [
                  "0 0 20px rgba(245, 158, 11, 0.3)",
                  "0 0 40px rgba(245, 158, 11, 0.5)",
                  "0 0 20px rgba(245, 158, 11, 0.3)",
                ],
              }
              : {}
          ),
        }}
        transition={
          !agreement
            ? { duration: 2, repeat: Infinity }
            : {}
        }
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
            className={!agreement ? "shake-micro" : ""}
          >
            {agreement ? (
              <Check className="w-6 h-6 text-green-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            )}
          </motion.div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <motion.h4
                className="font-semibold text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {agreement ? "Agents Aligned" : "Disagreement Detected"}
              </motion.h4>
              <motion.span
                className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-semibold"
                animate={{
                  boxShadow: !agreement
                    ? [
                      "0 0 0px rgba(245, 158, 11, 0)",
                      "0 0 10px rgba(245, 158, 11, 0.5)",
                      "0 0 0px rgba(245, 158, 11, 0)",
                    ]
                    : "0 0 0px rgba(0, 0, 0, 0)",
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {agreementScore.toFixed(0)}% confidence
              </motion.span>
            </div>

            {!agreement && disagreementReason && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-muted-foreground italic border-l-2 border-yellow-500/50 pl-2"
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

            {/* Agreement bar with enhanced animation */}
            <motion.div
              className="w-full bg-muted rounded-full h-3 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
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

            {/* Disagreement warning indicator */}
            {!agreement && (
              <motion.div
                className="flex items-center gap-2 text-xs text-yellow-400 mt-2 p-2 bg-yellow-500/10 rounded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                />
                <span>Arbitration triggered for deeper analysis</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
