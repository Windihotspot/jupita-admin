import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DasboardView.vue'
import LoginView from '@/views/LoginView.vue'
import TenantsView from '@/views/TenantsView.vue'
import SettingsView from '@/views/SettingsView.vue'

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
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    
  ]
})

export default router
