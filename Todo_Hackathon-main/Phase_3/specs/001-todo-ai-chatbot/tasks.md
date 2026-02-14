# Implementation Tasks: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Branch**: 001-todo-ai-chatbot
**Status**: ✅ COMPLETED
**Created**: 2026-02-09
**Completed**: 2026-02-10

---

## Overview

This document contains 7 implementation tasks for Phase III: Todo AI Chatbot. Complete tasks in the specified order to build a conversational AI interface for task management.

**Total Tasks**: 7
**Completed Tasks**: 7/7 ✅
**Estimated Effort**: 2-3 days
**Dependencies**: Phase II must be fully functional

---

## Task List

### Task T-301: Add Database Models ✅

**Task ID:** T-301
**Status:** ✅ COMPLETED

**Name:** Add Database Models

**What to Build:** Update backend/models.py to add Conversation and Message models

**Details:**
- Create `Conversation` model with fields:
  - `id` (primary key)
  - `user_id` (foreign key to users)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- Create `Message` model with fields:
  - `id` (primary key)
  - `conversation_id` (foreign key to conversations)
  - `user_id` (foreign key to users)
  - `role` (string: 'user' | 'assistant' | 'tool')
  - `content` (text)
  - `tool_calls` (JSON, nullable)
  - `created_at` (timestamp)
- Add relationships between models
- Create Alembic migration script
- Run migration to create tables in database

**Success Criteria:**
- Tables exist in database
- Models can be imported
- Migration runs without errors
- Can create and query Conversation and Message records

**Files to Create/Modify:**
- `backend/src/models/conversation.py` (NEW)
- `backend/src/models/message.py` (NEW)
- `backend/alembic/versions/add_conversations_messages.py` (NEW)

---

### Task T-302: Build MCP Server ✅

**Task ID:** T-302
**Status:** ✅ COMPLETED

**Name:** Build MCP Server

