'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import { taskService } from '@/services/tasks';
import { authService } from '@/services/auth';
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    setMounted(true);
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskCreate) => {
    try {
      const newTask = await taskService.createTask(data);
      setTasks([newTask, ...tasks]);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateTask = async (data: TaskUpdate) => {
    if (!editingTask) return;

    try {
      const updatedTask = await taskService.updateTask(editingTask.id, data);
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditingTask(null);
      setShowForm(false);
    } catch (err) {
      throw err;
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleSignout = () => {
    authService.signout();
    router.push('/');
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Top Navigation Bar */}
        <nav className="relative z-10 border-b border-primary-700/30 backdrop-blur-sm bg-dark-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo/Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-purple flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold gradient-text">TaskFlow</h1>
              </div>

              {/* User Info & Actions */}
              <div className="flex items-center gap-4">
                {user && (
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800/50 border border-primary-700/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-dark-200 text-sm">{user.email}</span>
                  </div>
                )}
                <button
                  onClick={handleSignout}
                  className="px-4 py-2 rounded-lg border border-primary-700 text-dark-100 font-semibold hover:bg-primary-900/30 hover:border-accent-500 transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className={`mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">My Tasks</span>
                </h2>
                <p className="text-dark-300">
                  {totalCount === 0 ? 'No tasks yet. Create your first task!' : `${completedCount} of ${totalCount} tasks completed`}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
                className="btn-glow flex items-center gap-2 justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>

            {/* Stats Cards */}
            {totalCount > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="card-glow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-700/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-400 text-sm">Total Tasks</p>
                      <p className="text-2xl font-bold text-dark-100">{totalCount}</p>
                    </div>
                  </div>
                </div>

                <div className="card-glow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-accent-700/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-400 text-sm">Completed</p>
                      <p className="text-2xl font-bold text-dark-100">{completedCount}</p>
                    </div>
                  </div>
                </div>

                <div className="card-glow p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-700/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-400 text-sm">In Progress</p>
                      <p className="text-2xl font-bold text-dark-100">{totalCount - completedCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Task List */}
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            loading={loading}
          />
        </main>

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={async (data: TaskCreate | TaskUpdate) => {
              if (editingTask) {
                await handleUpdateTask(data as TaskUpdate);
              } else {
                await handleCreateTask(data as TaskCreate);
              }
            }}
            onCancel={handleCancelForm}
          />
        )}
      </div>
    </AuthGuard>
  );
}
