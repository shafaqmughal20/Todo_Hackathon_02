# Phase III: Todo AI Chatbot

## Overview

Phase III extends the Todo application with conversational AI capabilities, allowing users to manage their tasks through natural language. Built on top of Phase II's authentication and task management system, this phase adds:

- **AI-Powered Chat Interface**: Natural language task management using Groq's LLM
- **Conversation Persistence**: Chat history stored in database across sessions
- **Tool Execution**: 5 MCP tools for task operations (add, list, complete, update, delete)
- **Seamless Integration**: Works alongside existing Phase II dashboard

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Chat Page    │  │ Dashboard    │  │ Auth Pages   │     │
│  │ (Phase III)  │  │ (Phase II)   │  │ (Phase II)   │     │
│  └──────┬───────┘  └──────────────┘  └──────────────┘     │
│         │                                                    │
│         │ POST /api/chat                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Chat Router (POST /api/chat)                         │  │
│  │  - JWT Authentication                                 │  │
│  │  - Conversation Management                            │  │
│  │  - Message Storage                                    │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ TodoAgent (Groq Integration)                         │  │
│  │  - System Prompt                                      │  │
│  │  - Function Calling                                   │  │
│  │  - Tool Execution                                     │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ MCP Server (5 Tools)                                 │  │
│  │  - add_task()                                         │  │
│  │  - list_tasks()                                       │  │
│  │  - complete_task()                                    │  │
│  │  - update_task()                                      │  │
│  │  - delete_task()                                      │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                              │
└───────────────┼──────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │  tasks   │  │ convs    │  │ messages │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Natural Language Task Management
- **Add Tasks**: "Add a task to buy groceries"
- **List Tasks**: "Show me my tasks" or "What do I need to do?"
- **Complete Tasks**: "Mark task 5 as complete"
- **Update Tasks**: "Change task 3 to 'buy groceries and cook dinner'"
- **Delete Tasks**: "Delete task 7"

### 2. Conversation Persistence
- Chat history saved to database
- Conversations persist across page refreshes
- Conversations persist across server restarts
- Last 10 messages loaded for context

### 3. Security
- JWT authentication required for all chat endpoints
- User ownership validation on all task operations
- Users can only access their own tasks and conversations

## Setup Instructions

