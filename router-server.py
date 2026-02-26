#!/usr/bin/env python3
"""
Cortensor Router Server
Handles inference routing, session management, and API endpoints
Supports clean demo restarts with fresh state initialization
"""

import os
import json
import time
import logging
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Header, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# ============================================================================
# CONFIGURATION & INITIALIZATION
# ============================================================================

# Start time - initialized at server boot (NEVER reset after startup)
START_TIME = time.time()
START_TIME_ISO = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "info").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ============================================================================
# STATE MANAGEMENT (Reset on startup, never during runtime)
# ============================================================================

@dataclass
class SessionState:
    """Tracks a single inference session"""
    session_id: str
    created_at: float
    model_name: str
    inference_count: int = 0
    last_inference_time: Optional[float] = None
    response_cache: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.response_cache is None:
            self.response_cache = {}


class RouterState:
    """In-memory router state - reset on every server restart"""
    
    def __init__(self):
        self.reset()
    
    def reset(self):
        """Reset all in-memory session tracking"""
        logger.info("🔄 Resetting in-memory session tracking...")
        
        self.sessions: Dict[str, SessionState] = {}
        self.active_session_ids: List[str] = []
        self.inference_request_count = 0
        self.total_inference_time_ms = 0
        self.model_name = os.getenv("MODEL_NAME", "gemini-2.0-flash")
        self.cache_enabled = False  # IMPORTANT: Disable caching across restarts
        
        logger.info(f"✅ Session state reset complete. Cache disabled for fresh demo.")
    
    def create_session(self) -> str:
        """Create a new inference session"""
        session_id = f"session_{uuid.uuid4().hex[:12]}"
        session = SessionState(
            session_id=session_id,
            created_at=time.time(),
            model_name=self.model_name
        )
        self.sessions[session_id] = session
        self.active_session_ids.append(session_id)
        
        logger.info(
            f"➕ New inference session created: {session_id} "
            f"(Total active: {len(self.active_session_ids)})"
        )
        
        return session_id
    
    def record_inference(self, session_id: str, latency_ms: int):
        """Record a completed inference"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            session.inference_count += 1
            session.last_inference_time = time.time()
            
            self.inference_request_count += 1
            self.total_inference_time_ms += latency_ms
            
            logger.info(
                f"📊 Inference recorded for {session_id}: "
                f"+{latency_ms}ms (session total: {session.inference_count})"
            )
    
    def get_active_session_count(self) -> int:
        """Get count of active sessions"""
        return len(self.active_session_ids)
    
    def get_uptime_seconds(self) -> float:
        """Get server uptime from boot"""
        return time.time() - START_TIME


# Initialize router state
router_state = RouterState()

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2048
    stream: Optional[bool] = False


class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "text_completion"
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]
    session_id: str
    inference_latency_ms: int


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    inference_engine: str
    inference_request_count: int
    model_name: str
    server_start_time: str
    boot_timestamp_unix: float


class StatusResponse(BaseModel):
    status: str
    model_name: str
    active_session_count: int
    inference_request_count: int
    uptime_seconds: float
    cache_enabled: bool
    api_version: str


# ============================================================================
# INFERENCE ENGINE (Simulated for demo)
# ============================================================================

async def gemini_inference(
    messages: List[ChatMessage],
    model: str,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> tuple[str, int]:
    """
    Simulate Gemini inference
    Returns: (response_text, latency_ms)
    
    In production: Replace with actual Gemini API call
    """
    
    start_time = time.time()
    
    # Simulate inference delay (50-200ms)
    await asyncio.sleep(0.1)
    
    # Generate demo response
    last_message = messages[-1].content if messages else "Hello"
    response_text = f"[{model}] Analyzed: {last_message[:50]}... (Demo Response)"
    
    latency_ms = int((time.time() - start_time) * 1000)
    
    logger.info(f"⚡ Gemini inference complete: {latency_ms}ms, model={model}")
    
    return response_text, latency_ms


# ============================================================================
# API ENDPOINTS
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    
    # STARTUP
    logger.info("=" * 70)
    logger.info("🚀 Router booted successfully")
    logger.info(f"   Timestamp: {START_TIME_ISO}")
    logger.info(f"   Unix timestamp: {START_TIME}")
    logger.info(f"   Model: {router_state.model_name}")
    logger.info(f"   API Key: {'✅ Detected' if os.getenv('API_KEY') else '⚠️ Missing'}")
    logger.info(f"   Server listening on 0.0.0.0:5010")
    logger.info("=" * 70)
    
    yield
    
    # SHUTDOWN
    logger.info("🛑 Router shutting down...")
    logger.info(f"   Total inferences: {router_state.inference_request_count}")
    logger.info(f"   Active sessions: {router_state.get_active_session_count()}")


app = FastAPI(
    title="Cortensor Router API",
    description="Inference routing with consensus validation",
    version="1.0.0",
    lifespan=lifespan
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.debug(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {process_time*1000:.1f}ms"
    )
    
    return response


@app.post("/v1/chat/completions", response_model=ChatCompletionResponse)
async def chat_completions(
    request: ChatCompletionRequest,
    authorization: Optional[str] = Header(None),
):
    """
    OpenAI-compatible chat completion endpoint
    """
    
    # Verify API key
    api_key = os.getenv("API_KEY")
    if not api_key or authorization != f"Bearer {api_key}":
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        # Create new session for this inference
        session_id = router_state.create_session()
        
        # Run inference
        response_text, latency_ms = await gemini_inference(
            messages=request.messages,
            model=request.model,
            temperature=request.temperature or 0.7,
            max_tokens=request.max_tokens or 2048,
        )
        
        # Record inference metrics
        router_state.record_inference(session_id, latency_ms)
        
        # Build response
        response_id = f"chatcmpl_{uuid.uuid4().hex[:12]}"
        
        return ChatCompletionResponse(
            id=response_id,
            created=int(time.time()),
            model=request.model,
            choices=[
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_text,
                    },
                    "finish_reason": "stop",
                }
            ],
            usage={
                "prompt_tokens": len(" ".join([m.content for m in request.messages])) // 4,
                "completion_tokens": len(response_text) // 4,
                "total_tokens": (len(" ".join([m.content for m in request.messages])) + len(response_text)) // 4,
            },
            session_id=session_id,
            inference_latency_ms=latency_ms,
        )
    
    except Exception as e:
        logger.error(f"❌ Inference error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    Shows fresh uptime_seconds from server boot
    """
    
    return HealthResponse(
        status="healthy",
        uptime_seconds=router_state.get_uptime_seconds(),
        inference_engine="gemini-inference",
        inference_request_count=router_state.inference_request_count,
        model_name=router_state.model_name,
        server_start_time=START_TIME_ISO,
        boot_timestamp_unix=START_TIME,
    )


