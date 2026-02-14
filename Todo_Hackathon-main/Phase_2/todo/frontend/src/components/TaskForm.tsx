'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    setMounted(true);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 500) {
      setError('Title must be 500 characters or less');
      return;
    }

    if (description.length > 5000) {
      setError('Description must be 5000 characters or less');
      return;
    }

    setLoading(true);

    try {
      const data: TaskCreate | TaskUpdate = {
        title: title.trim(),
        description: description.trim() || null,
      };

      await onSubmit(data);

      // Reset form
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onCancel}
    >
      <div
        className={`card-glow max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-500 ${
          mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              <span className="gradient-text">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </span>
            </h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg border border-primary-700/50 text-dark-300 hover:bg-primary-900/30 hover:border-accent-500 hover:text-accent-400 transition-all duration-300"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-dark-200 mb-2">
                Title <span className="text-accent-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-glow"
                placeholder="Enter task title"
                maxLength={500}
                required
                autoFocus
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-dark-400">
                  {title.length}/500 characters
                </p>
                {title.length > 450 && (
                  <p className="text-xs text-accent-400">
                    {500 - title.length} characters remaining
                  </p>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-dark-200 mb-2">
                Description <span className="text-dark-500">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-glow resize-none"
                placeholder="Enter task description"
                rows={4}
                maxLength={5000}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-dark-400">
                  {description.length}/5000 characters
                </p>
                {description.length > 4500 && (
                  <p className="text-xs text-accent-400">
                    {5000 - description.length} characters remaining
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-glow py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  isEditing ? 'Update Task' : 'Create Task'
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 rounded-lg border-2 border-primary-700 text-dark-100 font-semibold hover:bg-primary-900/30 hover:border-accent-500 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-700/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
}
