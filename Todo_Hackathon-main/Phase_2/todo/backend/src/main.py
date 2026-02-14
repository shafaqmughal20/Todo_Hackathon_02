"""
FastAPI main application for the Todo App backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.config import settings
from src.database import create_db_and_tables
from src.api.auth import router as auth_router
from src.api.tasks import router as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    Creates database tables on startup.
    """
    # Startup: Create database tables
    create_db_and_tables()
    yield
    # Shutdown: cleanup if needed


# Initialize FastAPI application
app = FastAPI(
    title="Todo App API",
    description="FastAPI backend for the full-stack todo application with JWT authentication",
    version="1.0.0",
    lifespan=lifespan,
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_url.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)


# Health check endpoint
@app.get("/", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify the API is running.

    Returns:
        Status message and environment information
    """
    return {
        "status": "healthy",
        "message": "Todo App API is running",
        "environment": settings.environment,
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
async def api_health_check():
    """
    API health check endpoint.

    Returns:
        Status message
    """
    return {
        "status": "healthy",
        "message": "API is operational",
    }
