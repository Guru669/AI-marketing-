const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
}

export const authService = {
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/user-auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/user-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/user-auth/logout`, {
      method: 'POST',
    });
  },

  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  clearUser(): void {
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  },
};