'use client';

import { useState } from 'react';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleComplete(task.id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`card-glow p-5 transition-all duration-300 ${
      task.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start gap-4">
        {/* Completion checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="mt-1 flex-shrink-0 group"
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
            task.completed
              ? 'bg-gradient-purple border-accent-500 shadow-glow-sm'
              : 'border-primary-700 hover:border-accent-500 hover:shadow-glow-sm group-hover:scale-110'
          } ${isToggling ? 'opacity-50 animate-pulse' : ''}`}>
            {task.completed && (
              <svg className="w-4 h-4 text-white animate-in fade-in zoom-in duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold transition-all duration-300 ${
            task.completed
              ? 'line-through text-dark-400'
              : 'text-dark-100'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-2 text-sm transition-all duration-300 ${
              task.completed
                ? 'line-through text-dark-500'
                : 'text-dark-300'
            }`}>
              {task.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-dark-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.updated_at !== task.created_at && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {new Date(task.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg border border-primary-700/50 text-primary-400 hover:bg-primary-900/30 hover:border-primary-500 hover:text-primary-300 transition-all duration-300 hover:shadow-indigo-glow"
            aria-label="Edit task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg border border-red-700/50 text-red-400 hover:bg-red-900/30 hover:border-red-500 hover:text-red-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete task"
          >
            {isDeleting ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Completion indicator */}
      {task.completed && (
        <div className="mt-3 pt-3 border-t border-accent-500/30">
          <div className="flex items-center gap-2 text-xs text-accent-400">
            <svg className="w-4 h-4 pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Task completed</span>
          </div>
        </div>
      )}
    </div>
  );
}
