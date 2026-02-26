import { NextRequest, NextResponse } from "next/server"
import { getRouterClient } from "@/lib/router-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid prompt" },
        { status: 400 }
      )
    }

    const routerClient = getRouterClient()
    
    // Test inference with the Router
    const result = await routerClient.chatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    return NextResponse.json({
      success: true,
      response: result.response,
      sessionId: result.sessionId,
      latencyMs: result.latencyMs,
      mode: process.env.NEXT_PUBLIC_SIMULATION_MODE === "true" ? "simulated" : "real",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 }
    )
  }
}
