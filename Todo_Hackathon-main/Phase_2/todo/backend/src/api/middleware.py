"""
Middleware for JWT token validation and user authentication.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from typing import Optional

from src.database import get_session
from src.services.auth import AuthService
from src.models.user import User


# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer token from Authorization header
        session: Database session

    Returns:
        Current authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials

    # Verify token and extract user_id
    user_id = AuthService.verify_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = AuthService.get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    session: Session = Depends(get_session),
) -> Optional[User]:
    """
    Dependency to get the current user if authenticated, None otherwise.
    Useful for optional authentication on public endpoints.

    Args:
        credentials: HTTP Bearer token from Authorization header (optional)
        session: Database session

    Returns:
        Current authenticated user or None
    """
    if credentials is None:
        return None

    token = credentials.credentials
    user_id = AuthService.verify_token(token)
    if user_id is None:
        return None

    user = AuthService.get_user_by_id(session, user_id)
    return user
