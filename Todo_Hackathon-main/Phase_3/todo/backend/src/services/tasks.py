"""
Task service for CRUD operations on todo items.
"""

from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
import uuid

from src.models.task import Task, TaskCreate, TaskUpdate


class TaskService:
    """Service for task CRUD operations."""

    @staticmethod
    def get_all_tasks(session: Session, user_id: uuid.UUID) -> List[Task]:
        """
        Get all tasks for a specific user.

        Args:
            session: Database session
            user_id: User's UUID

        Returns:
            List of tasks belonging to the user
        """
        statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        tasks = session.exec(statement).all()
        return list(tasks)

    @staticmethod
    def get_task_by_id(session: Session, task_id: int, user_id: uuid.UUID) -> Optional[Task]:
        """
        Get a specific task by ID, ensuring it belongs to the user.

        Args:
            session: Database session
            task_id: Task ID
            user_id: User's UUID

        Returns:
            Task if found and belongs to user, None otherwise
        """
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = session.exec(statement).first()
        return task

    @staticmethod
    def create_task(session: Session, task_data: TaskCreate, user_id: uuid.UUID) -> Task:
        """
        Create a new task for a user.

        Args:
            session: Database session
            task_data: Task creation data
            user_id: User's UUID

        Returns:
            Created task object
        """
        new_task = Task(
            title=task_data.title,
            description=task_data.description,
            user_id=user_id,
            completed=False,
        )

        session.add(new_task)
        session.commit()
        session.refresh(new_task)

        return new_task

    @staticmethod
    def update_task(
        session: Session,
        task_id: int,
        task_data: TaskUpdate,
        user_id: uuid.UUID,
    ) -> Optional[Task]:
        """
        Update an existing task.

        Args:
            session: Database session
            task_id: Task ID
            task_data: Task update data
            user_id: User's UUID

        Returns:
            Updated task if found and belongs to user, None otherwise
        """
        # Get task and verify ownership
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task is None:
            return None

        # Update fields if provided
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.completed is not None:
            task.completed = task_data.completed

        # Update timestamp
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, task_id: int, user_id: uuid.UUID) -> bool:
        """
        Delete a task.

        Args:
            session: Database session
            task_id: Task ID
            user_id: User's UUID

        Returns:
            True if task was deleted, False if not found or doesn't belong to user
        """
        # Get task and verify ownership
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task is None:
            return False

        session.delete(task)
        session.commit()

        return True

    @staticmethod
    def toggle_task_completion(session: Session, task_id: int, user_id: uuid.UUID) -> Optional[Task]:
        """
        Toggle the completion status of a task.

        Args:
            session: Database session
            task_id: Task ID
            user_id: User's UUID

        Returns:
            Updated task if found and belongs to user, None otherwise
        """
        # Get task and verify ownership
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task is None:
            return None

        # Toggle completion status
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task
