---
name: chatkit-frontend
description: Build chat interfaces using OpenAI ChatKit component library with FastAPI backend integration, Better Auth authentication, and production deployment patterns.
---

# ChatKit Frontend Skill

## Instructions

1. **ChatKit Installation & Setup**
   - Install npm package with `npm install @openai/chatkit` or `yarn add @openai/chatkit`
   - Configure environment variables (NEXT_PUBLIC_OPENAI_API_KEY for dev, domain key for production)
   - Set up TypeScript with proper type definitions for ChatKit components
   - Import ChatKit CSS styles in your layout or global styles file
   - Configure Next.js for client-side rendering of chat components

2. **ChatKit Components**
   - Use ChatWindow component as main container for chat interface
   - Render messages with proper role distinction (user vs assistant messages)
   - Customize input field with placeholder text and submit handlers
   - Display loading states with spinners during API calls
   - Show error messages in chat UI when requests fail
   - Implement auto-scroll behavior to keep latest messages visible

3. **Backend Integration Pattern**
   - Call FastAPI chat endpoint (not OpenAI API directly) for LLM processing
   - Send requests with format: { conversation_id?, user_id, message }
   - Parse responses with format: { conversation_id, response, tool_calls? }
   - Manage conversation_id in component state for session continuity
   - Persist conversation_id in localStorage for session recovery
   - Handle backend errors gracefully with user-friendly messages

4. **Authentication Integration**
   - Retrieve JWT token from Better Auth session using useSession hook
   - Pass token in Authorization header for all API requests
   - Implement protected route patterns to require authentication
   - Handle auth errors (401/403) by redirecting to login page
   - Include user context (user_id) in chat requests for authorization

5. **User Experience Features**
   - Show typing indicators while waiting for assistant response
   - Display message timestamps in human-readable format
   - Add clear/reset conversation button to start fresh conversations
   - Implement copy message functionality for sharing responses
   - Ensure mobile responsiveness with proper touch interactions and viewport sizing

6. **State Management**
   - Use useState for messages array to track conversation history
   - Implement useEffect for auto-scroll when new messages arrive
   - Store conversation_id in localStorage or component state
   - Manage loading states (isLoading) during API calls
   - Track error states with error messages for display

7. **Production Deployment**
   - Configure Vercel deployment with proper build settings
   - Set up OpenAI domain allowlist for production domain (if using ChatKit features)
   - Add environment variables on Vercel dashboard (API_URL, auth secrets)
   - Configure CORS on FastAPI backend to allow frontend domain
   - Set up error monitoring with Sentry or similar service

## Example Structure

```typescript
// ============================================================================
// ChatKit Installation & Setup
// ============================================================================

// Install ChatKit
// npm install @openai/chatkit

// next.config.js - Next.js configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig

// .env.local - Environment variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_API_KEY=your-key-here  # For ChatKit features (optional)

// ============================================================================
// Type Definitions
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tool_calls?: any[];
}

interface ChatRequest {
  conversation_id?: string;
  user_id: number;
  message: string;
}

interface ChatResponse {
  conversation_id: string;
  response: string;
  tool_calls?: any[];
}

// ============================================================================
// Main Chat Component with ChatKit
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function ChatInterface() {
  // Authentication
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin');
    }
  }, [session, isPending, router]);

  // Load conversation from localStorage
  useEffect(() => {
    const savedConversationId = localStorage.getItem('conversation_id');
    if (savedConversationId) {
      setConversationId(savedConversationId);
      // Optionally load conversation history from backend
      loadConversationHistory(savedConversationId);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ============================================================================
  // Backend Integration - Send Message to FastAPI
  // ============================================================================

  const sendMessage = async (message: string) => {
    if (!message.trim() || !session?.user) return;

    setIsLoading(true);
    setError(null);

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Call FastAPI backend (not OpenAI directly)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_id: session.user.id,
          message: message,
        } as ChatRequest),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Auth error - redirect to login
          router.push('/signin');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();

      // Update conversation ID
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
        localStorage.setItem('conversation_id', data.conversation_id);
      }

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        tool_calls: data.tool_calls,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Load Conversation History (Optional)
  // ============================================================================

  const loadConversationHistory = async (convId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${convId}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error('Failed to load conversation history:', err);
    }
  };

  // ============================================================================
  // User Experience Features
  // ============================================================================

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem('conversation_id');
    setError(null);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Optionally show toast notification
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  // ============================================================================
  // Render Chat UI
  // ============================================================================

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
        <button
          onClick={clearConversation}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <div className="flex items-center justify-between mt-2 gap-2">
                <span
                  className={`text-xs ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </span>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                    title="Copy message"
                  >
                    📋 Copy
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputMessage);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Alternative: Using ChatKit Components (if available)
// ============================================================================

