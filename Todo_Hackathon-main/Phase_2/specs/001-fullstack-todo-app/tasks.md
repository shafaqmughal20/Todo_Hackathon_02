# Tasks: Phase II — Full-Stack Web Application

**Input**: Design documents from `/specs/001-fullstack-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not included in this task breakdown as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend: Python with FastAPI, SQLModel
- Frontend: TypeScript with Next.js App Router, Tailwind CSS

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure in phase-2/backend/
- [ ] T002 Create frontend directory structure in phase-2/frontend/
- [ ] T003 [P] Initialize Python project with requirements.txt in phase-2/backend/
- [ ] T004 [P] Initialize Next.js project with package.json in phase-2/frontend/
- [ ] T005 [P] Create backend .env.example file in phase-2/backend/
- [ ] T006 [P] Create frontend .env.local.example file in phase-2/frontend/
- [ ] T007 [P] Configure Tailwind CSS in phase-2/frontend/tailwind.config.js
- [ ] T008 [P] Create TypeScript config in phase-2/frontend/tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create database connection module in phase-2/backend/src/database.py
- [ ] T010 Create configuration module in phase-2/backend/src/config.py
- [ ] T011 Create Neon PostgreSQL users table with schema from data-model.md
- [ ] T012 Create Neon PostgreSQL tasks table with schema from data-model.md
- [ ] T013 Create database indexes on tasks(user_id) and tasks(completed)
- [ ] T014 Create FastAPI main app in phase-2/backend/src/main.py
- [ ] T015 [P] Create Next.js root layout in phase-2/frontend/src/app/layout.tsx
- [ ] T016 [P] Create Next.js home page in phase-2/frontend/src/app/page.tsx
- [ ] T017 [P] Create API client utility in phase-2/frontend/src/lib/api.ts
- [ ] T018 [P] Create TypeScript type definitions in phase-2/frontend/src/types/user.ts
- [ ] T019 [P] Create TypeScript type definitions in phase-2/frontend/src/types/task.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts, sign in securely, and maintain authenticated sessions

**Independent Test**: Create account → Sign out → Sign back in → Access dashboard

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create User model in phase-2/backend/src/models/user.py
- [ ] T021 [P] [US1] Create models __init__.py in phase-2/backend/src/models/__init__.py
- [ ] T022 [US1] Create authentication service in phase-2/backend/src/services/auth.py
- [ ] T023 [US1] Create services __init__.py in phase-2/backend/src/services/__init__.py
- [ ] T024 [US1] Create JWT validation middleware in phase-2/backend/src/api/middleware.py
- [ ] T025 [US1] Create auth endpoints (signup, signin) in phase-2/backend/src/api/auth.py
- [ ] T026 [US1] Create api __init__.py in phase-2/backend/src/api/__init__.py
- [ ] T027 [US1] Register auth routes in phase-2/backend/src/main.py
- [ ] T028 [P] [US1] Configure Better Auth in phase-2/frontend/src/lib/auth.ts
- [ ] T029 [P] [US1] Create auth service client in phase-2/frontend/src/services/auth.ts
- [ ] T030 [P] [US1] Create signup page in phase-2/frontend/src/app/signup/page.tsx
- [ ] T031 [P] [US1] Create signin page in phase-2/frontend/src/app/signin/page.tsx
- [ ] T032 [US1] Create AuthGuard component in phase-2/frontend/src/components/AuthGuard.tsx
- [ ] T033 [US1] Add JWT token interceptor to API client in phase-2/frontend/src/lib/api.ts
- [ ] T034 [US1] Add authentication middleware to Next.js in phase-2/frontend/middleware.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Management (Priority: P2)

**Goal**: Enable authenticated users to create, view, update, and delete tasks with full CRUD operations

**Independent Test**: Sign in → Create tasks → Edit tasks → View list → Delete tasks

### Implementation for User Story 2

- [ ] T035 [P] [US2] Create Task model in phase-2/backend/src/models/task.py
- [ ] T036 [US2] Update models __init__.py to export Task in phase-2/backend/src/models/__init__.py
- [ ] T037 [US2] Create task service with CRUD operations in phase-2/backend/src/services/tasks.py
- [ ] T038 [US2] Update services __init__.py to export TaskService in phase-2/backend/src/services/__init__.py
- [ ] T039 [US2] Create GET /api/{user_id}/tasks endpoint in phase-2/backend/src/api/tasks.py
- [ ] T040 [US2] Create POST /api/{user_id}/tasks endpoint in phase-2/backend/src/api/tasks.py
- [ ] T041 [US2] Create GET /api/{user_id}/tasks/{id} endpoint in phase-2/backend/src/api/tasks.py
- [ ] T042 [US2] Create PUT /api/{user_id}/tasks/{id} endpoint in phase-2/backend/src/api/tasks.py
- [ ] T043 [US2] Create DELETE /api/{user_id}/tasks/{id} endpoint in phase-2/backend/src/api/tasks.py
- [ ] T044 [US2] Register task routes in phase-2/backend/src/main.py
- [ ] T045 [P] [US2] Create task API client in phase-2/frontend/src/services/tasks.ts
- [ ] T046 [P] [US2] Create TaskList component in phase-2/frontend/src/components/TaskList.tsx
- [ ] T047 [P] [US2] Create TaskItem component in phase-2/frontend/src/components/TaskItem.tsx
- [ ] T048 [P] [US2] Create TaskForm component in phase-2/frontend/src/components/TaskForm.tsx
- [ ] T049 [US2] Create dashboard page in phase-2/frontend/src/app/dashboard/page.tsx
- [ ] T050 [US2] Add user_id validation in JWT middleware in phase-2/backend/src/api/middleware.py
- [ ] T051 [US2] Add database query filtering by user_id in phase-2/backend/src/services/tasks.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Task Completion Tracking (Priority: P3)

**Goal**: Enable users to mark tasks as complete or incomplete and track progress visually

**Independent Test**: Create tasks → Toggle completion status → Verify visual feedback

### Implementation for User Story 3

- [ ] T052 [US3] Create PATCH /api/{user_id}/tasks/{id}/complete endpoint in phase-2/backend/src/api/tasks.py
- [ ] T053 [US3] Add completion toggle method to TaskService in phase-2/backend/src/services/tasks.py
- [ ] T054 [US3] Add completion toggle to task API client in phase-2/frontend/src/services/tasks.ts
- [ ] T055 [US3] Add completion toggle UI to TaskItem component in phase-2/frontend/src/components/TaskItem.tsx
- [ ] T056 [US3] Add visual styling for completed tasks in phase-2/frontend/src/components/TaskItem.tsx
- [ ] T057 [US3] Update TaskList to distinguish completed/incomplete tasks in phase-2/frontend/src/components/TaskList.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add input validation to all backend endpoints in phase-2/backend/src/api/
- [ ] T059 [P] Add error handling to all frontend API calls in phase-2/frontend/src/services/
- [ ] T060 [P] Add user-friendly error messages to frontend components in phase-2/frontend/src/components/
- [ ] T061 [P] Add CORS configuration to FastAPI in phase-2/backend/src/main.py
- [ ] T062 [P] Create backend README.md in phase-2/backend/README.md
- [ ] T063 [P] Create frontend README.md in phase-2/frontend/README.md
- [ ] T064 [P] Add password strength validation in phase-2/backend/src/services/auth.py
- [ ] T065 [P] Add email format validation in phase-2/backend/src/services/auth.py
- [ ] T066 [P] Add title/description length validation in phase-2/backend/src/services/tasks.py

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US2 for task management but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create User model in phase-2/backend/src/models/user.py"
Task: "Create models __init__.py in phase-2/backend/src/models/__init__.py"

# Launch all frontend pages for User Story 1 together:
Task: "Create signup page in phase-2/frontend/src/app/signup/page.tsx"
Task: "Create signin page in phase-2/frontend/src/app/signin/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
