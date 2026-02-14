---
name: database-skill
description: Handle database tasks including creating tables, running migrations, and designing schemas for scalable applications.
---

# Database Skill

## Instructions

1. **Schema Design**
   - Plan entities and relationships (1:1, 1:N, N:M)
   - Define primary keys, foreign keys, and indexes
   - Normalize tables to reduce redundancy
   - Consider future scalability and query performance

2. **Creating Tables**
   - Use SQL or ORM syntax to define tables
   - Set proper data types for each column
   - Include constraints like NOT NULL, UNIQUE, CHECK
   - Add default values where appropriate

3. **Migrations**
   - Use migration tools (e.g., Sequelize, TypeORM, Alembic)
   - Track schema changes version-wise
   - Apply migrations to dev, staging, and production databases
   - Rollback migrations safely if needed

4. **Database Best Practices**
   - Keep table and column names consistent
   - Use indexes wisely for performance optimization
   - Avoid storing sensitive data in plain text
   - Backup database regularly
   - Document schema and migration steps clearly

## Example Structure
```sql
-- Example table creation
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example migration (PostgreSQL)
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