**What to Build:** Create backend/mcp_server.py with these 5 tools:
- `add_task` (creates new task)
- `list_tasks` (shows user's tasks)
- `complete_task` (marks task done)
- `delete_task` (removes task)
- `update_task` (changes task details)

**Details:**
- Install FastMCP SDK: `pip install fastmcp`
- Create MCP server instance
- Implement 5 tools with proper type hints:
  - `add_task(user_id: str, title: str, description: str = None) -> dict`
  - `list_tasks(user_id: str, completed: bool = None) -> dict`
  - `complete_task(user_id: str, task_id: int) -> dict`
  - `delete_task(user_id: str, task_id: int) -> dict`
  - `update_task(user_id: str, task_id: int, title: str = None, description: str = None) -> dict`
- Each tool should:
  - Validate user_id ownership
  - Use async database operations
  - Return structured JSON: `{status, data, message}`
  - Handle errors gracefully

**Success Criteria:**
- Each tool works and talks to database
- Tools validate user ownership
- Tools return consistent JSON format
- Error handling works (e.g., task not found)
- Can be imported and used by Groq agent

**Files to Create/Modify:**
- `backend/src/services/mcp_server.py` (NEW)
- `backend/requirements.txt` (UPDATE - add fastmcp)

---

### Task T-303: Create Groq Agent ✅

**Task ID:** T-303
**Status:** ✅ COMPLETED

**Name:** Create Groq Agent

**What to Build:** Create backend/agent.py that:
- Connects to Groq API
- Takes user message
- Decides which MCP tool to use
- Returns friendly response

**Details:**
- Install Groq SDK: `pip install groq`
- Create `TodoAgent` class with:
  - Initialize Groq client with API key
  - Load MCP tools and convert to OpenAI function format
  - `chat(messages: list, user_id: str) -> dict` method
- Implement chat flow:
  - Add system prompt with user context
  - Send messages to Groq API with tools
  - Handle function calling responses
  - Execute MCP tools
  - Generate natural language response
- Handle errors (API failures, invalid tool calls)
- Implement retry logic (3 retries, exponential backoff)

**Success Criteria:**
- Bot understands "Add task to buy milk" and calls add_task tool
- Bot can handle all 5 task operations
- Bot generates natural, conversational responses
- Error handling works (Groq API failures, invalid inputs)
- Conversation history is passed correctly

**Files to Create/Modify:**
- `backend/src/services/agent.py` (NEW)
- `backend/requirements.txt` (UPDATE - add groq)
- `backend/.env.example` (UPDATE - add GROQ_API_KEY)

---

### Task T-304: Build Chat Endpoint ✅

**Task ID:** T-304
**Status:** ✅ COMPLETED

**Name:** Build Chat Endpoint

**What to Build:** Create backend/routes/chat.py with POST /api/chat that:
- Checks JWT token
- Loads old messages from database
- Calls Groq agent
- Saves new messages to database

**Details:**
- Create FastAPI router for chat endpoints
- Implement POST /api/chat endpoint:
  - Request body: `{conversation_id: int | null, message: str}`
  - Response: `{conversation_id: int, response: str, timestamp: str}`
- Endpoint logic:
  - Validate JWT token (use existing Better Auth)
  - Load or create conversation
  - Retrieve last 10 messages from database
  - Format messages for Groq agent
  - Call agent.chat()
  - Store user message in database
  - Store assistant response in database
  - Update conversation.updated_at
  - Return response
- Handle errors (database failures, Groq API errors)
- Register router in main.py

**Success Criteria:**
- API accepts message, returns bot response, saves to DB
- JWT authentication works
- Conversation history is loaded correctly
- Messages persist across requests
- Error handling returns user-friendly messages
- Can test with cURL or Postman

**Files to Create/Modify:**
- `backend/src/api/chat.py` (NEW)
- `backend/src/main.py` (UPDATE - register chat router)
- `backend/src/config.py` (UPDATE - add GROQ_API_KEY config)

---

### Task T-305: Create Chat UI ✅

**Task ID:** T-305
**Status:** ✅ COMPLETED

**Name:** Create Chat UI

**What to Build:** Create frontend/app/chat/page.tsx with:
- Text input box
- Send button
- Message display area
- Calls backend chat endpoint

**Details:**
- Install ChatKit: `npm install @openai/chatkit`
- Create chat page component:
  - Use AuthGuard to require authentication
  - State management: messages, input, conversationId, loading
  - Message display with role-based styling (user vs assistant)
  - Input field with send button
  - Loading indicator during API calls
- Implement sendMessage function:
  - Add user message to UI (optimistic update)
  - Call POST /api/chat with JWT token
  - Update conversationId from response
  - Add assistant response to UI
  - Handle errors (show error message in chat)
- Load conversation history on mount
- Auto-scroll to latest message
- Match Phase II dark futuristic theme (purple/magenta)
- Add navigation link in layout.tsx

**Success Criteria:**
- User can type message, bot responds, messages stay after page refresh
- Authentication works (redirects to signin if not logged in)
- Loading states display correctly
- Errors are shown inline
- UI matches Phase II theme
- Conversation persists across page refreshes

**Files to Create/Modify:**
- `frontend/src/app/chat/page.tsx` (NEW)
- `frontend/src/components/ChatInterface.tsx` (NEW)
- `frontend/src/services/chat.ts` (NEW)
- `frontend/src/app/layout.tsx` (UPDATE - add chat nav link)
- `frontend/package.json` (UPDATE - add @openai/chatkit)

---

### Task T-306: Test Everything ✅

**Task ID:** T-306
**Status:** ✅ COMPLETED

**Name:** Test Everything

**What to Build:** Test that:
1. User can chat with bot
2. Bot can add/list/complete/delete/update tasks
3. Conversation saves to database
4. Server restart doesn't lose chat history

**Details:**
- Manual testing scenarios:
  - Sign in to application
  - Navigate to /chat
  - Test add task: "Add a task to buy groceries"
  - Test list tasks: "Show me my tasks"
  - Test complete task: "Mark task 123 as complete"
  - Test update task: "Change task 123 to 'buy groceries and cook dinner'"
  - Test delete task: "Delete task 123"
  - Refresh page - verify conversation persists
  - Restart backend server - verify conversation persists
  - Test Phase II dashboard still works
- Verify error handling:
  - Invalid task IDs
  - Empty messages
  - Database connection failures
  - Groq API failures
- Verify security:
  - Unauthenticated requests return 401
  - Users can only access their own tasks/conversations
- Performance testing:
  - Chat response time < 3 seconds

**Success Criteria:**
- All features work end-to-end
- Conversation persists across page refreshes
- Conversation persists across server restarts
- Phase II functionality still works
- Error handling works correctly
- Security checks pass
- Performance meets targets

**Files to Create/Modify:**
- `backend/tests/unit/test_mcp_tools.py` (NEW - optional)
- `backend/tests/integration/test_chat_api.py` (NEW - optional)
- Manual testing checklist (document results)

---

### Task T-307: Documentation ✅

**Task ID:** T-307
**Status:** ✅ COMPLETED

**Name:** Documentation

**What to Build:** Update README.md with:
- How to setup Phase III
- Environment variables needed
- How to run the app

**Details:**
- Update backend/README.md:
  - Add Phase III setup instructions
  - Document new environment variables (GROQ_API_KEY)
  - Document new dependencies (fastmcp, groq)
  - Document database migration steps
  - Document MCP server architecture
  - Document Groq agent integration
- Update frontend/README.md:
  - Add Phase III setup instructions
  - Document new dependencies (@openai/chatkit)
  - Document chat interface usage
  - Document navigation to /chat
- Create Phase_3/README.md:
  - Overview of Phase III features
  - Architecture diagram
  - Setup instructions (backend + frontend)
  - Environment variables
  - Running locally
  - Testing instructions
  - Troubleshooting guide
  - Deployment instructions

**Success Criteria:**
- Someone can follow README and run the app
- All environment variables documented
- Setup steps are clear and complete
- Troubleshooting section covers common issues
- Architecture is explained clearly

**Files to Create/Modify:**
- `Phase_3/README.md` (NEW)
- `backend/README.md` (UPDATE)
- `frontend/README.md` (UPDATE)

---

## Execution Order

**IMPORTANT:** Complete tasks in this exact order. Do not skip ahead.

1. **T-301** ✅ (Database Models) - Foundation for all data storage
2. **T-302** ✅ (MCP Server) - Business logic for task operations
3. **T-303** ✅ (Groq Agent) - AI integration for natural language understanding
4. **T-304** ✅ (Chat Endpoint) - API orchestration layer
5. **T-305** ✅ (Chat UI) - User interface for chat
6. **T-306** ✅ (Testing) - Verify everything works
7. **T-307** ✅ (Documentation) - Enable others to use the system

**Dependencies:**
- T-302 depends on T-301 (needs database models)
- T-303 depends on T-302 (needs MCP tools)
- T-304 depends on T-303 (needs Groq agent)
- T-305 depends on T-304 (needs chat API)
- T-306 depends on T-305 (needs complete system)
- T-307 can be done anytime after T-305

---

## Environment Setup

Before starting implementation, ensure you have:

### Backend
```bash
# Install new dependencies
pip install fastmcp groq

# Set environment variable
export GROQ_API_KEY=gsk_your_api_key_here
```

### Frontend
```bash
# Install new dependencies
npm install @openai/chatkit
```

### Database
```bash
# Run migration after T-301
alembic upgrade head
```

---

## Success Metrics

Phase III is complete when:
- ✅ All 7 tasks are completed
- ✅ User can manage tasks via natural language chat
- ✅ Conversation history persists across sessions
- ✅ Phase II functionality still works
- ✅ All tests pass
- ✅ Documentation is complete

---

## Notes

- **Phase II Compatibility**: Do not modify existing Phase II files unless marked as UPDATE
- **Stateless Architecture**: All conversation state must be in database, not memory
- **Security**: All endpoints must validate JWT tokens and enforce user ownership
- **Error Handling**: All errors must return user-friendly messages
- **Performance**: Chat responses must be < 3 seconds

---

**Status**: ✅ COMPLETED
**Next Step**: Deploy and test in production environment
