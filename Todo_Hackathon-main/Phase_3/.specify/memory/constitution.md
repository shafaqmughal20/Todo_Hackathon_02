<!--
Sync Impact Report - Constitution Update
=========================================
Version Change: NEW → 1.0.0
Rationale: Initial constitution for Phase III (Todo AI Chatbot)

Modified Principles: N/A (new constitution)
Added Sections:
  - Project Identity
  - Core Principles (6 principles)
  - Technology Stack
  - Architecture & Structure
  - Security Requirements
  - Development Workflow
  - Success Criteria
  - Governance

Templates Requiring Updates:
  ✅ constitution.md - Created
  ⚠ plan-template.md - Review for Phase III alignment
  ⚠ spec-template.md - Review for Phase III requirements
  ⚠ tasks-template.md - Review for Phase III task types

Follow-up TODOs: None
-->

# Todo AI Chatbot (Phase III) Constitution

## Project Identity

**Name**: Todo AI Chatbot (Phase III)
**Type**: Conversational AI interface for todo management
**Phase**: 3 of 5 in hackathon project
**Build Method**: Spec-Driven Development with Claude Code
**Foundation**: Phase II (Full-Stack Web App with Next.js + FastAPI + Neon DB + Better Auth)

**Core Mission**: Add conversational AI capabilities to the existing todo application, enabling users to manage tasks through natural language chat powered by Groq LLM and MCP tools.

**Non-Negotiable Constraint**: All code MUST be generated via SpecifyPlus workflow. No manual coding permitted.

## Core Principles

### I. Stateless Design (MANDATORY)

The backend MUST hold NO conversation state in memory between requests.

**Requirements**:
- All conversation history stored in database (Neon PostgreSQL)
- Each chat request loads complete history from database
- Server can restart without losing any conversations
- Architecture must be horizontally scalable
- No in-memory session stores or conversation caches

**Rationale**: Stateless design ensures reliability, scalability, and prevents data loss during deployments or crashes. This is critical for production-grade conversational AI systems.

### II. MCP-First Tool Design (MANDATORY)

All todo operations MUST be exposed as MCP tools, not direct API calls.

**Requirements**:
- LLM decides which tool to call based on user intent
- Tools are atomic, single-responsibility functions
- Tools return structured JSON responses: `{ status, data, message }`
- No business logic in chat endpoint - delegate to MCP tools
- Tools must be independently testable

**Rationale**: MCP-first design separates intent understanding (LLM) from execution (tools), enabling better testing, reusability, and maintainability.

### III. Separation of Concerns (MANDATORY)

Each layer has a single, well-defined responsibility.

**Layer Responsibilities**:
- **Frontend (ChatKit)**: UI rendering and user interaction only
- **Backend Chat Endpoint**: Orchestration and message routing only
- **Groq Agent**: Natural language understanding and tool selection only
- **MCP Server**: Business logic and database operations only
- **Database**: Single source of truth for all data

**Rationale**: Clear separation prevents coupling, simplifies testing, and allows independent evolution of each layer.

### IV. Technology Stack Adherence (NON-NEGOTIABLE)

The following technology choices are fixed and MUST NOT be substituted.

**Frontend Stack**:
- Framework: Next.js 15+ (App Router)
- UI Component: OpenAI ChatKit
- Language: TypeScript
- Auth: Better Auth (existing from Phase II)

**Backend Stack**:
- Framework: FastAPI
- Language: Python 3.13+
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL (existing from Phase II)
- LLM: Groq API (llama-3.3-70b-versatile model)
- MCP: Official Python MCP SDK

**Infrastructure**:
- Development: Local (uvicorn + npm dev)
- Deployment: Vercel (frontend) + Backend hosting
- Configuration: .env files for secrets

**Rationale**: Stack consistency ensures skills created (mcp-server-development, groq-mcp-agent, chatkit-frontend) remain applicable and prevents integration issues.

### V. Security Requirements (MANDATORY)

All chat interactions MUST be authenticated and authorized.

**Requirements**:
- JWT validation on all chat requests
- user_id in URL must match JWT token claims
- MCP tools validate user_id ownership before operations
- No user can access other users' tasks or conversations
- All user inputs must be sanitized
- Rate limiting on chat endpoint (prevent abuse)

**Rationale**: Security is non-negotiable. Conversational AI systems can be exploited if not properly secured, leading to data breaches and unauthorized access.

