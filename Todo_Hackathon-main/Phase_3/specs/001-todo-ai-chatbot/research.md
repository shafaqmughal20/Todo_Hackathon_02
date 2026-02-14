# Research: Todo AI Chatbot Implementation

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-02-09
**Purpose**: Document research findings, best practices, and implementation patterns for Phase III technologies

---

## 1. FastMCP SDK Best Practices

### Decision: Use FastMCP for MCP Server Implementation

**Rationale**:
- Official Python SDK for Model Context Protocol
- Automatic schema generation from Python type hints
- Built-in async support for database operations
- Simple decorator-based tool registration
- JSON-serializable responses by default

**Implementation Pattern**:
```python
from fastmcp import FastMCP

mcp = FastMCP("todo-mcp-server")

@mcp.tool()
async def add_task(user_id: str, title: str, description: str = None) -> dict:
    """Add a new task for the user."""
    async with get_db_session() as session:
        task = Task(user_id=user_id, title=title, description=description)
        session.add(task)
        await session.commit()
        await session.refresh(task)

        return {
            "status": "success",
            "data": {"task_id": task.id, "title": task.title},
            "message": f"Task added: {task.title} (ID: {task.id})"
        }
```

**Key Practices**:
- Use type hints for automatic schema generation
- Return structured dict with status, data, message
- Use async/await for all database operations
- Validate user_id ownership in every tool
- Handle errors gracefully with try/except
- Keep tools stateless (no shared state)

**Testing Approach**:
- Mock database sessions for unit tests
- Test each tool independently
- Verify schema generation
- Test error handling paths

**Alternatives Considered**:
- Manual MCP protocol implementation → Rejected (too complex, error-prone)
- LangChain tools → Rejected (not MCP-compatible)

---

## 2. Groq Function Calling Integration

### Decision: Use Groq SDK with OpenAI-Compatible Function Format

**Rationale**:
- Groq API supports OpenAI-compatible function calling
- llama-3.3-70b-versatile model has strong function calling capabilities
- Seamless integration with MCP tool schemas
- Well-documented API with Python SDK

**Implementation Pattern**:
```python
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Convert MCP tools to OpenAI function format
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Add a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["user_id", "title"]
            }
        }
    }
]

# Call Groq with function calling
response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

# Handle tool calls
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        result = await execute_mcp_tool(function_name, arguments)
```

**Key Practices**:
- Always include system prompt with user context
- Limit conversation history to last 10 messages (context window management)
- Handle tool_calls array (can be multiple tools in one response)
- Execute tools sequentially, not in parallel
- Add tool results back to conversation before final response
- Implement retry logic for API failures (3 retries, exponential backoff)

**Context Window Management**:
- llama-3.3-70b-versatile: 128k token context window
- Practical limit: 10 messages or 4000 tokens for conversation history
- Token counting: Use tiktoken library for accurate counts
- Truncation strategy: Keep most recent messages, drop oldest

**Error Handling**:
- API rate limits → Retry with exponential backoff
- Invalid function calls → Ask user for clarification
- Tool execution errors → Explain error in natural language
- Network errors → Return user-friendly error message

**Alternatives Considered**:
- OpenAI GPT-4 → Rejected (constitution requires Groq)
- Anthropic Claude → Rejected (constitution requires Groq)
- Local LLM → Rejected (performance and quality concerns)

---

## 3. OpenAI ChatKit Integration

### Decision: Use ChatKit for Chat UI Component

**Rationale**:
- Official OpenAI chat component library
- Pre-built UI components for chat interfaces
- Handles message rendering, input, loading states
- Customizable styling with Tailwind CSS
- TypeScript support

**Installation**:
```bash
npm install @openai/chatkit
```

**Implementation Pattern**:
```typescript
import { ChatInterface } from '@openai/chatkit';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (message: string) => {
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    // Call backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, conversation_id: conversationId })
    });

    const data = await response.json();

    // Add assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    setConversationId(data.conversation_id);
    setLoading(false);
  };

  return (
    <ChatInterface
      messages={messages}
      onSend={handleSend}
      loading={loading}
      placeholder="Ask me to manage your tasks..."
    />
  );
}
```

**Key Practices**:
- Use controlled components for message state
- Implement optimistic UI updates (show user message immediately)
- Handle loading states during API calls
- Display errors inline in chat
- Maintain Phase II dark futuristic theme (purple/magenta)
- Use Better Auth for authentication guard
- Auto-scroll to latest message

