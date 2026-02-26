// Cortensor Router Client
// Handles all interactions with the Cortensor Router Node

export interface RouterConfig {
  baseUrl: string
  apiKey: string
  timeout?: number
}

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  session_id?: string
}

export interface ValidationRequest {
  sessionId: string
  expectedQuality: "low" | "medium" | "high"
}

export interface ValidationResponse {
  sessionId: string
  score: number
  metrics: {
    accuracy: number
    coherence: number
    relevance: number
  }
  validated: boolean
}

export class CortensorRouterClient {
  private config: RouterConfig

  constructor(config: RouterConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    }
  }

  /**
   * Send a chat completion request to the Router
   */
  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<{
    response: string
    sessionId: string
    latencyMs: number
    full: ChatCompletionResponse
  }> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout!),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Router API error ${response.status}: ${errorText}`)
      }

      const data: ChatCompletionResponse = await response.json()
      const latencyMs = Date.now() - startTime

      return {
        response: data.choices?.[0]?.message?.content || "No response",
        sessionId: data.session_id || data.id || `session-${Date.now()}`,
        latencyMs,
        full: data,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Cortensor Router request failed: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Validate a session's quality using Cortensor's PoUW rubric
   */
  async validateSession(request: ValidationRequest): Promise<ValidationResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.config.timeout!),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Validation API error ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Session validation failed: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Get Router node status and health
   */
  async getStatus(): Promise<{
    status: string
    version: string
    uptime: number
    activeModels: string[]
  }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/status`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Router status check failed: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`Models list failed: ${response.status}`)
      }

      const data = await response.json()
      return data.models || []
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list models: ${error.message}`)
      }
      throw error
    }
  }
}

/**
 * Create a Router client instance with environment configuration
 */
export function createRouterClient(): CortensorRouterClient {
  const baseUrl = process.env.CORTENSOR_ROUTER_URL || "http://127.0.0.1:5010"
  const apiKey = process.env.CORTENSOR_API_KEY || ""

  return new CortensorRouterClient({
    baseUrl,
    apiKey,
    timeout: 30000,
  })
}

/**
 * Simulation mode for development without a running Router
 */
export class SimulatedRouterClient extends CortensorRouterClient {
  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<{
    response: string
    sessionId: string
    latencyMs: number
    full: ChatCompletionResponse
  }> {
    // Simulate network latency
    const latencyMs = Math.random() * 1000 + 500
    await new Promise((resolve) => setTimeout(resolve, latencyMs))

    const simulatedResponse = this.generateSimulatedResponse(request)
    const sessionId = `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const full: ChatCompletionResponse = {
      id: sessionId,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: simulatedResponse,
          },
          finish_reason: "stop",
        },
      ],
      session_id: sessionId,
    }

    return {
      response: simulatedResponse,
      sessionId,
      latencyMs,
      full,
    }
  }

  private generateSimulatedResponse(request: ChatCompletionRequest): string {
    const lastMessage = request.messages[request.messages.length - 1]
    const content = lastMessage.content.toLowerCase()

    // Generate contextual simulated responses
    if (content.includes("risk") || content.includes("security")) {
      return "Based on analysis, the contract exhibits low to medium risk. Key findings: No critical vulnerabilities detected. Standard ERC-20 implementation. Recommend additional testing for edge cases."
    }

    if (content.includes("contract") || content.includes("smart contract")) {
      return "Contract analysis complete. The smart contract follows best practices with proper access controls and event emissions. Total functions: 12. External calls are properly protected against reentrancy."
    }

    if (content.includes("transaction") || content.includes("transfer")) {
      return "Transaction pattern analysis shows normal activity. No suspicious patterns detected. Average gas usage: 45,000. Execution path follows expected behavior."
    }

    return `Analysis complete. ${Math.random() > 0.5 ? "No issues detected." : "Minor concerns identified."} Confidence: ${Math.floor(Math.random() * 20 + 75)}%. Session tracking enabled for verification.`
  }

  async validateSession(request: ValidationRequest): Promise<ValidationResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const baseScore = Math.random() * 30 + 70 // 70-100
    return {
      sessionId: request.sessionId,
      score: baseScore,
      metrics: {
        accuracy: Math.random() * 20 + 80,
        coherence: Math.random() * 20 + 75,
        relevance: Math.random() * 20 + 85,
      },
      validated: baseScore >= 75,
    }
  }

  async getStatus() {
    return {
      status: "simulated",
      version: "1.0.0-sim",
      uptime: Date.now(),
      activeModels: ["gpt-4", "gpt-3.5-turbo", "claude-3"],
    }
  }

  async listModels() {
    return ["gpt-4", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"]
  }
}

/**
 * Get the appropriate Router client based on environment
 */
export function getRouterClient(): CortensorRouterClient {
  const simulationMode = process.env.NEXT_PUBLIC_SIMULATION_MODE === "true"
  const apiKey = process.env.CORTENSOR_API_KEY

  if (simulationMode || !apiKey) {
    console.log("📝 Using Simulated Router Client (development mode)")
    return new SimulatedRouterClient({
      baseUrl: "http://localhost:5010",
      apiKey: "simulated",
    })
  }

  console.log("🚀 Using Real Cortensor Router Client")
  return createRouterClient()
}