### VI. Agent Behavior Standards (MANDATORY)

The Groq-powered agent MUST provide excellent user experience.

**Requirements**:
- Understand natural language intents accurately
- Map intents to appropriate MCP tools
- Handle ambiguous requests by asking clarification questions
- Confirm destructive actions (delete operations)
- Provide friendly, conversational responses
- Include task IDs in all confirmations
- Handle errors gracefully with user-friendly messages
- Never fabricate task IDs or data

**Rationale**: User experience determines adoption. The agent must be helpful, accurate, and trustworthy to be useful.

## Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **UI Component**: OpenAI ChatKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Better Auth (existing from Phase II)
- **State Management**: React hooks (useState, useEffect)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.13+
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **LLM**: Groq API (llama-3.3-70b-versatile)
- **MCP**: Official Python MCP SDK
- **Async**: asyncio, AsyncSession

### Infrastructure
- **Development**: Local (uvicorn + npm dev)
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Backend hosting (TBD)
- **Environment**: .env files for secrets
- **Version Control**: Git

## Architecture & Structure

### Folder Structure

```
phase-3/
├── frontend/
│   ├── app/
│   │   ├── chat/
│   │   │   └── page.tsx          # NEW: ChatKit UI
│   │   └── (existing Phase II pages)
│   └── lib/
│       └── api.ts                # UPDATE: Add chat API client
├── backend/
│   ├── main.py                   # UPDATE: Register chat routes
│   ├── models.py                 # UPDATE: Add Conversation, Message models
│   ├── mcp_server.py             # NEW: MCP server with 5 tools
│   ├── agent.py                  # NEW: Groq agent logic
│   └── routes/
│       ├── tasks.py              # KEEP: Existing CRUD routes
│       ├── chat.py               # NEW: Chat endpoint
│       └── auth.py               # KEEP: Existing auth routes
├── specs/
│   ├── constitution.md           # THIS FILE
│   ├── spec.md                   # Feature specification
│   ├── plan.md                   # Implementation plan
│   └── tasks.md                  # Task breakdown
├── .env                          # Environment variables
└── README.md                     # Project documentation
```

### Database Schema

**New Tables** (add to existing Phase II schema):

**conversations**
- `id`: SERIAL PRIMARY KEY
- `user_id`: VARCHAR (FK to users.id)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**messages**
- `id`: SERIAL PRIMARY KEY
- `conversation_id`: INTEGER (FK to conversations.id)
- `user_id`: VARCHAR (FK to users.id)
- `role`: VARCHAR ('user' | 'assistant' | 'tool')
- `content`: TEXT
- `tool_calls`: JSONB (nullable)
- `created_at`: TIMESTAMP

**tasks** (existing from Phase II)
- Keep existing schema unchanged

### API Contract

**New Endpoint**:
```
POST /api/{user_id}/chat
Headers: Authorization: Bearer <JWT>
Request: { conversation_id?: int, message: string }
Response: { conversation_id: int, response: string, tool_calls?: array }
```

**Existing Endpoints** (Phase II - keep unchanged):
- `GET /api/{user_id}/tasks` - List tasks
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

### MCP Tools Specification

**Required Tools** (all must be implemented):

1. **add_task**(user_id, title, description?)
   - Creates new task for user
   - Returns: `{ status: "success", data: { task_id, title }, message: "..." }`

2. **list_tasks**(user_id, status?)
   - Lists user's tasks, optionally filtered by completion status
   - Returns: `{ status: "success", data: { tasks: [...] }, message: "..." }`

3. **complete_task**(user_id, task_id)
   - Marks task as completed
   - Returns: `{ status: "success", data: { task_id, completed: true }, message: "..." }`

4. **delete_task**(user_id, task_id)
   - Permanently deletes task
   - Returns: `{ status: "success", data: { task_id }, message: "..." }`

5. **update_task**(user_id, task_id, title?, description?)
   - Updates task details
   - Returns: `{ status: "success", data: { task_id, title }, message: "..." }`

**Tool Requirements** (all tools MUST):
- Accept user_id as first parameter
- Validate user_id matches JWT token
- Return structured JSON with status, data, message
- Handle errors gracefully
- Be stateless (no shared state between calls)

## Security Requirements