**Customization**:
- Override default styles with Tailwind classes
- Match Phase II color scheme (dark background, purple accents)
- Add custom message formatting (task IDs as links)
- Implement typing indicators during loading

**Alternatives Considered**:
- Custom chat component → Rejected (constitution requires ChatKit)
- react-chat-widget → Rejected (constitution requires ChatKit)
- stream-chat-react → Rejected (constitution requires ChatKit)

---

## 4. Conversation History Management

### Decision: Database-Backed History with 10-Message Context Window

**Rationale**:
- Stateless architecture requires database persistence
- 10 messages provides sufficient context without token bloat
- Chronological ordering ensures coherent conversations
- Pagination supports long conversation histories

**Database Schema**:
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    role VARCHAR NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

**Retrieval Pattern**:
```python
async def get_conversation_history(conversation_id: int, limit: int = 10):
    """Retrieve last N messages from conversation."""
    async with get_db_session() as session:
        result = await session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = result.all()
        return list(reversed(messages))  # Chronological order
```

**Key Practices**:
- Load only last 10 messages per request (context window limit)
- Store all messages permanently (no deletion)
- Index on conversation_id and created_at for fast retrieval
- Use JSONB for tool_calls (flexible structure)
- Update conversation.updated_at on new messages
- Implement pagination for frontend (load more history)

**Token Management**:
- Count tokens before sending to Groq
- If >4000 tokens, reduce message count
- Prioritize recent messages over old ones
- System prompt doesn't count toward limit

**Retention Policy**:
- Keep all conversations indefinitely (Phase III scope)
- Future: Archive conversations older than 30 days (Phase IV)
- Future: Allow users to delete conversations (Phase IV)

**Alternatives Considered**:
- In-memory conversation state → Rejected (violates stateless principle)
- Redis cache → Rejected (adds complexity, not needed for Phase III)
- Full conversation history in context → Rejected (token limits)

---

## 5. Stateless Architecture Patterns

### Decision: Request-Scoped Dependencies with Database-Backed State

**Rationale**:
- Enables horizontal scaling (multiple backend instances)
- Prevents data loss during deployments or crashes
- Simplifies testing (no shared state to manage)
- Aligns with cloud-native best practices

**Implementation Pattern**:
```python
# FastAPI dependency injection
async def get_db_session():
    """Create new database session per request."""
    async with AsyncSession(engine) as session:
        yield session

async def get_agent():
    """Create new agent instance per request."""
    return TodoAgent()

@router.post("/api/chat")
async def chat_endpoint(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db_session),
    agent: TodoAgent = Depends(get_agent),
    user: User = Depends(get_current_user)
):
    # All state loaded from database
    # No shared state between requests
    # Agent is request-scoped
    pass
```

**Key Practices**:
- Use FastAPI dependency injection for request-scoped objects
- Load all state from database at request start
- No global variables or class-level state
- Each request is independent and self-contained
- Database connection pooling for performance
- Async operations throughout

**Testing Stateless Behavior**:
```python
# Test 1: Restart server, conversation persists
def test_stateless_persistence():
    # Send message
    response1 = client.post("/api/chat", json={"message": "Add task"})
    conversation_id = response1.json()["conversation_id"]

    # Restart server (simulate)
    restart_app()

    # Continue conversation
    response2 = client.post("/api/chat", json={
        "conversation_id": conversation_id,
        "message": "Show my tasks"
    })

    # Should work without errors
    assert response2.status_code == 200

# Test 2: Parallel requests don't interfere
async def test_stateless_concurrency():
    # Send 10 requests in parallel
    tasks = [
        client.post("/api/chat", json={"message": f"Add task {i}"})
        for i in range(10)
    ]
    responses = await asyncio.gather(*tasks)

    # All should succeed independently
    assert all(r.status_code == 200 for r in responses)
```

**Horizontal Scaling**:
- Multiple backend instances can run simultaneously
- Load balancer distributes requests across instances
- No session affinity required
- Database is single source of truth

**Alternatives Considered**:
- Session-based state → Rejected (violates stateless principle)
- Sticky sessions → Rejected (limits scalability)
- Distributed cache (Redis) → Rejected (adds complexity)

---

## 6. Authentication & Authorization

### Decision: Reuse Phase II Better Auth JWT System

