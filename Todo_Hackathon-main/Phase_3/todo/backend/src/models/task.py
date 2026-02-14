"""
Task model for todo items.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid


class TaskBase(SQLModel):
    """Base task fields shared across schemas."""
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False)


class Task(TaskBase, table=True):
    """Task database model."""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(SQLModel):
    """Schema for creating a new task."""
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)


class TaskUpdate(SQLModel):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: Optional[bool] = Field(default=None)


class TaskResponse(TaskBase):
    """Schema for task API responses."""
    id: int
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
