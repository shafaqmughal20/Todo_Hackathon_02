'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { chatService, type Message } from '@/services/chat';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/signin');
    }
  }, [router]);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        // Get the most recent conversation
        const conversations = await chatService.getConversations();
        if (conversations.length > 0) {
          const latestConversation = conversations[0];
          setConversationId(latestConversation.id);

          // Load messages from the conversation
          const conversationMessages = await chatService.getConversationMessages(
            latestConversation.id
          );

          // Format messages for display
          const formattedMessages: Message[] = conversationMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          }));

          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error('Failed to load conversation history:', err);
        // Don't show error to user, just start fresh
      }
    };

    if (authService.isAuthenticated()) {
      loadConversationHistory();
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to UI (optimistic)
    const optimisticMessage: Message = {
      role: 'user',
      content: userMessage,
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setLoading(true);

    try {
      // Send message to API
      const response = await chatService.sendMessage({
        conversation_id: conversationId,
        message: userMessage,
      });

      // Update conversation ID if new
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add assistant response to UI
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    authService.signout();
    router.push('/signin');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            AI Chat Assistant
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleGoToDashboard}
              className="px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-6xl">💬</div>
                <h2 className="text-2xl font-semibold text-purple-300">
                  Start a conversation
                </h2>
                <p className="text-gray-400 max-w-md">
                  Ask me to add, list, complete, update, or delete your tasks.
                  I'm here to help you manage your todos!
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Try: "Add a task to buy groceries"</p>
                  <p>Or: "Show me my tasks"</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-800/80 text-gray-100 border border-purple-500/20'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-800/80 border border-purple-500/20">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="w-full px-6 py-4 bg-gray-800/80 border border-purple-500/30 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed pr-14"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
