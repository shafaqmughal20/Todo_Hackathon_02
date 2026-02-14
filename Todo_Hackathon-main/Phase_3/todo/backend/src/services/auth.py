"""
Authentication service for user signup, signin, and JWT token management.
"""

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlmodel import Session, select
from typing import Optional
import uuid

from src.models.user import User, UserCreate, UserLogin
from src.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a plain text password using bcrypt.

        Args:
            password: Plain text password

        Returns:
            Hashed password string
        """
        # Ensure password is within bcrypt's 72 byte limit
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain text password against a hashed password.

        Args:
            plain_password: Plain text password to verify
            hashed_password: Hashed password from database

        Returns:
            True if password matches, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(user_id: uuid.UUID) -> str:
        """
        Create a JWT access token for a user.

        Args:
            user_id: User's UUID

        Returns:
            JWT token string
        """
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expiration_minutes)
        to_encode = {
            "sub": str(user_id),
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        encoded_jwt = jwt.encode(
            to_encode,
            settings.better_auth_secret,
            algorithm=settings.jwt_algorithm,
        )
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[uuid.UUID]:
        """
        Verify a JWT token and extract the user ID.

        Args:
            token: JWT token string

        Returns:
            User UUID if token is valid, None otherwise
        """
        try:
            payload = jwt.decode(
                token,
                settings.better_auth_secret,
                algorithms=[settings.jwt_algorithm],
            )
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return uuid.UUID(user_id)
        except JWTError:
            return None

    @staticmethod
    def signup(session: Session, user_data: UserCreate) -> User:
        """
        Register a new user.

        Args:
            session: Database session
            user_data: User registration data

        Returns:
            Created user object

        Raises:
            ValueError: If email already exists
        """
        # Check if user already exists
        statement = select(User).where(User.email == user_data.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise ValueError("Email already registered")

        # Create new user with hashed password
        hashed_password = AuthService.hash_password(user_data.password)
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=hashed_password,
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        return new_user

    @staticmethod
    def signin(session: Session, login_data: UserLogin) -> Optional[User]:
        """
        Authenticate a user with email and password.

        Args:
            session: Database session
            login_data: User login credentials

        Returns:
            User object if authentication successful, None otherwise
        """
        # Find user by email
        statement = select(User).where(User.email == login_data.email)
        user = session.exec(statement).first()

        if not user:
            return None

        # Verify password
        if not AuthService.verify_password(login_data.password, user.password_hash):
            return None

        return user

    @staticmethod
    def get_user_by_id(session: Session, user_id: uuid.UUID) -> Optional[User]:
        """
        Get a user by their ID.

        Args:
            session: Database session
            user_id: User's UUID

        Returns:
            User object if found, None otherwise
        """
        return session.get(User, user_id)
