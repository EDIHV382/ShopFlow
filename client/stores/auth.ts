// Auth store — manages JWT token, user state, login/logout/register
import { defineStore } from 'pinia';
import type { User, AuthResponse } from '~/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    isAdmin: (state): boolean => state.user?.roles.includes('ROLE_ADMIN') ?? false,
    userName: (state): string => state.user?.name ?? '',
  },

  actions: {
    /** Initialize from localStorage on app load */
    init() {
      if (process.client) {
        const stored = localStorage.getItem('shopflow_token');
        const user = localStorage.getItem('shopflow_user');
        if (stored && user) {
          this.token = stored;
          try {
            this.user = JSON.parse(user);
          } catch {
            this.clear();
          }
        }
      }
    },

    setAuth(data: AuthResponse) {
      this.token = data.token;
      this.user = data.user;
      if (process.client) {
        localStorage.setItem('shopflow_token', data.token);
        localStorage.setItem('shopflow_user', JSON.stringify(data.user));
      }
    },

    async login(email: string, password: string) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const data = await $fetch<AuthResponse>(`${config.public.apiBase}/api/auth/login`, {
          method: 'POST',
          body: { email, password },
        });
        this.setAuth(data);
        return data;
      } finally {
        this.loading = false;
      }
    },

    async register(name: string, email: string, password: string) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const data = await $fetch<AuthResponse>(`${config.public.apiBase}/api/auth/register`, {
          method: 'POST',
          body: { name, email, password },
        });
        this.setAuth(data);
        return data;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        if (this.token) {
          const config = useRuntimeConfig();
          await $fetch(`${config.public.apiBase}/api/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.token}` },
          });
        }
      } catch {
        // Ignore logout errors — clear anyway
      } finally {
        this.clear();
      }
    },

    clear() {
      this.user = null;
      this.token = null;
      if (process.client) {
        localStorage.removeItem('shopflow_token');
        localStorage.removeItem('shopflow_user');
      }
    },
  },
});
