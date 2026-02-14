# Implementation Plan: Todo AI Chatbot

**Branch**: `001-todo-ai-chatbot` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-ai-chatbot/spec.md`

## Summary

Transform the Phase II todo application into a conversational AI experience by adding a chat interface powered by Groq LLM (llama-3.3-70b-versatile) and MCP tools. Users will manage tasks through natural language commands while maintaining full backward compatibility with Phase II functionality. The architecture follows stateless design principles with database-backed conversation persistence.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript (frontend)
**Primary Dependencies**: FastAPI, FastMCP SDK, Groq SDK, SQLModel, Next.js 15+, OpenAI ChatKit, Better Auth
**Storage**: Neon PostgreSQL (add conversations and messages tables)
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application (Vercel frontend, backend hosting TBD)
**Project Type**: Web (frontend + backend)
**Performance Goals**: <3s chat response time (including Groq API call)
**Constraints**: Stateless architecture, no in-memory conversation state, Phase II compatibility required
**Scale/Scope**: 5 MCP tools, 2 new database tables, 1 new chat endpoint, 1 new frontend page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Stateless Design ✅
- All conversation history stored in database
- Each request loads history from database
- No in-memory session stores
- Server can restart without data loss

### Principle II: MCP-First Tool Design ✅
- 5 MCP tools for task operations (add, list, update, complete, delete)
- LLM decides which tool to call
- Tools return structured JSON responses
- No business logic in chat endpoint

### Principle III: Separation of Concerns ✅
- Frontend: ChatKit UI only
- Chat Endpoint: Orchestration only
- Groq Agent: Intent understanding only
- MCP Server: Business logic only
- Database: Single source of truth

### Principle IV: Technology Stack Adherence ✅
- Frontend: Next.js 15+, ChatKit, TypeScript, Better Auth
- Backend: FastAPI, FastMCP, Groq SDK, SQLModel, Python 3.13+
- Database: Neon PostgreSQL
- All required technologies specified

### Principle V: Security Requirements ✅
- JWT validation on all chat requests
- User-scoped data access enforced
- MCP tools validate ownership
- Input sanitization required

### Principle VI: Agent Behavior Standards ✅
- Natural language understanding via Groq
- Clarification questions for ambiguity
- Friendly, conversational responses
- Error handling with user-friendly messages

**Gate Status**: ✅ PASSED - All principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-ai-chatbot/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (TO BE CREATED)
├── data-model.md        # Phase 1 output (TO BE CREATED)
├── quickstart.md        # Phase 1 output (TO BE CREATED)
├── contracts/           # Phase 1 output (TO BE CREATED)
│   └── openapi.yaml     # Chat API contract
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (Phase_3/phase-3/)

```text
phase-3/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # EXISTING (Phase II)
│   │   │   ├── task.py          # EXISTING (Phase II)
│   │   │   ├── conversation.py  # NEW
│   │   │   └── message.py       # NEW
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # EXISTING (Phase II)
│   │   │   ├── tasks.py         # EXISTING (Phase II)
│   │   │   ├── mcp_server.py    # NEW - MCP tools
│   │   │   └── agent.py         # NEW - Groq integration
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # EXISTING (Phase II)
│   │   │   ├── tasks.py         # EXISTING (Phase II)
│   │   │   ├── chat.py          # NEW - Chat endpoint
│   │   │   └── middleware.py    # EXISTING (Phase II)
│   │   ├── database.py          # UPDATE - Add new models
│   │   ├── config.py            # UPDATE - Add Groq API key
│   │   └── main.py              # UPDATE - Register chat routes
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_mcp_tools.py    # NEW
│   │   │   └── test_agent.py        # NEW
│   │   ├── integration/
│   │   │   └── test_chat_api.py     # NEW
│   │   └── contract/
│   │       └── test_chat_contract.py # NEW
│   ├── alembic/
│   │   └── versions/
│   │       └── add_conversations_messages.py  # NEW - Migration
│   ├── requirements.txt         # UPDATE - Add fastmcp, groq
│   ├── .env.example             # UPDATE - Add GROQ_API_KEY
│   └── README.md                # UPDATE - Add Phase III docs
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── chat/
    │   │   │   └── page.tsx         # NEW - Chat interface
    │   │   ├── dashboard/
    │   │   │   └── page.tsx         # EXISTING (Phase II)
    │   │   ├── signin/
    │   │   │   └── page.tsx         # EXISTING (Phase II)
    │   │   ├── signup/
    │   │   │   └── page.tsx         # EXISTING (Phase II)
    │   │   ├── layout.tsx           # UPDATE - Add chat nav link
    │   │   └── page.tsx             # EXISTING (Phase II)
    │   ├── components/
    │   │   ├── ChatInterface.tsx    # NEW - ChatKit wrapper
    │   │   ├── AuthGuard.tsx        # EXISTING (Phase II)
    │   │   ├── TaskForm.tsx         # EXISTING (Phase II)
    │   │   ├── TaskItem.tsx         # EXISTING (Phase II)
    │   │   └── TaskList.tsx         # EXISTING (Phase II)
    │   ├── services/
    │   │   ├── auth.ts              # EXISTING (Phase II)
    │   │   ├── tasks.ts             # EXISTING (Phase II)
    │   │   └── chat.ts              # NEW - Chat API client
    │   └── lib/
    │       └── api.ts               # EXISTING (Phase II)
    ├── package.json                 # UPDATE - Add @openai/chatkit
    ├── .env.local.example           # EXISTING (Phase II)
    └── README.md                    # UPDATE - Add Phase III docs
