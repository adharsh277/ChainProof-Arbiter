import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ChainProof Arbiter - Multi-Agent Blockchain Intelligence",
  description: "A verifiable multi-agent blockchain intelligence system for institutional analysis",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%23ac2fff'>⚖</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
