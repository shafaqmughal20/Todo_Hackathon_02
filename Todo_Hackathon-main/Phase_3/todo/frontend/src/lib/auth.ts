// Better Auth configuration for Next.js
// This will be used for JWT token management and session handling

interface AuthConfig {
  secret: string;
  url: string;
}

const config: AuthConfig = {
  secret: process.env.BETTER_AUTH_SECRET || '',
  url: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
};

// Token storage utilities
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },
};

// User storage utilities
export const userStorage = {
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_user');
  },
};

export const authConfig = config;
