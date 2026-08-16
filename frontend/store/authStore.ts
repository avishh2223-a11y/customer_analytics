import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  token: string
  loginAt: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  setAuthenticated: (isAuth: boolean, user?: User | null) => void
}

// Mock user credentials for demo
const DEMO_EMAIL = 'demo@example.com'
const DEMO_PASSWORD = 'password123'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock authentication
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          const mockUser: User = {
            id: 'user_001',
            email,
            name: 'Demo User',
            token: `mock_jwt_${Date.now()}`,
            loginAt: Date.now(),
          }
          set({ user: mockUser, isAuthenticated: true, isLoading: false })
          
          // Set auth cookie for middleware
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${mockUser.token}; path=/; max-age=604800`
          }
        } else {
          set({
            error: 'Invalid email or password. Try demo@example.com / password123',
            isLoading: false,
          })
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null })
        // Clear auth cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-token=; path=/; max-age=0'
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setAuthenticated: (isAuth: boolean, user: User | null = null) => {
        set({ isAuthenticated: isAuth, user })
        if (isAuth && user) {
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${user.token}; path=/; max-age=604800`
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