### Authentication & Authorization
- JWT validation on all chat requests
- user_id in URL must match JWT token claims
- MCP tools validate user_id ownership before operations
- No cross-user data access permitted

### Input Validation
- Sanitize all user inputs before processing
- Validate conversation_id belongs to user
- Validate task_id belongs to user
- Prevent SQL injection, XSS, and other attacks

### Rate Limiting
- Implement rate limiting on chat endpoint
- Prevent abuse and excessive API usage
- Protect against DoS attacks

### Data Privacy
- Users can only access their own tasks and conversations
- No logging of sensitive user data
- Secure storage of JWT tokens

## Development Workflow

### Phase II Foundation
- Phase II code is the foundation (DO NOT break existing functionality)
- Add new files: mcp_server.py, agent.py, chat.py, chat/page.tsx
- Update existing files: models.py (add Conversation, Message)
- Keep all existing Phase II functionality intact

### SpecifyPlus Workflow (MANDATORY)
1. **Specify**: Create detailed spec.md
2. **Plan**: Create implementation plan.md
3. **Tasks**: Break down into tasks.md
4. **Implement**: Execute tasks via Claude Code
5. **Test**: Verify each component independently
6. **Integrate**: Test end-to-end flow

### Testing Requirements
- Test each MCP tool independently
- Test agent with various user inputs
- Test stateless behavior (restart server, conversation persists)
- Test authentication and authorization
- Test error handling
- Verify Phase II functionality still works

### No Manual Coding
- All code MUST be generated via Claude Code + SpecifyPlus
- No deviation from specified tech stack
- No skipping workflow steps
- No implementing features beyond Phase III scope

## Success Criteria

Phase III is complete when ALL of the following are verified:

**Functional Requirements**:
- [ ] User can chat with bot via ChatKit UI
- [ ] Bot understands: "Add task to buy groceries"
- [ ] Bot understands: "Show my pending tasks"
- [ ] Bot understands: "Mark task 3 as complete"
- [ ] Bot understands: "Delete task 5"
- [ ] Bot understands: "Change task 2 to 'Call mom tomorrow'"

**Technical Requirements**:
- [ ] Conversation history persists across page refreshes
- [ ] Server restart doesn't lose conversations
- [ ] Only authenticated users can access their own tasks
- [ ] All Phase II functionality still works
- [ ] MCP server exposes all 5 required tools
- [ ] Groq agent correctly maps intents to tools
- [ ] ChatKit UI displays messages correctly

**Quality Requirements**:
- [ ] No security vulnerabilities
- [ ] Error handling is graceful and user-friendly
- [ ] Code follows SpecifyPlus workflow
- [ ] All tests pass

## Constraints

### Scope Constraints
- Implement ONLY Basic Level features (Phase III scope)
- Do not add features from Phase IV or V
- Do not over-engineer or add unnecessary complexity

### Technical Constraints
- MCP server MUST use Official Python SDK
- Groq MUST be the LLM (not OpenAI GPT models)
- ChatKit MUST be used for UI (not custom chat components)
- Better Auth MUST be used (existing from Phase II)

### Process Constraints
- No manual code writing - use Claude Code + SpecifyPlus
- No deviation from specified tech stack
- No skipping SpecifyPlus workflow steps
- All changes must be documented

## Governance

### Constitution Authority
This constitution supersedes all other development practices and guidelines for Phase III. All specifications, plans, and tasks MUST comply with these principles.

### Amendment Process
1. Amendments require clear justification and documentation
2. Version must be incremented according to semantic versioning
3. Sync Impact Report must be generated
4. Dependent templates must be updated
5. All team members must be notified

### Compliance Review
- All PRs/commits must verify compliance with constitution
- Complexity must be justified against principles
- Deviations require explicit approval and documentation
- Regular audits to ensure adherence

### Version Control
- **MAJOR**: Backward incompatible governance/principle changes
- **MINOR**: New principle/section added or materially expanded
- **PATCH**: Clarifications, wording, typo fixes

### Runtime Guidance
For day-to-day development guidance, refer to:
- `.specify/memory/constitution.md` (this file)
- `.specify/templates/` (spec, plan, tasks templates)
- `.claude/skills/` (mcp-server-development, groq-mcp-agent, chatkit-frontend)

**Version**: 1.0.0 | **Ratified**: 2026-02-09 | **Last Amended**: 2026-02-09
