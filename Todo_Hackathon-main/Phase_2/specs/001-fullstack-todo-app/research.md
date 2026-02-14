# Research: Phase II — Full-Stack Web Application

**Feature**: 001-fullstack-todo-app
**Date**: 2026-02-07
**Purpose**: Resolve technical unknowns and validate technology choices before design phase

## Research Questions & Decisions

### 1. Better Auth Integration for Next.js + FastAPI

**Question**: How to integrate Better Auth across separate Next.js frontend and FastAPI backend?

**Decision**: Use Better Auth on frontend only for user management and JWT token generation. Backend validates JWT tokens independently using PyJWT library.

**Rationale**:
- Better Auth has mature Next.js integration with built-in session management
- Backend only needs JWT validation, not full Better Auth SDK
- Simpler architecture with clear separation of concerns
- Reduces backend dependencies

**Alternatives Considered**:
- Full Better Auth SDK on both sides: Rejected due to complexity and tight coupling
- Custom auth implementation: Rejected due to security risks and reinventing the wheel
- OAuth2 flow: Rejected as overkill for Phase II requirements

**Implementation Notes**:
- Frontend: Use `better-auth` npm package with Next.js App Router
- Backend: Use `PyJWT` for token validation with shared secret
- Token format: Standard JWT with user_id in payload

---

### 2. JWT Token Flow Between Frontend and Backend

**Question**: How should JWT tokens be transmitted and validated?

**Decision**:
- Frontend stores JWT in httpOnly cookies (managed by Better Auth)
- Frontend attaches JWT to API requests via Authorization header: `Bearer <token>`
- Backend validates JWT signature and extracts user_id from payload
- Backend compares URL user_id parameter with token user_id claim

**Rationale**:
- httpOnly cookies prevent XSS attacks
- Authorization header is REST API standard
- Server-side validation ensures security
- User_id comparison prevents privilege escalation

**Alternatives Considered**:
- localStorage for tokens: Rejected due to XSS vulnerability
- Session-based auth: Rejected due to scalability concerns and stateful backend
- API keys: Rejected due to lack of user context

**Token Payload Structure**:
```json
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

---

### 3. Neon PostgreSQL Connection Best Practices

**Question**: How to connect FastAPI to Neon PostgreSQL efficiently?

**Decision**: Use SQLModel with async PostgreSQL driver (asyncpg) and connection pooling.

**Rationale**:
- Neon provides connection pooling at the service level
- asyncpg is the fastest PostgreSQL driver for Python
- SQLModel provides type-safe ORM with Pydantic integration
- Async operations improve FastAPI performance

**Alternatives Considered**:
- psycopg2 (sync): Rejected due to blocking I/O
- SQLAlchemy Core: Rejected due to more boilerplate than SQLModel
- Raw SQL queries: Rejected due to SQL injection risks and lack of type safety

**Connection String Format**:
```
postgresql+asyncpg://user:password@host/database?sslmode=require
```

**Configuration**:
- Pool size: 10 connections (Neon default)
- Connection timeout: 30 seconds
- SSL mode: require (Neon enforces SSL)

---

### 4. SQLModel Relationship Patterns for One-to-Many

**Question**: How to model User → Tasks one-to-many relationship in SQLModel?

**Decision**: Use SQLModel's `Relationship` with foreign key on Task table.

**Rationale**:
- Standard relational database pattern
- Efficient queries with proper indexing
- Type-safe relationship traversal
- Automatic cascade delete support

**Implementation Pattern**:
```python
class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tasks: List["Task"] = Relationship(back_populates="owner")

class Task(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    owner: User = Relationship(back_populates="tasks")
```

**Alternatives Considered**:
- Many-to-many: Rejected as tasks belong to single user
- Embedded documents: Rejected as PostgreSQL is relational, not document-based
- Separate tables without relationships: Rejected due to lack of referential integrity

---

### 5. Next.js App Router Authentication Patterns

**Question**: How to protect routes and manage auth state in Next.js App Router?

**Decision**: Use middleware for route protection and React Context for auth state.

**Rationale**:
- Middleware runs on edge, providing fast route protection
- React Context provides client-side auth state management
- Server Components can access auth state via Better Auth session
- Supports both server and client-side rendering

**Implementation Pattern**:
- `middleware.ts`: Redirect unauthenticated users from protected routes
- `AuthProvider`: React Context for client-side auth state
- `useAuth()` hook: Access auth state in components
- Server Components: Use Better Auth's `getSession()` for SSR

**Protected Routes**:
- `/dashboard/*` - Requires authentication
- `/api/*` - Requires valid JWT token

**Alternatives Considered**:
- Client-side only protection: Rejected due to security risks
- HOC pattern: Rejected as less idiomatic for App Router
- Route guards in layout: Rejected due to complexity

---

### 6. FastAPI Middleware for JWT Validation

**Question**: How to implement JWT validation middleware in FastAPI?

**Decision**: Create custom dependency injection function for JWT validation.

**Rationale**:
- FastAPI's dependency injection is idiomatic and testable
- Reusable across all protected endpoints
- Clear error handling with HTTP 401/403 responses
- Easy to mock in tests

**Implementation Pattern**:
```python
async def get_current_user(
    authorization: str = Header(...),
    user_id: str = Path(...)
) -> str:
    # Validate JWT token
    # Extract user_id from token
    # Compare with URL user_id
    # Return user_id if valid, raise HTTPException if not
```

**Validation Steps**:
1. Extract token from Authorization header
2. Verify JWT signature using shared secret
3. Check token expiration
4. Extract user_id from token payload
5. Compare token user_id with URL user_id parameter
6. Raise 401 if token invalid, 403 if user_id mismatch

**Alternatives Considered**:
- Global middleware: Rejected due to difficulty in accessing path parameters
- Decorator pattern: Rejected as less Pythonic than dependency injection
- Third-party auth library: Rejected to minimize dependencies

---

## Technology Stack Validation

### Backend Stack
✅ **FastAPI 0.104+**: Async support, automatic OpenAPI docs, type hints
✅ **SQLModel 0.0.14+**: Type-safe ORM, Pydantic integration
✅ **PyJWT 2.8+**: JWT encoding/decoding, industry standard
✅ **asyncpg**: Fastest PostgreSQL driver for Python
✅ **pytest + pytest-asyncio**: Async test support

### Frontend Stack
✅ **Next.js 14+**: App Router, Server Components, built-in optimization
✅ **Better Auth**: Mature auth solution, Next.js integration
✅ **Tailwind CSS 3.x**: Utility-first CSS, rapid UI development
✅ **TypeScript 5.x**: Type safety, better DX
✅ **React 18+**: Concurrent features, Server Components support

### Database
✅ **Neon PostgreSQL**: Serverless, connection pooling, auto-scaling

---

## Risk Assessment

### Low Risk
- Technology stack is mature and well-documented
- Clear separation between frontend and backend
- Standard REST API patterns

### Medium Risk
- Better Auth + FastAPI integration (less common pattern)
  - **Mitigation**: Use standard JWT validation on backend
- User_id validation complexity
  - **Mitigation**: Centralized dependency injection function

### High Risk
- None identified

---

## Conclusion

All research questions resolved with clear decisions and rationale. Technology stack validated against requirements. Ready to proceed to Phase 1 (Design).

**Next Phase**: Create data-model.md, contracts/, and quickstart.md