import { ChatWindow, Message as ChatKitMessage } from '@openai/chatkit';

export function ChatKitExample() {
  const [messages, setMessages] = useState<ChatKitMessage[]>([]);

  const handleSendMessage = async (message: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
    }]);

    // Call backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // Add assistant response
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.response,
    }]);
  };

  return (
    <ChatWindow
      messages={messages}
      onSendMessage={handleSendMessage}
      placeholder="Ask me anything..."
    />
  );
}

// ============================================================================
// Mobile Responsive Styles (Tailwind CSS)
// ============================================================================

// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'bounce-delay-100': 'bounce 1s infinite 0.1s',
        'bounce-delay-200': 'bounce 1s infinite 0.2s',
      },
    },
  },
}

// Mobile-specific styles
const mobileStyles = `
  @media (max-width: 640px) {
    .chat-container {
      height: 100vh;
      height: 100dvh; /* Dynamic viewport height for mobile */
    }

    .message-bubble {
      max-width: 85%; /* More space on mobile */
    }

    .input-area {
      padding: 0.75rem; /* Smaller padding on mobile */
    }
  }
`;

// ============================================================================
// Production Deployment Configuration
// ============================================================================

// vercel.json - Vercel deployment configuration
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_OPENAI_API_KEY": "@openai-key"
  }
}

// Environment variables on Vercel dashboard:
// NEXT_PUBLIC_API_URL=https://api.yourdomain.com
// NEXT_PUBLIC_OPENAI_API_KEY=your-production-key

// ============================================================================
// CORS Configuration on FastAPI Backend
// ============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://yourdomain.com",  # Production
        "https://www.yourdomain.com",  # Production with www
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

// ============================================================================
// Error Monitoring with Sentry (Optional)
// ============================================================================

// Install: npm install @sentry/nextjs

// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Wrap API calls with error tracking
const sendMessageWithTracking = async (message: string) => {
  try {
    return await sendMessage(message);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'chat',
        action: 'send_message',
      },
    });
    throw error;
  }
};

// ============================================================================
// Protected Route Pattern
// ============================================================================

// app/chat/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ChatInterface from '@/components/ChatInterface';

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect('/signin');
  }

  return <ChatInterface />;
}

// ============================================================================
// Session Persistence with localStorage
// ============================================================================

// Custom hook for conversation persistence
import { useState, useEffect } from 'react';

export function usePersistedConversation() {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('conversation_id');
    if (saved) {
      setConversationId(saved);
    }
  }, []);

  const updateConversationId = (id: string) => {
    setConversationId(id);
    localStorage.setItem('conversation_id', id);
  };

  const clearConversation = () => {
    setConversationId(null);
    localStorage.removeItem('conversation_id');
  };

  return {
    conversationId,
    updateConversationId,
    clearConversation,
  };
}
```

## Key Patterns Summary

**Backend Integration (FastAPI, not OpenAI):**
```typescript
const response = await fetch(`${API_URL}/api/chat`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    conversation_id: conversationId,
    user_id: userId,
    message: message
  })
});
```

**Authentication with Better Auth:**
```typescript
const { data: session } = useSession();

// Redirect if not authenticated
if (!session) {
  router.push('/signin');
}

// Use token in requests
headers: { 'Authorization': `Bearer ${session.user.token}` }
```

**State Management:**
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [conversationId, setConversationId] = useState<string | null>(null);

// Auto-scroll on new messages
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

**Message Display:**
```typescript
{messages.map((message) => (
  <div className={message.role === 'user' ? 'justify-end' : 'justify-start'}>
    <div className={message.role === 'user' ? 'bg-blue-500' : 'bg-white'}>
      {message.content}
    </div>
  </div>
))}
```

**Loading Indicator:**
```typescript
{isLoading && (
  <div className="flex space-x-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
  </div>
)}
```

**Important Note:**
ChatKit is the UI component library. The actual LLM processing (with Groq) happens in your FastAPI backend. The frontend only handles display and user interaction.