```

**Structure Decision**: Web application structure (Option 2) selected. Phase II codebase provides foundation with backend/ and frontend/ directories. Phase III adds new files for chat functionality while preserving all existing Phase II files unchanged.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ChatKit UI Component                                 │  │
│  │  - Message display                                    │  │
│  │  - Input handling                                     │  │
│  │  - Loading states                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓ HTTP POST                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Chat Endpoint (/api/chat)                           │  │
│  │  - JWT validation                                     │  │
│  │  - Load conversation history                         │  │
│  │  - Call Groq agent                                    │  │
│  │  - Store messages                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Groq Agent (agent.py)                               │  │
│  │  - Parse user intent                                  │  │
│  │  - Select MCP tool                                    │  │
│  │  - Execute tool call                                  │  │
│  │  - Generate response                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MCP Server (mcp_server.py)                          │  │
│  │  - add_task()                                         │  │
│  │  - list_tasks()                                       │  │
│  │  - update_task()                                      │  │
│  │  - complete_task()                                    │  │
│  │  - delete_task()                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (Neon PostgreSQL)                  │
│  - users (Phase II)                                          │
│  - tasks (Phase II)                                          │
│  - conversations (Phase III)                                 │
│  - messages (Phase III)                                      │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User sends message**: "Add task to buy groceries"
2. **Frontend**: ChatKit captures input, sends POST to `/api/chat`
3. **Chat Endpoint**:
   - Validates JWT token
   - Loads conversation history from database
   - Calls Groq agent with message + history
4. **Groq Agent**:
   - Sends message to Groq API with function definitions
   - Groq returns tool call: `add_task(title="buy groceries")`
   - Executes MCP tool
   - Generates natural language response
5. **MCP Tool**:
   - Validates user ownership
   - Creates task in database
   - Returns structured response
6. **Chat Endpoint**:
   - Stores user message in database
   - Stores assistant response in database
   - Returns response to frontend
7. **Frontend**: ChatKit displays assistant response

### Data Flow Diagram

```
User Input → ChatKit → Chat API → Groq Agent → MCP Tools → Database
                ↑                      ↓
                └──────────────────────┘
              (Response with tool results)
