"""
Database connection module for Neon PostgreSQL.
Provides SQLModel engine, session management, and table creation.
"""

from sqlmodel import Session, SQLModel, create_engine
from typing import Generator
from src.config import settings

# Import models to register them with SQLModel.metadata
from src.models.user import User  # noqa: F401
from src.models.task import Task  # noqa: F401


# Create synchronous database engine with connection pooling
engine = create_engine(
    settings.database_url,
    echo=settings.debug,  # Log SQL queries in debug mode
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,  # Number of connections to maintain
    max_overflow=10,  # Maximum overflow connections
)


def create_db_and_tables():
    """Create all database tables defined in SQLModel models."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Used with FastAPI's Depends() for automatic session management.

    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        yield session
