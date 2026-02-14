---
id: 0002
title: Create Fullstack Todo App Plan
stage: plan
date: 2026-02-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-fullstack-todo-app
branch: 001-fullstack-todo-app
user: DELL
command: /sp.plan
labels: ["plan", "phase-2", "architecture", "design", "research", "fastapi", "nextjs"]
links:
  spec: specs/001-fullstack-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-fullstack-todo-app/plan.md
  - specs/001-fullstack-todo-app/research.md
  - specs/001-fullstack-todo-app/data-model.md
  - specs/001-fullstack-todo-app/contracts/openapi.yaml
  - specs/001-fullstack-todo-app/contracts/schemas.json
  - specs/001-fullstack-todo-app/quickstart.md
  - CLAUDE.md (updated with active technologies)
tests:
  - none
---

## Prompt

```text
/sp.plan

phase: phase-2
folder: /phase-2

title: "Phase II — Full-Stack Web Application Planning"

objectives:
  - Design architecture for frontend, backend, and database
  - Define API contracts and data models
  - Sequence implementation steps
  - Identify dependencies and integration points

architecture:
  frontend:
    - Next.js (App Router) + Tailwind CSS
    - Auth flow with Better Auth
    - JWT token handling
    - UI components for task CRUD

  backend:
    - FastAPI + SQLModel
    - REST endpoints under /api/{user_id}/tasks
    - JWT middleware for authentication
    - User-level data isolation enforced

  database:
    - Neon PostgreSQL
    - Tables: users, tasks
    - Relationships: one-to-many (user → tasks)
    - Indexes on user_id, completed

api_contracts:
  - GET /api/{user_id}/tasks → list tasks
  - POST /api/{user_id}/tasks → create task
  - GET /api/{user_id}/tasks/{id} → get task
  - PUT /api/{user_id}/tasks/{id} → update task
  - DELETE /api/{user_id}/tasks/{id} → delete task
  - PATCH /api/{user_id}/tasks/{id}/complete → toggle completion

plan:
  - Step 1: Setup repo + branch
  - Step 2: Configure Neon DB + schema
  - Step 3: Implement FastAPI backend
  - Step 4: Integrate JWT auth
  - Step 5: Build Next.js frontend
  - Step 6: Connect frontend to backend
  - Step 7: Test full workflow
  - Step 8: Document + finalize

constraints:
  - All code generated via Claude Code
  - Work inside /phase-2 folder only
  - No scope expansion beyond specification
  - JWT secret shared via env variable BETTER_AUTH_SECRET

deliverables:
  - Architecture diagram
  - API contract doc
  - Implementation plan doc
  - Updated PHR entry
```

## Response snapshot

Created comprehensive implementation plan with Phase 0 (Research) and Phase 1 (Design) completed:

**Constitution Check**: All 6 principles validated and passed
- Spec-driven workflow maintained
- AI-generated implementation enforced
- Workspace isolation confirmed (/phase-2 folder)
- Documentation chain established
- Security enforced at all layers
- Approved technology stack used

**Phase 0 - Research** (research.md):
- Resolved 6 technical unknowns with decisions and rationale
- Better Auth integration pattern: Frontend only, backend validates JWT
- JWT flow: httpOnly cookies + Authorization header
- Neon connection: SQLModel + asyncpg with connection pooling
- SQLModel relationships: Foreign key with Relationship field
- Next.js auth: Middleware + React Context pattern
- FastAPI JWT: Dependency injection for validation

**Phase 1 - Design** (data-model.md, contracts/, quickstart.md):
- Data model: User and Task entities with full field definitions, validation rules, indexes
- API contracts: OpenAPI 3.0 spec with 6 REST endpoints, request/response schemas
- JSON schemas: Complete validation schemas with examples
- Quickstart guide: Comprehensive setup instructions for local development

**Project Structure**: Web application (frontend + backend) with detailed directory layout for both Python (FastAPI) and TypeScript (Next.js) projects

## Outcome

- ✅ Impact: Created complete architectural plan with research, data models, API contracts, and setup guide for Phase II full-stack web application
- 🧪 Tests: No tests required (planning artifacts)
- 📁 Files: Created 6 planning documents (plan.md, research.md, data-model.md, openapi.yaml, schemas.json, quickstart.md) + updated CLAUDE.md
- 🔁 Next prompts: /sp.tasks (generate implementation tasks), /sp.adr (document architectural decisions if needed)
- 🧠 Reflection: Planning phase successfully completed all required artifacts. Constitution check passed all gates. Research resolved all technical unknowns with clear decisions. Design phase produced comprehensive data models, API contracts, and developer documentation. Ready for task breakdown.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution Check PASSED (all 6 principles validated)
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 0 (Research) and Phase 1 (Design)
- Next experiment (smallest change to try): N/A
