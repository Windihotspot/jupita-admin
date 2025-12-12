import { defineStore } from 'pinia'
import ApiService from '@/services/api' // your api.ts file

interface User {
  id: number
  fullname: string | null
  firstname: string
  lastname: string
  email: string
  phone: string
  avatar: string | null
  status: string | null
  email_verified_at: string | null
  phone_verified_at: string | null
  last_login_at: string | null
  last_logout_at: string | null
  last_activity_at: string | null
  role_id: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

interface AuthResponse {
  user: User
  token: string
  tenants: number
  active_tenants: number
  inactive_tenants: number
  analysis: any[]
  loans: any[]
  id_verification: any[]
  credit_history: any[]
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
    tenants: 0,
    active_tenants: 0,
    inactive_tenants: 0,
    analysis: [] as any[],
    loans: [] as any[],
    id_verification: [] as any[],
    credit_history: [] as any[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user
  },

  actions: {
    // --- LOGIN ---
    async login(payload: { email: string; password: string }) {
      this.loading = true
      this.error = null

      try {
        const response = await ApiService.post('/login', payload)

        console.log('🔥 LOGIN API RAW RESPONSE:', response)

        const res = response.data // <-- FIX

        console.log('🔥 CLEANED RES.DATA:', res)

        // Now set store state
        this.user = res.user
        this.token = res.token

        this.tenants = res.tenants
        this.active_tenants = res.active_tenants
        this.inactive_tenants = res.inactive_tenants

        this.analysis = res.analysis ?? []
        this.loans = res.loans ?? []
        this.id_verification = res.id_verification ?? []
        this.credit_history = res.credit_history ?? []

        console.log('🔥 STORE AFTER LOGIN:', this.$state)

        // Persist in local storage
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        localStorage.setItem('auth_data', JSON.stringify(res))

        return true
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },

    // --- LOGOUT ---
    logout() {
      this.user = null
      this.token = null

      this.tenants = 0
      this.active_tenants = 0
      this.inactive_tenants = 0

      this.analysis = []
      this.loans = []
      this.id_verification = []
      this.credit_history = []

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth_data')
    },

    // --- RESTORE USER FROM STORAGE (on page refresh) ---
    hydrate() {
      const stored = localStorage.getItem('auth_data')
      if (stored) {
        const data = JSON.parse(stored)

        this.user = data.user
        this.token = data.token

        this.tenants = data.tenants
        this.active_tenants = data.active_tenants
        this.inactive_tenants = data.inactive_tenants

        this.analysis = data.analysis
        this.loans = data.loans
        this.id_verification = data.id_verification
        this.credit_history = data.credit_history
      }
    }
  }
})
