'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import { taskService } from '@/services/tasks';
import { authService } from '@/services/auth';
import { chatService, type Message } from '@/services/chat';
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = authService.getCurrentUser();

  useEffect(() => { setMounted(true); loadTasks(); }, []);
  useEffect(() => { if (chatOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatOpen]);

  const loadTasks = async () => {
    try { setLoading(true); setError(''); const fetchedTasks = await taskService.getTasks(); setTasks(fetchedTasks); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (data: TaskCreate) => { const newTask = await taskService.createTask(data); setTasks([newTask, ...tasks]); setShowForm(false); };
  const handleUpdateTask = async (data: TaskUpdate) => { if (!editingTask) return; const updatedTask = await taskService.updateTask(editingTask.id, data); setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t)); setEditingTask(null); setShowForm(false); };
  const handleToggleComplete = async (taskId: number) => { try { const updatedTask = await taskService.toggleComplete(taskId); setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t)); } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update task'); } };
  const handleDeleteTask = async (taskId: number) => { try { await taskService.deleteTask(taskId); setTasks(tasks.filter(t => t.id !== taskId)); } catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete task'); } };
  const handleSignout = () => { authService.signout(); router.push('/'); };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput(''); setChatError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    try {
      const response = await chatService.sendMessage({ conversation_id: conversationId, message: userMessage });
      if (!conversationId) setConversationId(response.conversation_id);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      loadTasks();
    } catch (err) { setChatError(err instanceof Error ? err.message : 'Failed to send message'); setMessages(prev => prev.slice(0, -1)); }
    finally { setChatLoading(false); }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        <nav className="relative z-10 border-b border-primary-700/30 backdrop-blur-sm bg-dark-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-purple flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h1 className="text-xl font-bold gradient-text">TaskFlow</h1>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setChatOpen(!chatOpen)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  AI Chat
                </button>
                <button onClick={handleSignout} className="px-4 py-2 rounded-lg border border-primary-700 text-dark-100 font-semibold hover:bg-primary-900/30 transition-all">Sign Out</button>
              </div>
            </div>
          </div>
        </nav>
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold mb-2"><span className="gradient-text">My Tasks</span></h2>
                <p className="text-dark-300">{totalCount === 0 ? 'No tasks yet!' : `${completedCount} of ${totalCount} tasks completed`}</p>
              </div>
              <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="btn-glow flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Task
              </button>
            </div>
          </div>
          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">{error}</div>}
          <TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onEdit={(task) => { setEditingTask(task); setShowForm(true); }} onDelete={handleDeleteTask} loading={loading} />
        </main>
        {showForm && <TaskForm task={editingTask} onSubmit={async (data: any) => { if (editingTask) { await handleUpdateTask(data); } else { await handleCreateTask(data); } }} onCancel={() => { setShowForm(false); setEditingTask(null); }} />}

        {/* Floating Chat Button */}
        <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all">
          {chatOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
        </button>

        {/* Chat Panel */}
        {chatOpen && (
          <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl shadow-2xl border border-purple-500/30 bg-gray-900/95 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600/90 to-pink-600/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div><p className="text-white text-sm font-semibold">AI Assistant</p><p className="text-white/70 text-xs">Powered by Groq</p></div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="text-4xl">🤖</div>
                  <p className="text-gray-300 text-sm font-medium">How can I help you?</p>
                  <div className="space-y-1 text-xs text-gray-500"><p>• "Add task: Buy groceries"</p><p>• "Show my tasks"</p><p>• "Mark task 1 as done"</p></div>
                </div>
              ) : (
                <>{messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-100 border border-purple-500/20'}`}>{msg.content}</div>
                  </div>
                ))}
                {chatLoading && <div className="flex justify-start"><div className="bg-gray-800 border border-purple-500/20 rounded-2xl px-3 py-2"><div className="flex space-x-1"><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div></div></div></div>}
                <div ref={messagesEndRef} /></>
              )}
            </div>
            {chatError && <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs">{chatError}</div>}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-purple-500/20 bg-gray-900/50">
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask me anything..." disabled={chatLoading} className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50" />
                <button type="submit" disabled={!chatInput.trim() || chatLoading} className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
