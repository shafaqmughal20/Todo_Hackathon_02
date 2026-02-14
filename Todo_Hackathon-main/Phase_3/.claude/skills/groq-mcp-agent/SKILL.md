---
name: groq-mcp-agent
description: Integrate Groq LLM API with MCP servers to build conversational AI agents that understand natural language and execute tools via function calling.
---

# Groq MCP Agent Skill

## Instructions

1. **Groq Client Setup**
   - Install groq Python SDK with `pip install groq` for OpenAI-compatible API access
   - Configure API key from environment variable (GROQ_API_KEY) for secure credential management
   - Use llama-3.3-70b-versatile model (recommended for function calling and reasoning)
   - Initialize client once at module level for connection reuse across requests
   - Set reasonable timeout values (30-60 seconds) to handle long-running tool executions

2. **Function Calling Integration**
   - Convert MCP tool definitions to OpenAI function format with name, description, and parameters
   - Transform JSON Schema from MCP tools to OpenAI-compatible function schemas
   - Pass tools array to Groq API with tool_choice="auto" for automatic tool selection
   - Parse tool_calls from LLM response to identify which MCP tools to execute
   - Execute corresponding MCP tools with extracted arguments from tool_calls
   - Send tool results back to LLM in proper message format for continued reasoning

3. **Conversational Agent Architecture**
   - Design system prompt that defines agent personality, capabilities, and task domain
   - Construct message array with proper roles (system, user, assistant, tool)
   - Handle multi-turn conversations by maintaining full message history
   - Preserve context across turns by loading complete conversation from database
   - Manage role transitions (user asks → assistant responds → tool executes → assistant confirms)

4. **Stateless Request-Response Pattern**
   - Load full conversation history from database at the start of each request
   - Rebuild complete message context including all previous turns and tool calls
   - Never store conversation state in memory between requests (stateless design)
   - Store user messages in database before calling LLM for durability
   - Store assistant responses after LLM call with tool_calls metadata
   - Store tool execution results linked to conversation for complete audit trail

5. **Natural Language Understanding Patterns**
   - Recognize user intents (add task, list tasks, complete task, delete task, update task)
   - Extract entities from natural language (task IDs, titles, descriptions, priorities)
   - Handle ambiguous requests by asking clarifying questions before tool execution
   - Confirm destructive actions (delete, bulk updates) before executing tools
   - Support multi-step requests ("add 3 tasks" → multiple tool calls in sequence)

6. **Error Handling**
   - Catch tool execution failures and explain errors to user in natural language
   - Handle database errors during conversation loading/saving with retry logic
   - Implement exponential backoff for LLM API rate limits and transient failures
   - Validate user inputs before tool execution to prevent invalid operations
   - Provide graceful degradation when tools are unavailable (explain limitations)
   - Generate user-friendly error messages that suggest corrective actions

7. **Response Generation**
   - Confirm actions taken with specific details (task IDs, titles, counts)
   - Use friendly, conversational tone that matches user's communication style
   - Include relevant context in responses (e.g., "I've added 'Buy groceries' as task #42")
   - Handle multi-step requests with clear summaries of all actions taken
   - Ask follow-up questions when appropriate to improve user experience

## Example Structure

