"""
User model for authentication and user management.
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class UserBase(SQLModel):
    """Base user fields shared across schemas."""
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)


class User(UserBase, table=True):
    """User database model."""
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    """Schema for user registration."""
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=100)
    name: str = Field(max_length=255)


class UserLogin(SQLModel):
    """Schema for user login."""
    email: str = Field(max_length=255)
    password: str = Field(max_length=100)


class UserResponse(UserBase):
    """Schema for user API responses (excludes password_hash)."""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
