"""
Chat endpoints for conversational task management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from src.database import get_session
from src.models.user import User
from src.models.conversation import Conversation
from src.models.message import Message
from src.api.middleware import get_current_user
from src.services.agent import TodoAgent


router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    conversation_id: Optional[int] = None
    message: str = Field(min_length=1, max_length=10000)


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    conversation_id: int
    response: str
    timestamp: str


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(
    request: ChatRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Process a chat message and return AI response.

    Args:
        request: Chat request with optional conversation_id and message
        session: Database session
        current_user: Authenticated user

    Returns:
        Chat response with conversation_id, response text, and timestamp

    Raises:
        HTTPException: If conversation not found or access denied
    """
    try:
        # Load or create conversation
        if request.conversation_id:
            # Load existing conversation
            result = session.exec(
                select(Conversation).where(
                    Conversation.id == request.conversation_id,
                    Conversation.user_id == current_user.id
                )
            )
            conversation = result.first()

            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
        else:
            # Create new conversation
            conversation = Conversation(user_id=current_user.id)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

        # Retrieve last 10 messages from conversation
        result = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .limit(10)
        )
        recent_messages = list(reversed(result.all()))

        # Format messages for Groq agent
        formatted_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in recent_messages
        ]

        # Add current user message
        formatted_messages.append({"role": "user", "content": request.message})

        # Initialize agent and get response
        agent = TodoAgent()
        agent_response = agent.chat(formatted_messages, str(current_user.id))

        # Store user message in database
        user_message = Message(
            conversation_id=conversation.id,
            user_id=current_user.id,
            role="user",
            content=request.message
        )
        session.add(user_message)

        # Store assistant response in database
        assistant_message = Message(
            conversation_id=conversation.id,
            user_id=current_user.id,
            role="assistant",
            content=agent_response["content"],
            tool_calls=agent_response.get("tool_calls")
        )
        session.add(assistant_message)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)

        # Commit all changes
        session.commit()

        # Return response
        return ChatResponse(
            conversation_id=conversation.id,
            response=agent_response["content"],
            timestamp=datetime.utcnow().isoformat()
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}"
        )


@router.get("/conversations", response_model=list, status_code=status.HTTP_200_OK)
async def list_conversations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    List all conversations for the current user.

    Args:
        session: Database session
        current_user: Authenticated user

    Returns:
        List of conversations with metadata
    """
    try:
        # Get all conversations for user
        result = session.exec(
            select(Conversation)
            .where(Conversation.user_id == current_user.id)
            .order_by(Conversation.updated_at.desc())
        )
        conversations = result.all()

        # Format response
        return [
            {
                "id": conv.id,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat()
            }
            for conv in conversations
        ]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversations: {str(e)}"
        )


@router.get("/conversations/{conversation_id}/messages", response_model=list, status_code=status.HTTP_200_OK)
async def get_conversation_messages(
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get all messages for a specific conversation.

    Args:
        conversation_id: ID of the conversation
        session: Database session
        current_user: Authenticated user

    Returns:
        List of messages in the conversation

    Raises:
        HTTPException: If conversation not found or access denied
    """
    try:
        # Verify conversation ownership
        result = session.exec(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id
            )
        )
        conversation = result.first()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found or access denied"
            )

        # Get all messages
        result = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        messages = result.all()

        # Format response
        return [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "tool_calls": msg.tool_calls,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve messages: {str(e)}"
        )
