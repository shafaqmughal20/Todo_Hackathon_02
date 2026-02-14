import { apiClient } from '@/lib/api';
import { authService } from './auth';
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';

class TaskService {
  private getToken(): string {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return token;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const token = this.getToken();
      return await apiClient.get<Task[]>(
        `/api/tasks`,
        token
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch tasks');
    }
  }

  async getTask(taskId: number): Promise<Task> {
    try {
      const token = this.getToken();
      return await apiClient.get<Task>(
        `/api/tasks/${taskId}`,
        token
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch task');
    }
  }

  async createTask(data: TaskCreate): Promise<Task> {
    try {
      const token = this.getToken();
      return await apiClient.post<Task>(
        `/api/tasks`,
        data,
        token
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create task');
    }
  }

  async updateTask(taskId: number, data: TaskUpdate): Promise<Task> {
    try {
      const token = this.getToken();
      return await apiClient.put<Task>(
        `/api/tasks/${taskId}`,
        data,
        token
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update task');
    }
  }

  async deleteTask(taskId: number): Promise<void> {
    try {
      const token = this.getToken();
      await apiClient.delete(
        `/api/tasks/${taskId}`,
        token
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to delete task');
    }
  }

  async toggleComplete(taskId: number): Promise<Task> {
    try {
      const token = this.getToken();
      return await apiClient.patch<Task>(
        `/api/tasks/${taskId}/toggle`,
        {},
        token
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to toggle task completion');
    }
  }
}

export const taskService = new TaskService();