```

## Component Breakdown

### 1. Database Layer (NEW MODELS)

**File**: `backend/src/models/conversation.py`

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List, Optional

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
```

**File**: `backend/src/models/message.py`

```python
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from datetime import datetime
from typing import Optional, Dict

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    role: str  # 'user' | 'assistant' | 'tool'
    content: str
    tool_calls: Optional[Dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

### 2. MCP Server (NEW)

**File**: `backend/src/services/mcp_server.py`

**Key Functions**:
- `add_task(user_id: str, title: str, description: str = None) -> dict`
- `list_tasks(user_id: str, completed: bool = None) -> dict`
- `update_task(user_id: str, task_id: int, title: str = None, description: str = None) -> dict`
- `complete_task(user_id: str, task_id: int) -> dict`
- `delete_task(user_id: str, task_id: int) -> dict`

**Response Format**:
```python
{
    "status": "success" | "error",
    "data": {...},  # Tool-specific data
    "message": "Human-readable message"
}
```

**Implementation Pattern**:
- Use FastMCP SDK for tool registration
- Each tool validates user_id ownership
- All database operations use async SQLModel sessions
- Return structured JSON responses
- Handle errors gracefully

### 3. Groq Agent (NEW)

**File**: `backend/src/services/agent.py`

**Key Responsibilities**:
- Initialize Groq client with API key
- Convert MCP tools to OpenAI function format
- Send user message + history to Groq API
- Handle function calling responses
- Execute MCP tools
- Generate natural language responses

**Implementation Pattern**:
```python
class TodoAgent:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"
        self.mcp_tools = self._load_mcp_tools()

    async def chat(self, messages: list, user_id: str) -> dict:
        # Add system prompt
        # Call Groq with tools
        # Handle tool calls
        # Return response
```

### 4. Chat API Endpoint (NEW)

**File**: `backend/src/api/chat.py`

**Endpoint**: `POST /api/chat`

**Request**:
```json
{
    "conversation_id": 123,  // optional, null for new conversation
    "message": "Add task to buy groceries"
}
```

**Response**:
```json
{
    "conversation_id": 123,
    "response": "I've added 'buy groceries' to your tasks (ID: 456)",
    "timestamp": "2026-02-09T12:00:00Z"
}
```

**Implementation**:
- Validate JWT token
- Load or create conversation
- Retrieve conversation history (last 10 messages)
- Call Groq agent
- Store user and assistant messages
- Return response

### 5. ChatKit Frontend (NEW)

**File**: `frontend/src/app/chat/page.tsx`

**Key Features**:
- Display conversation history
- Input field for user messages
- Send button with loading state
- Message rendering (user vs assistant)
- Error handling and display
- Authentication guard

**Implementation Pattern**:
```typescript
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    // Add user message to UI
    // Call chat API
    // Update conversation ID
    // Add assistant response to UI
  };

  return (
    <ChatInterface
      messages={messages}
      onSend={sendMessage}
      loading={loading}
    />
  );
}
```

## Environment Variables

**Backend** (`.env`):
```bash
# Existing from Phase II
DATABASE_URL=postgresql://...
JWT_SECRET=...
BETTER_AUTH_SECRET=...

# New for Phase III
GROQ_API_KEY=gsk_...
MCP_SERVER_PORT=8001  # Optional, default 8001
```

**Frontend** (`.env.local`):
```bash
# Existing from Phase II
NEXT_PUBLIC_API_URL=http://localhost:8000

