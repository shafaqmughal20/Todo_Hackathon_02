# Quickstart Guide: Phase II — Full-Stack Web Application

**Feature**: 001-fullstack-todo-app
**Date**: 2026-02-07
**Purpose**: Setup instructions for local development environment

## Prerequisites

### Required Software
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **npm**: 9 or higher (comes with Node.js)
- **Git**: Latest version
- **Neon Account**: Free tier account at [neon.tech](https://neon.tech)

### Recommended Tools
- **VS Code**: With Python and TypeScript extensions
- **Postman** or **Insomnia**: For API testing
- **PostgreSQL Client**: pgAdmin or DBeaver (optional, for database inspection)

---

## Project Setup

### 1. Clone Repository and Navigate to Phase 2

```bash
# Navigate to Phase 2 directory
cd /path/to/HACKATHON_2/Phase_2

# Verify you're on the correct branch
git branch
# Should show: * 001-fullstack-todo-app
```

---

## Backend Setup (FastAPI)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected dependencies** (requirements.txt):
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlmodel==0.0.14
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
asyncpg==0.29.0
psycopg2-binary==2.9.9
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your values
nano .env  # or use your preferred editor
```

**Required environment variables** (.env):
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/database?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long

# Application
APP_ENV=development
DEBUG=true
CORS_ORIGINS=http://localhost:3000

# Server
HOST=0.0.0.0
PORT=8000
```

### 5. Setup Neon PostgreSQL Database

1. **Create Neon Project**:
   - Go to [console.neon.tech](https://console.neon.tech)
   - Click "New Project"
   - Name: "phase2-todo-app"
   - Region: Choose closest to you
   - PostgreSQL version: 15 or higher

2. **Get Connection String**:
   - Copy the connection string from Neon dashboard
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - Update `DATABASE_URL` in `.env` file

3. **Run Database Migrations**:
   ```bash
   # Create tables and indexes
   python -m src.database init

   # Or run SQL directly (if init script not available)
   # Use the SQL from data-model.md
   ```

### 6. Run Backend Server

```bash
# Start FastAPI server with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify backend is running**:
- Open browser: http://localhost:8000/docs
- You should see FastAPI Swagger UI with API documentation

---

## Frontend Setup (Next.js)

### 1. Navigate to Frontend Directory

```bash
# From project root
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

**Expected dependencies** (package.json):
```json
{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "better-auth": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local file
nano .env.local
```

**Required environment variables** (.env.local):
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
```

**IMPORTANT**: `BETTER_AUTH_SECRET` must match the backend value!

### 4. Run Frontend Development Server

```bash
npm run dev
```

**Verify frontend is running**:
- Open browser: http://localhost:3000
- You should see the landing page

---

## Verification Checklist

### Backend Verification
- [ ] Backend server running on http://localhost:8000
- [ ] Swagger UI accessible at http://localhost:8000/docs
- [ ] Database connection successful (check server logs)
- [ ] No error messages in terminal

### Frontend Verification
- [ ] Frontend server running on http://localhost:3000
- [ ] Landing page loads without errors
- [ ] Browser console shows no errors
- [ ] Hot reload works (edit a file and see changes)

### Integration Verification
- [ ] Frontend can reach backend API
- [ ] CORS configured correctly (no CORS errors in browser console)
- [ ] Environment variables loaded correctly

---

## Testing the Application

### 1. Create a Test User

**Option A: Via Frontend**
1. Navigate to http://localhost:3000/signup
2. Enter email: test@example.com
3. Enter password: Test1234
4. Click "Sign Up"
5. You should be redirected to dashboard

**Option B: Via API (Postman/curl)**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### 2. Sign In

1. Navigate to http://localhost:3000/signin
2. Enter credentials from step 1
3. Click "Sign In"
4. You should be redirected to dashboard with empty task list

### 3. Create a Task

**Via Frontend**:
1. On dashboard, click "New Task"
2. Enter title: "Test Task"
3. Enter description: "This is a test"
4. Click "Create"
5. Task should appear in list

**Via API**:
```bash
# First, get JWT token from signin response
# Then use it in Authorization header

curl -X POST http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test"
  }'
```

### 4. Verify Data Isolation

1. Create second user account
2. Sign in as second user
3. Verify you don't see first user's tasks
4. Create tasks as second user
5. Sign back in as first user
6. Verify you only see your own tasks

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/integration/test_auth_flow.py

# Run with verbose output
pytest -v
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

## Common Issues & Solutions

### Issue: Database Connection Failed

**Symptoms**: Backend fails to start, error about database connection

**Solutions**:
1. Verify Neon database is running (check Neon dashboard)
2. Check `DATABASE_URL` in `.env` is correct
3. Ensure `sslmode=require` is in connection string
4. Verify network connectivity to Neon

### Issue: CORS Errors in Browser

**Symptoms**: Frontend can't reach backend, CORS errors in console

**Solutions**:
1. Verify `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
2. Restart backend server after changing `.env`
3. Clear browser cache and reload

### Issue: JWT Token Invalid

**Symptoms**: 401 Unauthorized errors on API requests

**Solutions**:
1. Verify `BETTER_AUTH_SECRET` matches in both frontend and backend
2. Check token expiration (sign in again)
3. Verify Authorization header format: `Bearer <token>`

### Issue: Port Already in Use

**Symptoms**: "Address already in use" error

**Solutions**:
```bash
# Find process using port 8000 (backend)
lsof -i :8000
kill -9 <PID>

# Find process using port 3000 (frontend)
lsof -i :3000
kill -9 <PID>
```

### Issue: Module Not Found

**Symptoms**: Import errors in Python or TypeScript

**Solutions**:
- Backend: Ensure virtual environment is activated, reinstall dependencies
- Frontend: Delete `node_modules` and `package-lock.json`, run `npm install` again

---

## Development Workflow

### Making Changes

1. **Backend changes**:
   - Edit files in `backend/src/`
   - Server auto-reloads (uvicorn --reload)
   - Check terminal for errors
   - Test via Swagger UI or frontend

2. **Frontend changes**:
   - Edit files in `frontend/src/`
   - Browser auto-reloads (Next.js Fast Refresh)
   - Check browser console for errors
   - Test in browser

### Database Schema Changes

1. Update `data-model.md` with new schema
2. Create migration SQL script
3. Run migration on Neon database
4. Update SQLModel models in `backend/src/models/`
5. Update TypeScript types in `frontend/src/types/`
6. Test thoroughly

### API Contract Changes

1. Update `contracts/openapi.yaml`
2. Update backend endpoint implementation
3. Update frontend API client
4. Update tests
5. Verify with Swagger UI

---

## Next Steps

After successful setup:
1. Review [spec.md](./spec.md) for feature requirements
2. Review [plan.md](./plan.md) for implementation approach
3. Review [data-model.md](./data-model.md) for database schema
4. Review [contracts/openapi.yaml](./contracts/openapi.yaml) for API specification
5. Wait for `/sp.tasks` to generate implementation tasks

---

## Support & Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com/
- Next.js: https://nextjs.org/docs
- Better Auth: https://better-auth.com/docs
- SQLModel: https://sqlmodel.tiangolo.com/
- Neon: https://neon.tech/docs

### Troubleshooting
- Check server logs for detailed error messages
- Use browser DevTools Network tab to inspect API requests
- Use Swagger UI to test API endpoints directly
- Review `.env` files for configuration issues

### Getting Help
- Review error messages carefully
- Check documentation for the specific technology
- Search for error messages online
- Review Phase II constitution for constraints and requirements