**Rationale**:
- Already implemented and tested in Phase II
- JWT tokens are stateless (perfect for our architecture)
- No changes needed to auth system
- Consistent user experience across Phase II and III

**Implementation Pattern**:
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session)
) -> User:
    """Validate JWT and return current user."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.getenv("JWT_SECRET"),
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")

        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(401, "User not found")

        return user
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

# Use in endpoints
@router.post("/api/chat")
async def chat_endpoint(
    request: ChatRequest,
    user: User = Depends(get_current_user)
):
    # user is authenticated
    # user.id is the user_id to use for all operations
    pass
```

**Key Practices**:
- Validate JWT on every request
- Extract user_id from token claims
- Pass user_id to all MCP tools
- Verify ownership in MCP tools (double-check)
- Return 401 for invalid/expired tokens
- Return 403 for unauthorized access to resources

**Frontend Integration**:
```typescript
// Store token from Better Auth
const token = localStorage.getItem('auth_token');

// Include in all API requests
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message })
});
```

---

## 7. Error Handling Strategy

### Decision: Multi-Layer Error Handling with User-Friendly Messages

**Error Categories**:

1. **Database Errors** (500 Internal Server Error)
   - Connection failures
   - Query errors
   - Constraint violations
   - Response: "Sorry, I'm having trouble accessing the database. Please try again."

2. **Groq API Errors** (503 Service Unavailable)
   - Rate limits
   - Network errors
   - Invalid responses
   - Response: "I'm having trouble connecting to my AI service. Please try again in a moment."

3. **Validation Errors** (400 Bad Request)
   - Invalid task IDs
   - Missing required fields
   - Invalid input format
   - Response: Agent explains what's wrong in natural language

4. **Authorization Errors** (401/403)
   - Invalid JWT token
   - Expired token
   - Cross-user access attempts
   - Response: "You don't have permission to access this resource."

**Implementation Pattern**:
```python
@router.post("/api/chat")
async def chat_endpoint(request: ChatRequest, user: User = Depends(get_current_user)):
    try:
        # Main logic
        result = await agent.chat(request.message, user.id)
        return result

    except DatabaseError as e:
        logger.error(f"Database error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Database error", "message": "Sorry, I'm having trouble accessing the database."}
        )

    except GroqAPIError as e:
        logger.error(f"Groq API error: {e}")
        return JSONResponse(
            status_code=503,
            content={"error": "AI service error", "message": "I'm having trouble connecting to my AI service."}
        )

    except ValidationError as e:
        # Let agent handle validation errors naturally
        return {"response": f"I couldn't process that: {e.message}"}

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal error", "message": "Something went wrong. Please try again."}
        )
```

---

## 8. Performance Optimization

### Key Optimizations:

1. **Database Connection Pooling**
   - Use SQLModel async engine with pool_size=20
   - Reuse connections across requests
   - Close connections properly

2. **Async Operations**
   - All I/O operations use async/await
   - Database queries are async
   - Groq API calls are async
   - No blocking operations

3. **Conversation History Limit**
   - Load only last 10 messages
   - Reduces database query time
   - Reduces token count for Groq API

4. **Database Indexes**
   - Index on messages.conversation_id
   - Index on messages.user_id
   - Index on messages.created_at
   - Composite index on (conversation_id, created_at)

5. **Response Caching**
   - Cache MCP tool schemas (static data)
   - Cache user data for request duration
   - No caching of conversation data (stateless)

**Performance Targets**:
- Chat API response time: <3 seconds (p95)
- Database query time: <100ms (p95)
- Groq API call time: <2 seconds (p95)
- Frontend render time: <100ms

---

## Summary

All research topics have been investigated and decisions documented. Key findings:

1. **FastMCP SDK**: Use decorator-based tool registration with async database operations
2. **Groq Function Calling**: OpenAI-compatible format with 10-message context window
3. **ChatKit Integration**: Pre-built UI components with custom styling
4. **Conversation History**: Database-backed with 10-message limit for context
5. **Stateless Architecture**: Request-scoped dependencies, no shared state
6. **Authentication**: Reuse Phase II Better Auth JWT system
7. **Error Handling**: Multi-layer with user-friendly messages
8. **Performance**: Async operations, connection pooling, database indexes

**Ready for Phase 1**: Design (data-model.md, contracts/, quickstart.md)
