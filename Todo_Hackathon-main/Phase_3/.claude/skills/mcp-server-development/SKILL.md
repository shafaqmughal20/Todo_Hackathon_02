---
name: mcp-server-development
description: Build Model Context Protocol (MCP) servers with proper tool registration, stateless design, database integration, and error handling for AI agent interactions.
---

# MCP Server Development Skill

## Instructions

1. **MCP Server Architecture**
   - Initialize server using FastMCP or mcp.server.Server() with proper configuration
   - Register tools with @mcp.tool() decorator for automatic schema generation from type hints
   - Use async/await patterns for all tool operations (required by MCP protocol)
   - Never use print() statements in STDIO servers (corrupts JSON-RPC communication)
   - Implement proper error handling with try/except blocks in all tools to prevent crashes

2. **Tool Definition Standards**
   - Name tools with snake_case and descriptive verbs (create_task, get_user_tasks, update_task_status)
   - Write clear docstrings that help LLMs understand when and how to use each tool
   - Use Python type hints for automatic JSON Schema generation (int, str, Optional[str], etc.)
   - Define required vs optional parameters explicitly with Optional[] or default values
   - Keep tool signatures simple with 3-7 parameters maximum for better usability

3. **Stateless Tool Design Principles**
   - Never store state between tool calls on the server (each call is independent)
   - Create fresh database sessions for each tool invocation using context managers
   - Use async context managers (async with) for automatic resource cleanup
   - Implement proper transaction handling with commit on success and rollback on error
   - Close connections and release resources before returning results to prevent leaks

4. **Database Integration Patterns**
   - Use SQLModel or SQLAlchemy with async sessions for non-blocking database operations
   - Implement dependency injection pattern for database session management
   - Handle database errors gracefully with specific exception types (IntegrityError, etc.)
   - Return structured data (dicts/lists) that LLMs can easily parse and understand
   - Use connection pooling for performance and efficient resource management

5. **Response Format Best Practices**
   - Return success/failure status explicitly in response structure ({"success": bool, ...})
   - Use consistent JSON response format across all tools for predictability
   - Include relevant IDs, confirmations, and affected record counts in responses
   - Provide clear error messages that LLMs can understand and communicate to users
   - Avoid ambiguous responses like "done" or "ok" without context or details

6. **Testing MCP Tools**
   - Write unit tests for each tool using pytest with @pytest.mark.asyncio decorator
   - Mock database operations using pytest fixtures or unittest.mock.AsyncMock
   - Test error scenarios (invalid input, database failures, missing records, permission denied)
   - Validate JSON schema generation from type hints matches expected structure
   - Perform integration tests with real database for critical paths and workflows

## Example Structure