### Prerequisites
- Phase II fully functional and running
- Groq API key (get one at https://console.groq.com)
- Python 3.12+ with virtual environment
- Node.js 18+ and npm

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd Phase_2/phase-2/backend
   ```

2. **Activate virtual environment**
   ```bash
   source venv/bin/activate  # Linux/Mac
   # or
   .\venv\Scripts\activate  # Windows
   ```

3. **Install new dependencies**
   ```bash
   pip install groq==0.4.0
   ```

4. **Add Groq API key to .env**
   ```bash
   echo "GROQ_API_KEY=your_groq_api_key_here" >> .env
   ```

5. **Verify configuration**
   ```bash
   python -c "from src.config import settings; print('✓ Groq API key configured')"
   ```

6. **Start the backend server**
   ```bash
   uvicorn src.main:app --reload --port 8002
   ```

   The server will automatically create the new database tables (conversations, messages) on startup.

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd Phase_2/phase-2/frontend
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:3000
   - Sign in with your existing account
   - Navigate to the chat interface

## Environment Variables

### Backend (.env)
```env
# Existing Phase II variables
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:8002
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
DEBUG=True

# Phase III - New
GROQ_API_KEY=gsk_...  # Your Groq API key
```

## Testing Instructions

### 1. Manual Testing

**Test Chat Interface:**
1. Sign in to the application
2. Navigate to `/chat` (or click "AI Chat Assistant" in header)
3. Try these commands:
   - "Add a task to buy groceries"
   - "Show me my tasks"
   - "Mark task [ID] as complete"
   - "Update task [ID] to 'new title'"
   - "Delete task [ID]"

**Test Conversation Persistence:**
1. Send a few messages in chat
2. Refresh the page
3. Verify messages are still visible
4. Restart the backend server
5. Refresh the page again
6. Verify messages are still visible

**Test Phase II Compatibility:**
1. Navigate to `/dashboard`
2. Verify task list still works
3. Add a task using the form
4. Go back to `/chat`
5. Ask "Show me my tasks"
6. Verify the new task appears

### 2. API Testing

**Test Chat Endpoint:**
```bash
# Get JWT token first (sign in via UI or API)
TOKEN="your_jwt_token_here"

# Send a chat message
curl -X POST http://localhost:8002/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Add a task to test the API"}'
```

Expected response:
```json
{
  "conversation_id": 1,
  "response": "I've added a task 'test the API' for you...",
  "timestamp": "2026-02-10T..."
}
```

### 3. Database Verification

**Check tables exist:**
```bash
# Using psql
psql $DATABASE_URL -c "\dt"

# Should show: users, tasks, conversations, messages
```

**Check conversation data:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM conversations;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM messages;"
```

## Troubleshooting

### Backend Issues

**Error: "No module named 'groq'"**
- Solution: Install Groq SDK: `pip install groq==0.4.0`

**Error: "groq_api_key field required"**
- Solution: Add `GROQ_API_KEY=your_key` to `.env` file

**Error: "relation 'conversations' does not exist"**
- Solution: Restart the backend server to create tables automatically

**Error: "Groq API rate limit exceeded"**
- Solution: Wait a few seconds and try again. Groq has rate limits on free tier.

### Frontend Issues

**Chat page shows blank screen**
- Check browser console for errors
- Verify backend is running on port 8002
- Check JWT token is valid (try signing in again)

**Messages not persisting**
- Check database connection
- Verify conversations and messages tables exist
- Check browser console for API errors

### Common Issues

**CORS errors**
- Verify `FRONTEND_URL=http://localhost:3000` in backend `.env`
- Restart backend server after changing `.env`

**Authentication errors**
- Sign out and sign in again to get fresh JWT token
- Check `BETTER_AUTH_SECRET` is set in `.env`

## API Endpoints

### Chat Endpoints (Phase III)

**POST /api/chat**
- Description: Send a chat message and get AI response
- Auth: Required (JWT)
- Request:
  ```json
  {
    "conversation_id": 1,  // optional, null for new conversation
    "message": "Add a task to buy milk"
  }
  ```
- Response:
  ```json
  {
    "conversation_id": 1,
    "response": "I've added a task 'buy milk' for you!",
    "timestamp": "2026-02-10T12:34:56"
  }
  ```

**GET /api/chat/conversations**
- Description: List all conversations for current user
- Auth: Required (JWT)
- Response: Array of conversation objects

**GET /api/chat/conversations/{id}/messages**
- Description: Get all messages in a conversation
- Auth: Required (JWT)
- Response: Array of message objects

## Technology Stack

### Phase III Additions
- **Groq API**: LLM inference (llama-3.3-70b-versatile)
- **MCP (Model Context Protocol)**: Tool execution framework
- **Function Calling**: OpenAI-compatible tool use

### Existing (Phase II)
- **Backend**: FastAPI, SQLModel, PostgreSQL (Neon)
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Auth**: Better Auth with JWT

## Performance

- **Chat Response Time**: < 3 seconds (typical)
- **Database Queries**: Optimized with indexes on foreign keys
- **Message History**: Limited to last 10 messages for context
- **Connection Pooling**: 5 connections, 10 max overflow

## Security Considerations

1. **API Key Protection**: Groq API key stored in `.env`, never committed
2. **JWT Validation**: All chat endpoints require valid JWT token
3. **User Isolation**: Users can only access their own tasks/conversations
4. **Input Validation**: Message length limited to 10,000 characters
5. **SQL Injection**: Protected by SQLModel ORM

## Deployment

### Backend Deployment (Render/Railway/Fly.io)

1. Add `GROQ_API_KEY` to environment variables
2. Ensure all dependencies in `requirements.txt`
3. Database tables created automatically on startup
4. No migration scripts needed (SQLModel handles it)

### Frontend Deployment (Vercel/Netlify)

1. No additional environment variables needed
2. Build command: `npm run build`
3. Output directory: `.next`

## Future Enhancements

- [ ] Multiple conversation support (conversation list UI)
- [ ] Conversation titles (auto-generated from first message)
- [ ] Message editing and deletion
- [ ] Voice input support
- [ ] Task suggestions based on conversation
- [ ] Export conversation history
- [ ] Conversation search

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Phase II documentation for base functionality
3. Check Groq API status: https://status.groq.com
4. Open an issue in the repository

## License

Same as Phase II (see main project LICENSE file)
