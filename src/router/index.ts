import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DasboardView.vue'
import LoginView from '@/views/LoginView.vue'
import TenantsView from '@/views/TenantsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import TenantsDetails from '@/views/TenantsDetails.vue'
import ProductDetails from '@/views/ProductDetails.vue'
import AccountsView from '@/views/AccountsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/tenants',
      name: 'tenants',
      component: TenantsView
    },
    {
      path: '/tenants-details/:tenantId',
      name: 'tenants-details',
      component: TenantsDetails,
      props: true // <-- enables passing tenantId as a prop
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/settings/products/:slug',
      name: 'product-details',
      component: ProductDetails,
      props: true
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsView,
      props: true
    }
  ]
})

export default router
