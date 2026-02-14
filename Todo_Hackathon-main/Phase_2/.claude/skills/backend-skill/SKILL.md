---
name: backend-skill
description: Build backend functionality including generating routes, handling requests/responses, and connecting to databases.
---

# Backend Skill

## Instructions

1. **Route Generation**
   - Define RESTful routes (GET, POST, PUT, DELETE)
   - Organize routes by modules or features
   - Use route parameters and query strings properly
   - Apply middleware for authentication, validation, or logging

2. **Handling Requests & Responses**
   - Parse incoming request body, headers, and query parameters
   - Validate and sanitize input to prevent security issues
   - Send structured responses (JSON or XML) with appropriate status codes
   - Handle errors gracefully and return meaningful messages

3. **Database Connectivity**
   - Use database clients or ORM to connect to your database
   - Perform CRUD operations efficiently
   - Ensure connection pooling and proper error handling
   - Close or release connections when not needed

4. **Backend Best Practices**
   - Separate route, controller, and service layers
   - Keep controllers lightweight; delegate logic to services
   - Secure endpoints using authentication and authorization
   - Log important events and errors for monitoring
   - Use environment variables for sensitive credentials

## Example Structure
```javascript
// Example Express.js route with DB connection
import express from 'express';
import { getUserById } from './services/userService.js';
const router = express.Router();

router.get('/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// Example DB service
import db from './db.js';

export async function getUserById(id) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}
