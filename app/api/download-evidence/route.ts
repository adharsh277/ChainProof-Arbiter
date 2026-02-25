import { NextRequest, NextResponse } from "next/server"

/**
 * Download Evidence Bundle Endpoint
 * Converts arbitration bundle to downloadable JSON artifact
 */
export async function POST(req: NextRequest) {
  try {
    const bundle = await req.json()

    // Validate bundle structure
    if (!bundle.taskId || !bundle.timestamp) {
      return NextResponse.json(
        { error: "Invalid evidence bundle" },
        { status: 400 }
      )
    }

    // Create filename with timestamp
    const filename = `chainproof-evidence-${bundle.taskId}.json`

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(bundle, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Evidence-TaskId": bundle.taskId,
        "X-Evidence-Timestamp": bundle.timestamp,
      },
    })
  } catch (error) {
    console.error("Evidence download error:", error)
    return NextResponse.json(
      { error: "Failed to generate evidence bundle" },
      { status: 500 }
    )
  }
}
