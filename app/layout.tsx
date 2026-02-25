import type { Metadata } from "next"
import "./globals.css"
import { CryptoTicker } from "@/components/CryptoTicker"

export const metadata: Metadata = {
  title: "ChainProof Arbiter - Multi-Agent Blockchain Intelligence",
  description: "A verifiable multi-agent blockchain intelligence system for institutional analysis",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%237c3aed'>⚖</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased pt-10">
        <CryptoTicker />
        <div className="mesh-bg" />
        {/* Aurora Background Elements */}
        <div className="aurora-bg-primary top-0 right-0" style={{ right: '-100px', top: '-100px' }} />
        <div className="aurora-bg-secondary bottom-0 left-0" style={{ left: '-150px', bottom: '-150px' }} />
        <div className="aurora-bg-accent top-1/2 left-1/2" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        
        {/* Main Content */}
        {children}
      </body>
    </html>
  )
}
