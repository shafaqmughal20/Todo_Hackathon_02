# Todo App Backend

FastAPI backend for the full-stack todo application with JWT authentication and PostgreSQL database.

## Tech Stack

- **FastAPI 0.104.1** - Modern Python web framework
- **SQLModel 0.0.14** - SQL database ORM with Pydantic integration
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **JWT Authentication** - Secure token-based authentication with python-jose
- **Bcrypt** - Password hashing with passlib
- **Uvicorn** - ASGI server for running FastAPI

## Features

- User authentication (signup, signin, JWT tokens)
- Task CRUD operations (create, read, update, delete)
- Task completion toggle
- Multi-user data isolation (users can only access their own tasks)
- CORS enabled for frontend integration
- Automatic database table creation
- Connection pooling for optimal performance

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── middleware.py    # JWT validation middleware
│   │   └── tasks.py         # Task CRUD endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User model and schemas
│   │   └── task.py          # Task model and schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication service
│   │   └── tasks.py         # Task service
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection
│   └── main.py              # FastAPI application
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Environment variables template
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Setup Instructions

### 1. Prerequisites

- Python 3.11 or higher
- Neon PostgreSQL database (or any PostgreSQL database)
- pip (Python package manager)

### 2. Install Dependencies

```bash
cd phase-2/backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host/database

# Authentication Configuration
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long-change-this-in-production
BETTER_AUTH_URL=http://localhost:8002

# Application Configuration
ENVIRONMENT=development
DEBUG=True

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important:**
- Replace `DATABASE_URL` with your Neon PostgreSQL connection string
- Generate a secure random string for `BETTER_AUTH_SECRET` (minimum 32 characters)
- Update `FRONTEND_URL` if your frontend runs on a different port

### 4. Run the Application

```bash
# From the backend directory
uvicorn src.main:app --reload --host 0.0.0.0 --port 8002
```

The API will be available at `http://localhost:8002`

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI:** http://localhost:8002/docs
- **ReDoc:** http://localhost:8002/redoc

## API Endpoints

### Health Check

- `GET /` - Root health check
- `GET /api/health` - API health check

### Authentication

- `POST /api/auth/signup` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`
  - Returns: Access token and user information

- `POST /api/auth/signin` - Sign in with email and password
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Returns: Access token and user information

- `GET /api/auth/me` - Get current user information
  - Headers: `Authorization: Bearer <token>`
  - Returns: Current user information

### Tasks

All task endpoints require authentication (Bearer token in Authorization header).

- `GET /api/tasks` - Get all tasks for the current user
- `GET /api/tasks/{task_id}` - Get a specific task
- `POST /api/tasks` - Create a new task
  - Body: `{ "title": "Task title", "description": "Optional description" }`
- `PUT /api/tasks/{task_id}` - Update a task
  - Body: `{ "title": "Updated title", "description": "Updated description", "completed": true }`
- `DELETE /api/tasks/{task_id}` - Delete a task
- `PATCH /api/tasks/{task_id}/toggle` - Toggle task completion status

## Authentication Flow

1. **Signup:** User registers with email, password, and name
2. **Signin:** User authenticates with email and password
3. **Token:** Server returns JWT access token
4. **Protected Routes:** Client includes token in Authorization header: `Bearer <token>`
5. **Token Validation:** Middleware validates token and extracts user information

## Database Schema

### Users Table

- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `name` (String)
- `password_hash` (String)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Tasks Table

- `id` (Integer, Primary Key, Auto-increment)
- `user_id` (UUID, Foreign Key to users.id)
- `title` (String, max 500 characters)
- `description` (String, max 5000 characters, nullable)
- `completed` (Boolean, default False)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Token expiration (7 days by default)
- User data isolation (users can only access their own tasks)
- CORS protection (only allows requests from configured frontend URL)
- SQL injection protection (SQLModel parameterized queries)

## Development

### Running in Development Mode

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8002
```

The `--reload` flag enables auto-reload on code changes.

### Running in Production Mode

```bash
# Update .env
ENVIRONMENT=production
DEBUG=False

# Run with production settings
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure your Neon PostgreSQL database is accessible
- Check if your IP is whitelisted in Neon dashboard

### Authentication Issues

- Ensure `BETTER_AUTH_SECRET` is at least 32 characters
- Verify the token is included in the Authorization header
- Check token expiration (default 7 days)

### CORS Issues

- Verify `FRONTEND_URL` matches your frontend application URL
- Ensure credentials are included in frontend requests

## License

MIT
