"""
MCP Server for Todo task operations.
Provides 5 tools for managing tasks through natural language.
"""

from typing import Optional, Dict, Any
from sqlmodel import Session, select
from src.database import engine
from src.models.task import Task
import uuid


def get_db_session():
    """Get database session."""
    return Session(engine)


def add_task(user_id: str, title: str, description: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new task for a user.

    Args:
        user_id: UUID of the user creating the task
        title: Task title
        description: Optional task description

    Returns:
        Dict with status, data, and message
    """
    try:
        with get_db_session() as session:
            # Convert user_id string to UUID
            user_uuid = uuid.UUID(user_id)

            # Create new task
            task = Task(
                user_id=user_uuid,
                title=title,
                description=description,
                completed=False
            )

            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "status": "success",
                "data": {
                    "task_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed
                },
                "message": f"Task '{title}' created successfully (ID: {task.id})"
            }
    except ValueError:
        return {
            "status": "error",
            "data": None,
            "message": "Invalid user_id format"
        }
    except Exception as e:
        return {
            "status": "error",
            "data": None,
            "message": f"Failed to create task: {str(e)}"
        }


def list_tasks(user_id: str, completed: Optional[bool] = None) -> Dict[str, Any]:
    """
    Retrieve all tasks for a specific user.

    Args:
        user_id: UUID of the user
        completed: Optional filter for completed status

    Returns:
        Dict with status, data, and message
    """
    try:
        with get_db_session() as session:
            # Convert user_id string to UUID
            user_uuid = uuid.UUID(user_id)

            # Build query
            query = select(Task).where(Task.user_id == user_uuid)
            if completed is not None:
                query = query.where(Task.completed == completed)

            # Execute query
            result = session.exec(query)
            tasks = result.all()

            # Format tasks
            task_list = [
                {
                    "task_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat()
                }
                for task in tasks
            ]

            # Generate message
            if not task_list:
                message = "You have no tasks"
            else:
                status_filter = "completed" if completed else "pending" if completed is False else ""
                message = f"Found {len(task_list)} {status_filter} task(s)".strip()

            return {
                "status": "success",
                "data": {
                    "tasks": task_list,
                    "count": len(task_list)
                },
                "message": message
            }
    except ValueError:
        return {
            "status": "error",
            "data": None,
            "message": "Invalid user_id format"
        }
    except Exception as e:
        return {
            "status": "error",
            "data": None,
            "message": f"Failed to retrieve tasks: {str(e)}"
        }


def complete_task(user_id: str, task_id: int) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        user_id: UUID of the user
        task_id: ID of the task to complete

    Returns:
        Dict with status, data, and message
    """
    try:
        with get_db_session() as session:
            # Convert user_id string to UUID
            user_uuid = uuid.UUID(user_id)

            # Find task and verify ownership
            result = session.exec(
                select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
            )
            task = result.first()

            if not task:
                return {
                    "status": "error",
                    "data": None,
                    "message": f"Task {task_id} not found or access denied"
                }

            # Check if already completed
            if task.completed:
                return {
                    "status": "success",
                    "data": {
                        "task_id": task.id,
                        "title": task.title,
                        "completed": True
                    },
                    "message": f"Task '{task.title}' is already completed"
                }

            # Mark as completed
            task.completed = True
            session.add(task)
            session.commit()
            session.refresh(task)

            return {
                "status": "success",
                "data": {
                    "task_id": task.id,
                    "title": task.title,
                    "completed": task.completed
                },
                "message": f"Task '{task.title}' marked as completed"
            }
    except ValueError:
        return {
            "status": "error",
            "data": None,
            "message": "Invalid user_id format"
        }
    except Exception as e:
        return {
            "status": "error",
            "data": None,
            "message": f"Failed to complete task: {str(e)}"
        }


def delete_task(user_id: str, task_id: int) -> Dict[str, Any]:
    """
    Delete a task.

    Args:
        user_id: UUID of the user
        task_id: ID of the task to delete

    Returns:
        Dict with status, data, and message
    """
    try:
        with get_db_session() as session:
            # Convert user_id string to UUID
            user_uuid = uuid.UUID(user_id)

            # Find task and verify ownership
            result = session.exec(
                select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
            )
            task = result.first()

            if not task:
                return {
                    "status": "error",
                    "data": None,
                    "message": f"Task {task_id} not found or access denied"
                }

            # Store title before deletion
            task_title = task.title

            # Delete task
            session.delete(task)
            session.commit()

            return {
                "status": "success",
                "data": {
                    "task_id": task_id,
                    "title": task_title
                },
                "message": f"Task '{task_title}' deleted successfully"
            }
    except ValueError:
        return {
            "status": "error",
            "data": None,
            "message": "Invalid user_id format"
        }
    except Exception as e:
        return {
            "status": "error",
            "data": None,
            "message": f"Failed to delete task: {str(e)}"
        }


def update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update a task's title and/or description.

    Args:
        user_id: UUID of the user
        task_id: ID of the task to update
        title: Optional new title
        description: Optional new description

    Returns:
        Dict with status, data, and message
    """
    try:
        with get_db_session() as session:
            # Convert user_id string to UUID
            user_uuid = uuid.UUID(user_id)

            # Find task and verify ownership
            result = session.exec(
                select(Task).where(Task.id == task_id, Task.user_id == user_uuid)
            )
            task = result.first()

            if not task:
                return {
                    "status": "error",
                    "data": None,
                    "message": f"Task {task_id} not found or access denied"
                }

            # Check if any updates provided
            if title is None and description is None:
                return {
                    "status": "error",
                    "data": None,
                    "message": "No updates provided. Specify title or description to update."
                }

            # Update fields
            old_title = task.title
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description

            session.add(task)
            session.commit()
            session.refresh(task)

            # Generate message
            changes = []
            if title is not None:
                changes.append(f"title updated to '{title}'")
            if description is not None:
                changes.append("description updated")

            return {
                "status": "success",
                "data": {
                    "task_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed
                },
                "message": f"Task '{old_title}' updated: {', '.join(changes)}"
            }
    except ValueError:
        return {
            "status": "error",
            "data": None,
            "message": "Invalid user_id format"
        }
    except Exception as e:
        return {
            "status": "error",
            "data": None,
            "message": f"Failed to update task: {str(e)}"
        }


# Export all tools
__all__ = [
    "add_task",
    "list_tasks",
    "complete_task",
    "delete_task",
    "update_task",
]