```python
# ============================================================================
# Basic FastMCP Server Setup with Database Integration
# ============================================================================

from mcp.server.fastmcp import FastMCP
from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from contextlib import asynccontextmanager
from typing import Optional
from datetime import datetime
import json

# Initialize FastMCP server
mcp = FastMCP("todo-mcp-server")

# Database setup with async engine
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/todo_db"
engine = create_async_engine(DATABASE_URL, echo=True, pool_size=10, max_overflow=20)

# Define database models
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = None
    priority: str = Field(default="medium")
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# Async Context Manager for Database Sessions (Stateless Pattern)
# ============================================================================

@asynccontextmanager
async def get_session():
    """
    Async context manager for database sessions.
    Ensures proper transaction handling and resource cleanup.
    """
    async with AsyncSession(engine) as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# ============================================================================
# Tool 1: Create Task with Input Validation
# ============================================================================

@mcp.tool()
async def create_task(
    user_id: int,
    title: str,
    description: Optional[str] = None,
    priority: str = "medium"
) -> str:
    """
    Create a new task for a user.

    Use this tool when the user wants to add a new task to their todo list.
    Returns the created task with its ID and confirmation message.

    Args:
        user_id: ID of the user creating the task
        title: Task title (1-200 characters)
        description: Optional detailed description of the task
        priority: Task priority (low, medium, or high)
    """
    try:
        # Input validation
        if not title or len(title) > 200:
            return json.dumps({
                "success": False,
                "error": "Title must be between 1 and 200 characters"
            })

        if priority not in ["low", "medium", "high"]:
            return json.dumps({
                "success": False,
                "error": f"Invalid priority '{priority}'. Must be: low, medium, or high"
            })

        # Database operation with context manager
        async with get_session() as session:
            task = Task(
                user_id=user_id,
                title=title,
                description=description,
                priority=priority,
                completed=False
            )
            session.add(task)
            await session.flush()  # Get the ID before commit

            return json.dumps({
                "success": True,
                "message": f"Task '{title}' created successfully",
                "task_id": task.id,
                "task": {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat()
                }
            })

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Failed to create task: {str(e)}"
        })

# ============================================================================
# Tool 2: Get User Tasks with Query Filtering
# ============================================================================

@mcp.tool()
async def get_user_tasks(
    user_id: int,
    completed: Optional[bool] = None
) -> str:
    """
    Retrieve all tasks for a specific user.

    Use this tool to fetch a user's todo list. Optionally filter by completion status.
    Returns a list of tasks with their details.

    Args:
        user_id: ID of the user whose tasks to retrieve
        completed: Optional filter - True for completed, False for incomplete, None for all
    """
    try:
        async with get_session() as session:
            # Build query with optional filtering
            query = select(Task).where(Task.user_id == user_id)
            if completed is not None:
                query = query.where(Task.completed == completed)

            # Order by priority and creation date
            query = query.order_by(Task.completed, Task.priority, Task.created_at.desc())

            result = await session.execute(query)
            tasks = result.scalars().all()

            return json.dumps({
                "success": True,
                "user_id": user_id,
                "task_count": len(tasks),
                "tasks": [
                    {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "priority": task.priority,
                        "completed": task.completed,
                        "created_at": task.created_at.isoformat()
                    }
                    for task in tasks
                ]
            })

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Failed to retrieve tasks: {str(e)}"
        })

# ============================================================================
# Tool 3: Update Task Status with Permission Validation
# ============================================================================

@mcp.tool()
async def update_task_status(
    task_id: int,
    completed: bool,
    user_id: int
) -> str:
    """
    Mark a task as completed or incomplete.

    Use this tool when a user wants to check off a task or reopen it.
    Validates that the task belongs to the user before updating.

    Args:
        task_id: ID of the task to update
        completed: True to mark as completed, False to mark as incomplete
        user_id: ID of the user (for authorization)
    """
    try:
        async with get_session() as session:
            # Fetch task with user validation
            result = await session.execute(
                select(Task).where(
                    Task.id == task_id,
                    Task.user_id == user_id
                )
            )
            task = result.scalar_one_or_none()

            if not task:
                return json.dumps({
                    "success": False,
                    "error": f"Task {task_id} not found or does not belong to user {user_id}"
                })

            # Update status
            task.completed = completed
            await session.flush()

            status_text = "completed" if completed else "reopened"
            return json.dumps({
                "success": True,
                "message": f"Task '{task.title}' marked as {status_text}",
                "task_id": task.id,
                "completed": task.completed
            })

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Failed to update task status: {str(e)}"
        })

# ============================================================================
# Tool 4: Delete Task with Authorization
# ============================================================================

@mcp.tool()
async def delete_task(
    task_id: int,
    user_id: int
) -> str:
    """
    Delete a task permanently.

    Use this tool when a user wants to remove a task from their list.
    Validates ownership before deletion.

    Args:
        task_id: ID of the task to delete
        user_id: ID of the user (for authorization)
    """
    try:
        async with get_session() as session:
            # Fetch and validate ownership
            result = await session.execute(
                select(Task).where(
                    Task.id == task_id,
                    Task.user_id == user_id
                )
            )
            task = result.scalar_one_or_none()

            if not task:
                return json.dumps({
                    "success": False,
                    "error": f"Task {task_id} not found or access denied"
                })

            task_title = task.title
            await session.delete(task)
            await session.flush()

            return json.dumps({
                "success": True,
                "message": f"Task '{task_title}' deleted successfully",
                "task_id": task_id
            })

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": f"Failed to delete task: {str(e)}"
        })

# ============================================================================
# Testing Examples with Pytest
# ============================================================================

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

@pytest.mark.asyncio
async def test_create_task_success():
    """Test successful task creation"""
    with patch('your_module.get_session') as mock_get_session:
        # Setup mock session
        mock_session = AsyncMock()
        mock_get_session.return_value.__aenter__.return_value = mock_session

        # Mock task with ID
        mock_task = MagicMock()
        mock_task.id = 1
        mock_task.title = "Test Task"

        # Call tool
        result = await create_task(
            user_id=1,
            title="Test Task",
            description="Test Description",
            priority="high"
        )

        # Parse and verify response
        response = json.loads(result)
        assert response["success"] is True
        assert "task_id" in response
        assert response["task"]["title"] == "Test Task"

@pytest.mark.asyncio
async def test_create_task_invalid_priority():
    """Test task creation with invalid priority"""
    result = await create_task(
        user_id=1,
        title="Test Task",
        priority="urgent"  # Invalid priority
    )

    response = json.loads(result)
    assert response["success"] is False
    assert "Invalid priority" in response["error"]

@pytest.mark.asyncio
async def test_update_task_unauthorized():
    """Test updating task that doesn't belong to user"""
    with patch('your_module.get_session') as mock_get_session:
        mock_session = AsyncMock()
        mock_get_session.return_value.__aenter__.return_value = mock_session

        # Mock no task found
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result

        result = await update_task_status(
            task_id=999,
            completed=True,
            user_id=1
        )

        response = json.loads(result)
        assert response["success"] is False
        assert "not found" in response["error"]

# ============================================================================
# Server Startup
# ============================================================================

if __name__ == "__main__":
    # Run the MCP server with STDIO transport
    mcp.run()
```

## Key Patterns Summary

**Input Validation Pattern:**
```python
if not title or len(title) > 200:
    return json.dumps({"success": False, "error": "Title must be 1-200 characters"})
```

**Error Response Format:**
```python
return json.dumps({
    "success": False,
    "error": "Clear description of what went wrong"
})
```

**Success Response Format:**
```python
return json.dumps({
    "success": True,
    "message": "Human-readable confirmation",
    "task_id": task.id,
    "task": {...}  # Relevant data
})
```

**Database Session Pattern:**
```python
async with get_session() as session:
    # Database operations
    await session.flush()  # Get IDs before commit
    # Context manager handles commit/rollback/close automatically
```

**Permission Validation Pattern:**
```python
result = await session.execute(
    select(Task).where(Task.id == task_id, Task.user_id == user_id)
)
task = result.scalar_one_or_none()
if not task:
    return json.dumps({"success": False, "error": "Access denied"})
```
