'use client';

import TaskItem from './TaskItem';
import type { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => Promise<void>;
  loading?: boolean;
}

export default function TaskList({ tasks, onToggleComplete, onEdit, onDelete, loading }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary-700/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-accent-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-dark-300 text-lg">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="card-glow p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-purple flex items-center justify-center">
          <svg className="w-12 h-12 text-white pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-dark-100 mb-2">
          No tasks yet
        </h3>
        <p className="text-dark-300">
          Create your first task to get started on your journey!
        </p>
      </div>
    );
  }

  // Separate completed and incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-8">
      {/* Incomplete tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-700/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dark-100">
              Active Tasks
              <span className="ml-2 text-sm font-normal text-dark-400">({incompleteTasks.length})</span>
            </h2>
          </div>
          <div className="grid gap-4">
            {incompleteTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-700/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dark-100">
              Completed Tasks
              <span className="ml-2 text-sm font-normal text-dark-400">({completedTasks.length})</span>
            </h2>
          </div>
          <div className="grid gap-4">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
