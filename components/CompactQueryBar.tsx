"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ChevronDown } from "lucide-react"

interface CompactQueryBarProps {
  onSubmit: (query: string, type: string) => void
  isLoading: boolean
}

export function CompactQueryBar({ onSubmit, isLoading }: CompactQueryBarProps) {
  const [query, setQuery] = useState("")
  const [queryType, setQueryType] = useState<"token-safety" | "transaction-analysis" | "contract-audit">(
    "token-safety"
  )
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query, queryType)
      setQuery("")
    }
  }

  const typeLabels: Record<string, string> = {
    "token-safety": "Token Safety",
    "transaction-analysis": "Transaction",
    "contract-audit": "Contract Audit",
  }

  return (
    <motion.div
      layout
      className="glass-effect border-b border-primary/20 sticky top-10 z-40"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        {/* Type Selector - Compact */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-smooth text-sm font-medium text-foreground min-w-fit"
          >
            {typeLabels[queryType]}
            <ChevronDown className="w-4 h-4 opacity-60" />
          </motion.button>

          {/* Dropdown */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full mt-1 left-0 bg-background border border-primary/30 rounded-lg overflow-hidden shadow-lg"
            >
              {Object.entries(typeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setQueryType(key as any)
                    setExpanded(false)
                  }}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-primary/10 transition-smooth ${
                    queryType === key ? "bg-primary/20 text-primary" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Input */}
        <Input
          placeholder="Ask another question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) handleSubmit()
          }}
          disabled={isLoading}
          className="flex-1 bg-transparent border-primary/20 h-10"
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !query.trim()}
          className="gap-2 whitespace-nowrap"
          size="sm"
        >
          <Send className="w-4 h-4" />
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
    </motion.div>
  )
}
