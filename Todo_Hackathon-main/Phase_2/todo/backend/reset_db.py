"""
Script to drop and recreate database tables.
Run this to reset the database schema.
"""

from sqlmodel import SQLModel
from src.database import engine
from src.models.user import User
from src.models.task import Task

def reset_database():
    """Drop all tables and recreate them."""
    print("Dropping all tables...")
    SQLModel.metadata.drop_all(engine)
    print("Creating all tables...")
    SQLModel.metadata.create_all(engine)
    print("Database reset complete!")

if __name__ == "__main__":
    reset_database()
