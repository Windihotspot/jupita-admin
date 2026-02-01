import { defineStore } from 'pinia'
import ApiService from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    features: [],
    loading: false,
    error: null
  }),

  getters: {
    getById: (state) => (id) => state.products.find((p) => String(p.id) === String(id)),

    /**
     * 🔑 Build a backend-safe product map dynamically
     */
    featureProductMap: (state) => {
      const map = {}

      state.products.forEach((product) => {
        const determinants = product.price_determinants || {}

        Object.keys(determinants).forEach((key) => {
          // NORMALIZATION RULES
          if (key.startsWith('crc_')) map[key] = 'crc'
          else if (key.startsWith('fccb_')) map[key] = 'fccb'
          else if (key.startsWith('credit_registry_')) map[key] = 'credit_registry'
          else if (key.includes('periculum_bank_statement_analysis'))
            map[key] = 'periculum_bank_statement_analysis'
          else if (key.includes('mono_bank_statement_analysis'))
            map[key] = 'mono_bank_statement_analysis'
          else if (key.includes('offer')) map[key] = 'offer_recommendation'
          else if (key.includes('smile')) map[key] = 'smile_id_verification'
          else if (key.includes('zeeh')) map[key] = 'zeeh_africa_id_verification'
          else if (product.name === 'Loan Origination') map[key] = 'loan_origination'
        })
      })

      return map
    }
  },
  actions: {
    async fetchProducts() {
      const auth = useAuthStore()
      this.loading = true
      this.error = null

      try {
        const res = await ApiService.get('/get-products', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })

        const rawProducts = res.data?.products || res.data || []

        this.products = rawProducts.map((product) => ({
          ...product,
          global: product.global_status === 'active'
        }))
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load products'
        throw err
      } finally {
        this.loading = false
      }
    },

    updateProductStatus(productId, newStatus) {
      const product = this.getById(productId)
      if (product) {
        product.global_status = newStatus
        product.global = newStatus === 'active'
      }
    },
    async fetchFeatures() {
      const auth = useAuthStore()
      this.loading = true
      this.error = null

      try {
        const res = await ApiService.get('/get-features', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
        console.log("global features:", res)
        if (res.data?.status === 'success') {
          // assign features from backend
          this.features = res.data.data.features.map((f) => ({
            ...f,
            enabled: f.global_status === 'active' // add computed enabled
          }))
        } else {
          this.error = res.data?.message || 'Failed to fetch features'
        }
      } catch (err) {
        console.log('Error fetching features:', err)
        this.error = err.response?.data?.message || 'Failed to fetch features'
      } finally {
        this.loading = false
      }
    }
  }
})
