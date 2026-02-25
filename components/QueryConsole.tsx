"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Zap } from "lucide-react"

interface QueryConsoleProps {
  onSubmit: (query: string, type: string) => void
  isLoading: boolean
}

export function QueryConsole({ onSubmit, isLoading }: QueryConsoleProps) {
  const [query, setQuery] = useState("")
  const [queryType, setQueryType] = useState<"token-safety" | "transaction-analysis" | "contract-audit">(
    "token-safety"
  )

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query, queryType)
      setQuery("")
    }
  }

  const examples: Record<string, { type: string; query: string }> = {
    token: {
      type: "token-safety",
      query: "Is 0x1234567890123456789012345678901234567890 token safe for trading?",
    },
    transaction: {
      type: "transaction-analysis",
      query:
        "Analyze transaction 0xabcd1234... for suspicious patterns and MEV extraction",
    },
    contract: {
      type: "contract-audit",
      query: "Audit smart contract for vulnerabilities and security issues",
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Query Console</h2>
        </div>

        <Tabs value={queryType} onValueChange={(v) => setQueryType(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="token-safety">Token Safety</TabsTrigger>
            <TabsTrigger value="transaction-analysis">Transaction</TabsTrigger>
            <TabsTrigger value="contract-audit">Contract Audit</TabsTrigger>
          </TabsList>

          {/* Token Safety Tab */}
          <TabsContent value="token-safety" className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Analyze token contracts for risks, rug pull indicators, and market safety
            </p>
          </TabsContent>

          {/* Transaction Tab */}
          <TabsContent value="transaction-analysis" className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Detect MEV, sandwich attacks, and suspicious transaction patterns
            </p>
          </TabsContent>

          {/* Contract Audit Tab */}
          <TabsContent value="contract-audit" className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Audit smart contracts for vulnerabilities and security issues
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Input
            placeholder="Enter your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) handleSubmit()
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !query.trim()}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </div>

      {/* Quick Examples */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase">Quick Examples</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(examples).map(([key, example]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setQuery(example.query)
                setQueryType(example.type as any)
              }}
              disabled={isLoading}
              className="text-left p-2 rounded-lg glass-effect text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-smooth disabled:opacity-50"
            >
              <span className="line-clamp-2">{example.query}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
