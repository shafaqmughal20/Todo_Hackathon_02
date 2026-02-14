"""
Task endpoints for CRUD operations on todo items.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from src.database import get_session
from src.models.user import User
from src.models.task import Task, TaskCreate, TaskUpdate, TaskResponse
from src.services.tasks import TaskService
from src.api.middleware import get_current_user


router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
async def get_all_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get all tasks for the current user.

    Args:
        current_user: Current authenticated user
        session: Database session

    Returns:
        List of tasks belonging to the user
    """
    tasks = TaskService.get_all_tasks(session, current_user.id)
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get a specific task by ID.

    Args:
        task_id: Task ID
        current_user: Current authenticated user
        session: Database session

    Returns:
        Task details

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = TaskService.get_task_by_id(session, task_id, current_user.id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new task.

    Args:
        task_data: Task creation data
        current_user: Current authenticated user
        session: Database session

    Returns:
        Created task
    """
    task = TaskService.create_task(session, task_data, current_user.id)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update an existing task.

    Args:
        task_id: Task ID
        task_data: Task update data
        current_user: Current authenticated user
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = TaskService.update_task(session, task_id, task_data, current_user.id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Delete a task.

    Args:
        task_id: Task ID
        current_user: Current authenticated user
        session: Database session

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    success = TaskService.delete_task(session, task_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task_completion(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Toggle the completion status of a task.

    Args:
        task_id: Task ID
        current_user: Current authenticated user
        session: Database session

    Returns:
        Updated task with toggled completion status

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = TaskService.toggle_task_completion(session, task_id, current_user.id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task