# New for Phase III (optional)
NEXT_PUBLIC_OPENAI_API_KEY=sk-...  # For ChatKit UI features
```

## Deployment Architecture

### Development (Local)
```
Frontend: npm run dev (localhost:3000)
Backend: uvicorn main:app --reload (localhost:8000)
Database: Neon PostgreSQL (cloud)
```

### Production
```
Frontend: Vercel (automatic deployment from git)
Backend: Render/Railway (Docker container)
Database: Neon PostgreSQL (cloud)
```

## Testing Strategy

### Unit Tests
- **MCP Tools**: Test each tool independently with mock database
- **Agent**: Test intent parsing and tool selection with mock Groq API
- **Models**: Test database models and relationships

### Integration Tests
- **Chat API**: Test full flow with real database, mock Groq API
- **Authentication**: Test JWT validation and user scoping
- **Database**: Test conversation and message persistence

### Manual Testing
- Test natural language variations ("add task", "create task", "new task")
- Test edge cases (invalid task IDs, empty inputs, long messages)
- Test multi-turn conversations with context
- Test conversation persistence across page refreshes
- Verify Phase II functionality still works

## Performance Considerations

- **Database Connection Pooling**: Use SQLModel async sessions with connection pooling
- **Async Operations**: All I/O operations (database, Groq API) are async
- **Conversation History Limit**: Load only last 10 messages (or 4000 tokens)
- **Database Indexes**: Add indexes on user_id, conversation_id, created_at
- **Response Caching**: Consider caching MCP tool schemas (static data)

## Security Measures

- **JWT Validation**: All chat requests require valid JWT token
- **User Ownership**: MCP tools validate user_id matches task/conversation owner
- **SQL Injection Prevention**: SQLModel ORM prevents SQL injection
- **Input Sanitization**: Validate and sanitize all user inputs
- **Rate Limiting**: Implement rate limiting on chat endpoint (60 req/min per user)
- **CORS**: Configure CORS for frontend-backend communication

## Error Handling

- **Database Errors**: Return 500 with user-friendly message
- **Groq API Errors**: Return 503 with retry suggestion
- **Invalid Task IDs**: Agent responds "Task not found"
- **Unauthorized Access**: Return 401 Unauthorized
- **Invalid Input**: Agent asks for clarification
- **Tool Execution Errors**: Agent explains error in natural language

## Complexity Tracking

> No violations - all principles satisfied without exceptions.

## Phase 0: Research Tasks

### Research Topics

1. **FastMCP SDK Best Practices**
   - Tool definition patterns
   - Async database integration
   - Error handling strategies
   - Testing approaches

2. **Groq Function Calling**
   - OpenAI-compatible function format
   - Tool execution patterns
   - Context window management
   - Error handling

3. **OpenAI ChatKit Integration**
   - Installation and setup
   - Component customization
   - Backend integration patterns
   - Authentication integration

4. **Conversation History Management**
   - Optimal message count for context
   - Token counting strategies
   - Pagination approaches
   - Performance optimization

5. **Stateless Architecture Patterns**
   - Database-backed state management
   - Request-scoped dependencies
   - Horizontal scaling considerations
   - Testing stateless behavior

**Output**: `research.md` with findings and recommendations

## Phase 1: Design & Contracts

### Data Model Design

**Output**: `data-model.md` with:
- Entity-relationship diagram
- Table schemas with constraints
- Indexes and foreign keys
- Migration strategy

### API Contracts

**Output**: `contracts/openapi.yaml` with:
- Chat endpoint specification
- Request/response schemas
- Error response formats
- Authentication requirements

### Quickstart Guide

**Output**: `quickstart.md` with:
- Setup instructions
- Environment configuration
- Running locally
- Testing the chat interface

### Agent Context Update

Run: `.specify/scripts/bash/update-agent-context.sh claude`
- Add Phase III technologies to agent context
- Preserve existing Phase II context
- Update skill references

## Next Steps

After `/sp.plan` completes:
1. Review and validate plan.md
2. Execute Phase 0 research
3. Execute Phase 1 design
4. Run `/sp.tasks` to generate tasks.md
5. Begin implementation via `/sp.implement`

---

**Plan Status**: ✅ COMPLETE
**Constitution Compliance**: ✅ VERIFIED
**Ready for**: Phase 0 Research
