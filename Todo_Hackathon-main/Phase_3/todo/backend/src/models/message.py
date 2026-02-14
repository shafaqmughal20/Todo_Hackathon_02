"""
Message model for chat messages.
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


class MessageBase(SQLModel):
    """Base message fields shared across schemas."""
    role: str = Field(max_length=50)  # 'user' | 'assistant' | 'tool'
    content: str = Field(max_length=10000)


class Message(MessageBase, table=True):
    """Message database model."""
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True, nullable=False)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)
    tool_calls: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")


class MessageCreate(SQLModel):
    """Schema for creating a new message."""
    conversation_id: int
    role: str = Field(max_length=50)
    content: str = Field(min_length=1, max_length=10000)
    tool_calls: Optional[Dict[str, Any]] = None


class MessageResponse(MessageBase):
    """Schema for message API responses."""
    id: int
    conversation_id: int
    user_id: uuid.UUID
    tool_calls: Optional[Dict[str, Any]]
    created_at: datetime
