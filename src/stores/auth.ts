import { defineStore } from 'pinia'
import ApiService from '@/services/api'

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

// Define the shape of stats per tenant
interface TenantStats {
  periculum_analysis?: number
  loan?: number
  id_verification?: number
  credit_history?: number
}

interface StatsMap {
  [tenantName: string]: TenantStats
}

interface AuthResponse {
  user: User
  token: string
  tenants: number
  active_tenants: number
  inactive_tenants: number
  stats: StatsMap
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
    tenants: 0,
    active_tenants: 0,
    inactive_tenants: 0,
    stats: {} as StatsMap, // raw stats per tenant
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
      console.log('login payload:', payload)
      try {
        const response = await ApiService.post('/login', payload)
        const res: AuthResponse = response.data
        console.log('login response:', response)
        // Set store state
        this.user = res.user
        this.token = res.token

        this.tenants = res.tenants
        this.active_tenants = res.active_tenants
        this.inactive_tenants = res.inactive_tenants

        this.stats = res.stats || {}

        // Persist everything
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        localStorage.setItem(
          'auth_data',
          JSON.stringify({
            user: res.user,
            token: res.token,
            tenants: res.tenants,
            active_tenants: res.active_tenants,
            inactive_tenants: res.inactive_tenants,
            stats: res.stats || {}
          })
        )

        return true
      } catch (err: any) {
        console.log("login error:", err.response?.data?.data?.message)
        this.error = err.response?.data?.data?.message || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },
    async fetchUser() {
      if (!this.token || !this.user?.id) return

      this.loading = true
      this.error = null

      try {
        const response = await ApiService.get('/get-specified-admin', {
          params: {
            admin_id: this.user.id
          },
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        console.log('admin data response:', response)

        // depending on your API shape
        this.user = response.data.admin

        // persist updated user
        localStorage.setItem(
          'auth_data',
          JSON.stringify({
            user: this.user,
            token: this.token,
            tenants: this.tenants,
            active_tenants: this.active_tenants,
            inactive_tenants: this.inactive_tenants,
            stats: this.stats
          })
        )

        return this.user
      } catch (err: any) {
        console.error('Failed to fetch user:', err)
        this.error = err.response?.data?.message || 'Failed to refresh user'
        return null
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
      this.stats = {}

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth_data')
    },

    // --- RESTORE USER FROM STORAGE ---
    hydrate() {
      const stored = localStorage.getItem('auth_data')
      if (!stored) return

      const data = JSON.parse(stored)
      this.user = data.user
      this.token = data.token
      this.tenants = data.tenants
      this.active_tenants = data.active_tenants
      this.inactive_tenants = data.inactive_tenants
      this.stats = data.stats || {}
    }
  }
})
