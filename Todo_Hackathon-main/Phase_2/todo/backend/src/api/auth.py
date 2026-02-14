"""
Authentication endpoints for user signup, signin, and profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from src.database import get_session
from src.models.user import User, UserCreate, UserLogin, UserResponse
from src.services.auth import AuthService
from src.api.middleware import get_current_user


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    session: Session = Depends(get_session),
):
    """
    Register a new user.

    Args:
        user_data: User registration data (email, password, name)
        session: Database session

    Returns:
        Access token and user information

    Raises:
        HTTPException: If email already exists
    """
    try:
        # Create new user
        user = AuthService.signup(session, user_data)

        # Generate access token
        access_token = AuthService.create_access_token(user.id)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=user.id,
                email=user.email,
                name=user.name,
                created_at=user.created_at,
                updated_at=user.updated_at,
            ),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/signin", response_model=dict)
async def signin(
    login_data: UserLogin,
    session: Session = Depends(get_session),
):
    """
    Authenticate a user and return access token.

    Args:
        login_data: User login credentials (email, password)
        session: Database session

    Returns:
        Access token and user information

    Raises:
        HTTPException: If credentials are invalid
    """
    # Authenticate user
    user = AuthService.signin(session, login_data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate access token
    access_token = AuthService.create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at,
            updated_at=user.updated_at,
        ),
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user information.

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        User information
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )
