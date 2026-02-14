# Data Model: Phase II — Full-Stack Web Application

**Feature**: 001-fullstack-todo-app
**Date**: 2026-02-07
**Purpose**: Define entities, relationships, and validation rules for the application

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │──┐
│ email           │  │
│ password_hash   │  │
│ created_at      │  │
└─────────────────┘  │
                     │ 1:N
                     │
                     ▼
              ┌─────────────────┐
              │      Task       │
              ├─────────────────┤
              │ id (PK)         │
              │ user_id (FK)    │
              │ title           │
              │ description     │
              │ completed       │
              │ created_at      │
              │ updated_at      │
              └─────────────────┘
```

**Relationship**: One User has many Tasks (1:N)

---

## Entity: User

**Purpose**: Represents an authenticated user account

### Fields

| Field          | Type      | Constraints                    | Description                          |
|----------------|-----------|--------------------------------|--------------------------------------|
| id             | String    | PRIMARY KEY, UUID              | Unique user identifier               |
| email          | String    | UNIQUE, NOT NULL, max 255      | User email address (login)           |
| password_hash  | String    | NOT NULL, max 255              | Bcrypt hashed password               |
| created_at     | DateTime  | NOT NULL, default NOW()        | Account creation timestamp           |

### Validation Rules

- **email**:
  - Must be valid email format (RFC 5322)
  - Must be unique across all users
  - Case-insensitive comparison
  - Max length: 255 characters

- **password** (before hashing):
  - Minimum 8 characters
  - Must contain at least one letter and one number
  - Max length: 128 characters (before hashing)

- **id**:
  - Generated as UUID v4
  - Immutable after creation

### Indexes

- PRIMARY KEY on `id`
- UNIQUE INDEX on `email` (case-insensitive)

### Relationships

- **tasks**: One-to-many relationship with Task entity
  - Cascade delete: When user deleted, all their tasks are deleted
  - Back-populates: `Task.owner`

### State Transitions

- **Created**: User account created via signup
- **Active**: User can sign in and access application
- **Deleted**: User account removed (soft delete not implemented in Phase II)

---

## Entity: Task

**Purpose**: Represents a todo item owned by a user

### Fields

| Field       | Type      | Constraints                    | Description                          |
|-------------|-----------|--------------------------------|--------------------------------------|
| id          | Integer   | PRIMARY KEY, AUTO INCREMENT    | Unique task identifier               |
| user_id     | String    | FOREIGN KEY (user.id), NOT NULL| Owner user ID                        |
| title       | String    | NOT NULL, max 500              | Task title                           |
| description | String    | NULLABLE, max 5000             | Optional task description            |
| completed   | Boolean   | NOT NULL, default FALSE        | Completion status                    |
| created_at  | DateTime  | NOT NULL, default NOW()        | Task creation timestamp              |
| updated_at  | DateTime  | NOT NULL, default NOW()        | Last modification timestamp          |

### Validation Rules

- **title**:
  - Required (cannot be empty or whitespace only)
  - Min length: 1 character (after trimming)
  - Max length: 500 characters
  - Trimmed before storage

- **description**:
  - Optional (can be null or empty)
  - Max length: 5000 characters
  - Trimmed before storage if provided

- **completed**:
  - Boolean value only (true/false)
  - Defaults to false on creation

- **user_id**:
  - Must reference existing user
  - Cannot be null
  - Cannot be changed after creation (immutable)

- **updated_at**:
  - Automatically updated on any field modification
  - Cannot be manually set

### Indexes

- PRIMARY KEY on `id`
- INDEX on `user_id` (for efficient user-specific queries)
- INDEX on `completed` (for filtering by status)
- COMPOSITE INDEX on `(user_id, completed)` (for filtered user queries)

### Relationships

- **owner**: Many-to-one relationship with User entity
  - Foreign key: `user_id` references `user.id`
  - On delete: CASCADE (delete tasks when user deleted)
  - Back-populates: `User.tasks`

### State Transitions

```
[Created] ──────────────────────────────────────────┐
   │                                                 │
   │ (user creates task)                             │
   ▼                                                 │
[Incomplete] ◄──────────────────────────────────┐   │
   │                                             │   │
   │ (user marks complete)                       │   │
   ▼                                             │   │
[Complete]                                       │   │
   │                                             │   │
   │ (user marks incomplete)                     │   │
   └─────────────────────────────────────────────┘   │
   │                                                 │
   │ (user deletes task)                             │
   ▼                                                 │
[Deleted] ◄─────────────────────────────────────────┘
```

---

## Database Schema (SQL)

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Data Constraints Summary

### User Entity
- Email uniqueness enforced at database level
- Password hashing required before storage (never store plaintext)
- UUID generation for id field

### Task Entity
- User_id must reference valid user (foreign key constraint)
- Title cannot be empty (application-level validation)
- Description length limited to prevent abuse
- Timestamps managed automatically by database

### Cross-Entity Rules
- User deletion cascades to all their tasks
- Task queries must always filter by user_id (security requirement)
- No cross-user task access permitted

---

## Migration Strategy

### Initial Schema Creation
1. Create users table with indexes
2. Create tasks table with foreign key and indexes
3. Create trigger for updated_at automation
4. Verify constraints and indexes

### Data Seeding (Development Only)
- Create test users with known credentials
- Create sample tasks for each test user
- Verify data isolation between users

### Rollback Plan
- Drop tasks table (removes foreign key dependency)
- Drop users table
- Drop trigger function

---

## Performance Considerations

### Query Optimization
- All task queries use `user_id` index (O(log n) lookup)
- Completed status filtering uses composite index
- Email lookup uses unique index (O(1) lookup)

### Expected Query Patterns
1. **List user tasks**: `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`
   - Uses: `idx_tasks_user_id`
   - Performance: Fast (indexed)

2. **Filter by completion**: `SELECT * FROM tasks WHERE user_id = ? AND completed = ?`
   - Uses: `idx_tasks_user_completed`
   - Performance: Very fast (composite index)

3. **Get single task**: `SELECT * FROM tasks WHERE id = ? AND user_id = ?`
   - Uses: Primary key + user_id check
   - Performance: Very fast

### Scalability Notes
- Indexes support 10,000+ users without degradation
- Connection pooling handles concurrent requests
- Neon auto-scaling handles load spikes