@app.get("/v1/status", response_model=StatusResponse)
async def router_status():
    """
    Router status endpoint
    Reflects current model and active session count
    """
    
    return StatusResponse(
        status="operational",
        model_name=router_state.model_name,
        active_session_count=router_state.get_active_session_count(),
        inference_request_count=router_state.inference_request_count,
        uptime_seconds=router_state.get_uptime_seconds(),
        cache_enabled=router_state.cache_enabled,
        api_version="v1",
    )


@app.post("/v1/sessions/create")
async def create_session():
    """Manually create a new session (for clean demo flow)"""
    
    session_id = router_state.create_session()
    
    return {
        "status": "success",
        "session_id": session_id,
        "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "model": router_state.model_name,
    }


@app.get("/v1/sessions")
async def list_sessions():
    """List all active sessions"""
    
    sessions_data = []
    
    for session_id, session in router_state.sessions.items():
        sessions_data.append({
            "session_id": session_id,
            "created_at": datetime.fromtimestamp(session.created_at, tz=timezone.utc).isoformat().replace("+00:00", "Z"),
            "model_name": session.model_name,
            "inference_count": session.inference_count,
            "last_inference_time": (
                datetime.fromtimestamp(session.last_inference_time, tz=timezone.utc).isoformat().replace("+00:00", "Z")
                if session.last_inference_time else None
            ),
        })
    
    return {
        "status": "success",
        "total_sessions": len(sessions_data),
        "sessions": sessions_data,
    }


@app.post("/v1/reset")
async def reset_state():
    """
    Force reset of in-memory state (for testing)
    ⚠️ WARNING: For development only, not for production
    """
    
    router_state.reset()
    
    return {
        "status": "success",
        "message": "Router state reset complete",
        "uptime_seconds": router_state.get_uptime_seconds(),
    }


@app.get("/")
async def root():
    """Root endpoint"""
    
    return {
        "name": "Cortensor Router API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "chat_completions": "/v1/chat/completions",
            "health": "/v1/health",
            "status": "/v1/status",
            "sessions": "/v1/sessions",
            "create_session": "/v1/sessions/create",
            "docs": "/docs",
            "cleanup": "/v1/reset (dev only)",
        },
    }


# ============================================================================
# SERVER STARTUP
# ============================================================================

async def main():
    """Start the server"""
    
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=5010,
        log_level=LOG_LEVEL.lower(),
        access_log=True,
    )
    
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    import asyncio
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Interrupt received, shutting down...")
