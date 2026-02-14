---
id: 0001
title: Phase III Todo AI Chatbot Constitution
stage: constitution
date: 2026-02-09
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: shafaqmughal
command: /sp.constitution
labels: ["constitution", "phase-iii", "governance", "principles"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - None (constitution document)
---

## Prompt

/sp.constitution

Create the constitution for Phase III: Todo AI Chatbot

Project Context:
This is Phase III of a 5-phase hackathon project. Phase II (Full-Stack Web App with Next.js + FastAPI + Neon DB + Better Auth) is already complete. Phase III adds conversational AI capabilities using Groq LLM, MCP tools, and OpenAI ChatKit.

Constitution Requirements:

## 1. Project Identity
- Name: Todo AI Chatbot (Phase III)
- Type: Conversational AI interface for todo management
- Phase: 3 of 5
- Build Method: Spec-Driven Development with Claude Code
- No Manual Coding: All code generated via SpecifyPlus workflow

## 2. Architecture Principles

### Stateless Design
- Backend holds NO conversation state in memory
- All conversation history stored in database
- Each chat request loads history from DB
- Server can restart without losing conversations
- Horizontally scalable architecture

### MCP-First Tool Design
- All todo operations exposed as MCP tools
- LLM decides which tool to call based on user intent
- Tools are atomic, single-responsibility functions
- Tools return structured JSON responses
- No business logic in chat endpoint - delegate to tools

### Separation of Concerns
- Frontend: UI only (ChatKit)
- Backend Chat Endpoint: Orchestration only
- Groq Agent: Intent understanding + tool selection
- MCP Server: Business logic + database operations
- Database: Single source of truth

## 3. Technology Stack (Non-Negotiable)

### Frontend
- Framework: Next.js 15+ (App Router)
- UI Component: OpenAI ChatKit
- Language: TypeScript
- Auth: Better Auth (existing from Phase II)

### Backend
- Framework: FastAPI
- Language: Python 3.13+
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL (existing from Phase II)
- LLM: Groq API (llama-3.3-70b-versatile)
- MCP: Official Python MCP SDK

### Infrastructure
- Development: Local (uvicorn + npm dev)
- Deployment: Vercel (frontend) + Backend hosting
- Environment: .env files for secrets

## 4-12. [Additional sections covering folder structure, database schema, API contract, MCP tools, agent behavior, security, workflow, success criteria, and constraints]

## Response snapshot

Created comprehensive Phase III constitution (v1.0.0) with 6 core principles:

1. **Stateless Design (MANDATORY)** - No in-memory conversation state, all history in database
2. **MCP-First Tool Design (MANDATORY)** - All operations as MCP tools, LLM decides which to call
3. **Separation of Concerns (MANDATORY)** - Clear layer responsibilities (Frontend/Backend/Agent/MCP/DB)
4. **Technology Stack Adherence (NON-NEGOTIABLE)** - Fixed tech choices (Next.js, FastAPI, Groq, MCP SDK)
5. **Security Requirements (MANDATORY)** - JWT validation, user_id authorization, rate limiting
6. **Agent Behavior Standards (MANDATORY)** - Natural language understanding, friendly responses, error handling

Constitution includes:
- Complete technology stack specification
- Folder structure with NEW/UPDATE/KEEP annotations
- Database schema (2 new tables: conversations, messages)
- API contract (new /api/{user_id}/chat endpoint)
- MCP tools specification (5 required tools: add_task, list_tasks, complete_task, delete_task, update_task)
- Security requirements (authentication, authorization, input validation, rate limiting)
- Development workflow (SpecifyPlus mandatory, no manual coding)
- Success criteria (11 functional/technical/quality checkpoints)
- Governance rules (amendment process, compliance review, version control)

File created at: `.specify/memory/constitution.md`
Version: 1.0.0 | Ratified: 2026-02-09 | Last Amended: 2026-02-09

Sync Impact Report included as HTML comment at top of file.

## Outcome

- ✅ Impact: Constitution established for Phase III governance, all principles defined and rationale provided
- 🧪 Tests: N/A (governance document)
- 📁 Files: 1 file created (.specify/memory/constitution.md)
- 🔁 Next prompts: Create spec.md for Phase III feature specification
- 🧠 Reflection: Constitution provides clear governance for conversational AI development with emphasis on stateless design, MCP-first architecture, and security. All 6 principles are mandatory and testable.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (constitution creation)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to /sp.specify to create feature specification following constitution principles
