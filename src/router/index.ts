import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DasboardView.vue'
import LoginView from '@/views/LoginView.vue'

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
    
  ]
})

export default router
