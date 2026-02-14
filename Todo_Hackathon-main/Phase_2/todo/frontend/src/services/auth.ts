import { apiClient } from '@/lib/api';
import { tokenStorage, userStorage } from '@/lib/auth';
import type { SignupRequest, SigninRequest, AuthResponse, User } from '@/types/user';

class AuthService {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>('/api/auth/signup', data);

      // Store token and user data (backend returns access_token, not token)
      tokenStorage.setToken(response.access_token);
      userStorage.setUser(response.user);

      return {
        token: response.access_token,
        user: response.user
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Signup failed');
    }
  }

  async signin(data: SigninRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>('/api/auth/signin', data);

      // Store token and user data (backend returns access_token, not token)
      tokenStorage.setToken(response.access_token);
      userStorage.setUser(response.user);

      return {
        token: response.access_token,
        user: response.user
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Signin failed');
    }
  }

  signout(): void {
    tokenStorage.removeToken();
    userStorage.removeUser();
  }

  getCurrentUser(): User | null {
    return userStorage.getUser();
  }

  getToken(): string | null {
    return tokenStorage.getToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
