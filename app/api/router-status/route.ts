import { NextResponse } from "next/server"
import { getRouterClient } from "@/lib/router-client"

export async function GET() {
  try {
    const routerClient = getRouterClient()
    
    // Determine if we're in simulation mode
    const simulationMode = process.env.NEXT_PUBLIC_SIMULATION_MODE === "true"
    const apiKey = process.env.CORTENSOR_API_KEY

    // Try to get Router status
    try {
      const status = await routerClient.getStatus()
      
      return NextResponse.json({
        connected: true,
        status: status.status,
        version: status.version,
        uptime: status.uptime,
       activeModels: status.activeModels,
        mode: simulationMode || !apiKey ? "simulated" : "real",
      })
    } catch (error) {
      // If status check fails, return disconnected state
      return NextResponse.json({
        connected: false,
        mode: simulationMode || !apiKey ? "simulated" : "real",
        error: error instanceof Error ? error.message : "Connection failed",
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        mode: "simulated",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
