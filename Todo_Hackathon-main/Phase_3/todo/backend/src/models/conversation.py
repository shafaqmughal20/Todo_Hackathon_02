"""
Conversation model for chat sessions.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid


class ConversationBase(SQLModel):
    """Base conversation fields shared across schemas."""
    pass


class Conversation(ConversationBase, table=True):
    """Conversation database model."""
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")


class ConversationResponse(ConversationBase):
    """Schema for conversation API responses."""
    id: int
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
