"use client"

import { useEffect, useState, useCallback } from "react"

interface CoinData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap_rank: number
}

interface CryptoItem {
  symbol: string
  price: string
  change: number
  rank: number
}

const COINGECKO_API = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false"
const REFRESH_INTERVAL = 60000 // 60 seconds

export function CryptoTicker() {
  const [coins, setCoins] = useState<CryptoItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCryptoData = useCallback(async () => {
    try {
      const response = await fetch(COINGECKO_API)
      if (!response.ok) throw new Error("Failed to fetch")
      
      const data: CoinData[] = await response.json()
      
      const formatted = data.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        price: formatPrice(coin.current_price),
        change: coin.price_change_percentage_24h || 0,
        rank: coin.market_cap_rank,
      }))
      
      setCoins(formatted)
      setLoading(false)
    } catch (error) {
      console.error("CoinGecko API error:", error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchCryptoData])

  const formatPrice = (price: number): string => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (price >= 0.01) return `$${price.toFixed(4)}`
    return `$${price.toFixed(6)}`
  }

  // Duplicate for seamless infinite scroll
  const items = [...coins, ...coins]

  if (loading || coins.length === 0) {
    return (
      <div className="ticker-bar">
        <div className="h-full flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading market data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="ticker-bar">
      <div className="h-full overflow-hidden">
        <div className="ticker-track h-full items-center">
          {items.map((item, index) => {
            const isUp = item.change >= 0
            const isVolatile = Math.abs(item.change) > 5
            
            return (
              <div key={`${item.symbol}-${index}`} className="ticker-item">
                <span className={`w-2 h-2 rounded-full animate-pulse ticker-glow ${
                  isVolatile ? "bg-amber-400" : "bg-primary/70"
                }`} />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {item.symbol}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {item.price}
                </span>
                <span className={`text-xs font-semibold ${
                  isUp ? "text-emerald-400" : "text-red-400"
                }`}>
                  {isUp ? "▲" : "▼"} {Math.abs(item.change).toFixed(1)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
