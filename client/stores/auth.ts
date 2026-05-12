// Auth store — manages JWT token, user state, login/logout/register
import { defineStore } from 'pinia'
import type { User, AuthResponse } from '~/types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
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
    /** Initialize from cookies on app load */
    async init() {
      if (process.client) {
        try {
          const config = useRuntimeConfig()
          const baseUrl = process.env.NODE_ENV === 'production' ? '' : config.public.apiBase
          const data = await $fetch<AuthResponse>(`${baseUrl}/api/auth/me`)
          this.user = data.user
          this.token = 'cookie-auth' // Token is managed by HttpOnly cookie
        } catch {
          this.clear()
        }
      }
    },

    setAuth(data: AuthResponse) {
      this.user = data.user
      this.token = 'cookie-auth' // Token is managed by HttpOnly cookie
    },

    async login(email: string, password: string) {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const baseUrl = process.env.NODE_ENV === 'production' ? '' : config.public.apiBase
        const data = await $fetch<AuthResponse>(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          body: { email, password },
        })
        this.setAuth(data)
        return data
      } finally {
        this.loading = false
      }
    },

    async register(name: string, email: string, password: string) {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const baseUrl = process.env.NODE_ENV === 'production' ? '' : config.public.apiBase
        const data = await $fetch<AuthResponse>(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          body: { name, email, password },
        })
        this.setAuth(data)
        return data
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        const config = useRuntimeConfig()
        const baseUrl = process.env.NODE_ENV === 'production' ? '' : config.public.apiBase
        await $fetch(`${baseUrl}/api/auth/logout`, {
          method: 'POST',
        })
      } catch {
        // Ignore logout errors — clear anyway
      } finally {
        this.clear()
      }
    },

    clear() {
      this.user = null
      this.token = null
      // No need to clear localStorage as we're using HttpOnly cookies
    },
  },
})