```python
# ============================================================================
# Groq Client Setup and Configuration
# ============================================================================

import os
import json
from groq import Groq
from typing import List, Dict, Any, Optional
from datetime import datetime

# Initialize Groq client (do this once at module level)
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    timeout=60.0  # 60 second timeout for tool execution
)

# Recommended model for function calling
MODEL = "llama-3.3-70b-versatile"

# System prompt defining agent behavior
SYSTEM_PROMPT = """You are a helpful AI assistant for managing todo tasks.

Your capabilities:
- Add new tasks with titles, descriptions, and priorities
- List tasks (all, completed, or incomplete)
- Mark tasks as completed or incomplete
- Delete tasks
- Update task details

Guidelines:
- Be friendly and conversational
- Confirm actions with specific details (task IDs, titles)
- Ask clarifying questions for ambiguous requests
- Confirm before deleting tasks
- Provide helpful summaries for multi-step operations

Always use the available tools to perform actions. Never make up task IDs or data."""

# ============================================================================
# MCP Tool to OpenAI Function Format Conversion
# ============================================================================

def convert_mcp_tools_to_openai_functions(mcp_tools: List[Dict]) -> List[Dict]:
    """
    Convert MCP tool definitions to OpenAI function calling format.

    MCP tools have: name, description, inputSchema
    OpenAI functions need: name, description, parameters
    """
    openai_functions = []

    for tool in mcp_tools:
        function = {
            "type": "function",
            "function": {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": tool["inputSchema"]  # JSON Schema format
            }
        }
        openai_functions.append(function)

    return openai_functions

# Example MCP tools definition
MCP_TOOLS = [
    {
        "name": "create_task",
        "description": "Create a new task for a user",
        "inputSchema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "integer", "description": "User ID"},
                "title": {"type": "string", "description": "Task title"},
                "description": {"type": "string", "description": "Task description"},
                "priority": {"type": "string", "enum": ["low", "medium", "high"]}
            },
            "required": ["user_id", "title"]
        }
    },
    {
        "name": "get_user_tasks",
        "description": "Get all tasks for a user, optionally filtered by completion status",
        "inputSchema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "integer", "description": "User ID"},
                "completed": {"type": "boolean", "description": "Filter by completion status"}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "update_task_status",
        "description": "Mark a task as completed or incomplete",
        "inputSchema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "Task ID"},
                "completed": {"type": "boolean", "description": "Completion status"},
                "user_id": {"type": "integer", "description": "User ID for authorization"}
            },
            "required": ["task_id", "completed", "user_id"]
        }
    },
    {
        "name": "delete_task",
        "description": "Delete a task permanently",
        "inputSchema": {
            "type": "object",
            "properties": {
                "task_id": {"type": "integer", "description": "Task ID"},
                "user_id": {"type": "integer", "description": "User ID for authorization"}
            },
            "required": ["task_id", "user_id"]
        }
    }
]

# Convert to OpenAI format
OPENAI_TOOLS = convert_mcp_tools_to_openai_functions(MCP_TOOLS)

# ============================================================================
# Tool Execution Router
# ============================================================================

async def execute_mcp_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute an MCP tool by name with given arguments.
    Returns the tool result as a dictionary.
    """
    # Import your MCP tools
    from your_mcp_server import create_task, get_user_tasks, update_task_status, delete_task

    tool_map = {
        "create_task": create_task,
        "get_user_tasks": get_user_tasks,
        "update_task_status": update_task_status,
        "delete_task": delete_task
    }

    if tool_name not in tool_map:
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}"
        }

    try:
        # Execute the tool
        result = await tool_map[tool_name](**arguments)

        # Parse JSON string result if needed
        if isinstance(result, str):
            result = json.loads(result)

        return result

    except Exception as e:
        return {
            "success": False,
            "error": f"Tool execution failed: {str(e)}"
        }

# ============================================================================
# Conversation History Management (Stateless Pattern)
# ============================================================================

from sqlmodel import SQLModel, Field, Session, select
from sqlalchemy.ext.asyncio import AsyncSession

class ConversationMessage(SQLModel, table=True):
    """Store conversation messages for stateless agent"""
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: str = Field(index=True)
    user_id: int = Field(index=True)
    role: str  # system, user, assistant, tool
    content: Optional[str] = None
    tool_calls: Optional[str] = None  # JSON string
    tool_call_id: Optional[str] = None
    name: Optional[str] = None  # Tool name for tool role
    created_at: datetime = Field(default_factory=datetime.utcnow)

async def load_conversation_history(
    session: AsyncSession,
    conversation_id: str
) -> List[Dict[str, Any]]:
    """
    Load full conversation history from database.
    Returns messages in OpenAI format.
    """
    result = await session.execute(
        select(ConversationMessage)
        .where(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.created_at)
    )
    messages = result.scalars().all()

    # Convert to OpenAI message format
    openai_messages = []
    for msg in messages:
        message = {"role": msg.role}

        if msg.content:
            message["content"] = msg.content

        if msg.tool_calls:
            message["tool_calls"] = json.loads(msg.tool_calls)

        if msg.tool_call_id:
            message["tool_call_id"] = msg.tool_call_id

        if msg.name:
            message["name"] = msg.name

        openai_messages.append(message)

    return openai_messages

async def save_message(
    session: AsyncSession,
    conversation_id: str,
    user_id: int,
    role: str,
    content: Optional[str] = None,
    tool_calls: Optional[List[Dict]] = None,
    tool_call_id: Optional[str] = None,
    name: Optional[str] = None
):
    """Save a message to conversation history"""
    message = ConversationMessage(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content,
        tool_calls=json.dumps(tool_calls) if tool_calls else None,
        tool_call_id=tool_call_id,
        name=name
    )
    session.add(message)
    await session.flush()

# ============================================================================
# Main Conversational Agent Flow
# ============================================================================

async def process_user_message(
    session: AsyncSession,
    conversation_id: str,
    user_id: int,
    user_message: str
) -> str:
    """
    Process a user message through the conversational agent.

    Flow:
    1. Load conversation history from database
    2. Add user message to history
    3. Call Groq LLM with tools
    4. Handle tool calls if present
    5. Get final response
    6. Save all messages to database
    7. Return assistant response
    """

    try:
        # Step 1: Load conversation history (stateless pattern)
        messages = await load_conversation_history(session, conversation_id)

        # Add system prompt if this is a new conversation
        if not messages:
            messages.append({
                "role": "system",
                "content": SYSTEM_PROMPT
            })
            await save_message(
                session, conversation_id, user_id,
                role="system", content=SYSTEM_PROMPT
            )

        # Step 2: Add user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        await save_message(
            session, conversation_id, user_id,
            role="user", content=user_message
        )

        # Step 3: Call Groq LLM with function calling
        response = groq_client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=OPENAI_TOOLS,
            tool_choice="auto",
            temperature=0.7,
            max_tokens=1000
        )

        assistant_message = response.choices[0].message

        # Step 4: Handle tool calls if present
        if assistant_message.tool_calls:
            # Save assistant message with tool calls
            await save_message(
                session, conversation_id, user_id,
                role="assistant",
                content=assistant_message.content,
                tool_calls=[
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            )

            # Add assistant message to context
            messages.append({
                "role": "assistant",
                "content": assistant_message.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })

            # Execute each tool call
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)

                # Add user_id to tool arguments for authorization
                tool_args["user_id"] = user_id

                # Execute MCP tool
                tool_result = await execute_mcp_tool(tool_name, tool_args)
                tool_result_str = json.dumps(tool_result)

                # Save tool result
                await save_message(
                    session, conversation_id, user_id,
                    role="tool",
                    content=tool_result_str,
                    tool_call_id=tool_call.id,
                    name=tool_name
                )

                # Add tool result to context
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_name,
                    "content": tool_result_str
                })

            # Step 5: Get final response after tool execution
            final_response = groq_client.chat.completions.create(
                model=MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            final_message = final_response.choices[0].message.content

            # Save final assistant response
            await save_message(
                session, conversation_id, user_id,
                role="assistant",
                content=final_message
            )

            return final_message

        else:
            # No tool calls - direct response
            response_content = assistant_message.content

            # Save assistant response
            await save_message(
                session, conversation_id, user_id,
                role="assistant",
                content=response_content
            )

            return response_content

    except Exception as e:
        error_message = f"I encountered an error: {str(e)}. Please try again."

        # Save error message
        await save_message(
            session, conversation_id, user_id,
            role="assistant",
            content=error_message
        )

        return error_message

# ============================================================================
# Example Usage in API Endpoint
# ============================================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    conversation_id: str
    user_id: int
    message: str

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint that processes user messages through Groq agent.
    """
    async with get_db_session() as session:
        try:
            response = await process_user_message(
                session=session,
                conversation_id=request.conversation_id,
                user_id=request.user_id,
                user_message=request.message
            )

            return ChatResponse(
                response=response,
                conversation_id=request.conversation_id
            )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process message: {str(e)}"
            )

# ============================================================================
# Error Handling Patterns
# ============================================================================

from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def call_groq_with_retry(messages, tools):
    """
    Call Groq API with exponential backoff retry for rate limits.
    """
    try:
        return groq_client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
    except Exception as e:
        if "rate_limit" in str(e).lower():
            # Will retry with exponential backoff
            raise
        else:
            # Don't retry for other errors
            return None

# ============================================================================
# Natural Language Understanding Examples
# ============================================================================

# Example 1: Intent Recognition
# User: "Add buy groceries to my list"
# → LLM calls create_task(title="buy groceries")

# Example 2: Entity Extraction
# User: "Mark task 42 as done"
# → LLM calls update_task_status(task_id=42, completed=True)

# Example 3: Clarifying Questions
# User: "Delete my task"
# → LLM asks: "Which task would you like to delete? Please provide the task ID or title."

# Example 4: Multi-step Request
# User: "Add 'buy milk' and 'call mom' to my tasks"
# → LLM calls create_task twice with different titles

# Example 5: Confirmation for Destructive Actions
# User: "Delete task 5"
# → LLM asks: "Are you sure you want to delete task 5: 'Buy groceries'?"
```

## Key Patterns Summary

**Groq API Call with Function Calling:**
```python
response = groq_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=messages,
    tools=openai_tools,
    tool_choice="auto"
)
```

**Tool Call Handling:**
```python
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        tool_name = tool_call.function.name
        tool_args = json.loads(tool_call.function.arguments)
        result = await execute_mcp_tool(tool_name, tool_args)
```

**Stateless Conversation Pattern:**
```python
# Load full history at start of each request
messages = await load_conversation_history(session, conversation_id)

# Process request
# ...

# Save all new messages
await save_message(session, conversation_id, user_id, role, content)
```

**Message Format:**
```python
messages = [
    {"role": "system", "content": "System prompt"},
    {"role": "user", "content": "User message"},
    {"role": "assistant", "content": "Response", "tool_calls": [...]},
    {"role": "tool", "tool_call_id": "...", "name": "tool_name", "content": "result"}
]
```

**Error Handling:**
```python
try:
    result = await execute_mcp_tool(tool_name, tool_args)
    if not result.get("success"):
        # Tool returned error - explain to user
        return f"I couldn't complete that action: {result.get('error')}"
except Exception as e:
    # Unexpected error - graceful degradation
    return "I encountered an error. Please try again."
```
