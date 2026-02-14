---
name: auth-skill
description: Handle secure user authentication flows including signup, signin, password hashing, JWT token management, and Better Auth integration.
---

# Auth Skill

## Instructions

1. **Signup Flow**
   - Collect user credentials (email, password, etc.)
   - Validate inputs (email format, password strength)
   - Hash passwords securely using bcrypt or argon2
   - Store user securely in database
   - Return success message or error

2. **Signin Flow**
   - Verify user credentials
   - Compare password with hashed value in database
   - Generate JWT access token and optional refresh token
   - Return tokens to user with expiration info
   - Handle invalid credentials gracefully

3. **JWT Token Management**
   - Generate tokens with strong secret keys
   - Include expiration times for access and refresh tokens
   - Implement token verification middleware
   - Support token refresh flow
   - Revoke tokens when necessary (logout or security breach)

4. **Better Auth Integration**
   - Configure Better Auth library correctly
   - Use it for signup, signin, and token management
   - Enable built-in security features (rate limiting, brute force protection)
   - Ensure smooth integration with existing API endpoints

5. **Security Best Practices**
   - Use HTTPS for all endpoints
   - Store hashed passwords only; never store plain passwords
   - Use strong JWT secrets and secure storage
   - Implement input validation and sanitization
   - Log authentication events for monitoring

## Example Structure
```javascript
// Signup example
import { hashPassword } from 'auth-utils';
import { createUser } from './database';

async function signup(email, password) {
  const hashed = await hashPassword(password);
  const user = await createUser({ email, password: hashed });
  return { message: 'User created successfully', userId: user.id };
}

// Signin example
import { verifyPassword } from 'auth-utils';
import { generateJWT } from 'auth-jwt';

async function signin(email, password) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  const token = generateJWT({ id: user.id, email: user.email });
  return { token };
}
