<script setup>
import { ref, computed } from 'vue'
import sidebarItems from './sidebarItem'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
const route = useRoute()
const router = useRouter()
// Function to check if the current route is active
const isActive = (path) => {
  return route.path === path
}
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const token = computed(() => authStore.token)
const tenantId = computed(() => authStore.tenant_id)

const sidebarMenu = ref(sidebarItems)
const logout = async () => {
  const savedAuth = JSON.parse(localStorage.getItem('data') || '{}')
  const token = savedAuth?.token || authStore.token
  const tenantId = savedAuth?.user?.tenant_id || authStore.tenant_id

  try {
    const response = await axios.post(
      `https://dev02201.getjupita.com/api/${tenantId}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    // Handle the successful logout
    console.log('Logged out successfully:', response.data)

    // Redirect to login page or any other page
    router.push('/')
  } catch (error) {
    // Handle errors
    errorMessage.value = error.response?.data?.message || error.message
    console.error('Logout failed:', errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="h-full flex flex-col justify-between">

    <!-- Logo -->
    <div class="p-2">
      <img src="/src/assets/jupita-white-logo.png" alt="" />
    </div>

    <!-- Menu -->
    <div class="flex-grow m-2">
      <div class="px-4">
        <div
          v-for="(item, i) in sidebarMenu"
          :key="i"
          @click="router.push(item.path)"
          class="sidebar-item mb-3 cursor-pointer px-4 py-3 rounded-lg flex items-center relative transition"
          :class="{ active: isActive(item.path) }"
        >
          <!-- Icon -->
         <img
  :src="isActive(item.path) ? item.activeIcon : item.icon"
  class="w-5 h-5 object-contain"
/>



          <!-- Title -->
          <span class="ml-3 font-medium text-sm">
            {{ item.title }}
          </span>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <!-- <div class="p-4">
      <div
        @click="logout"
        class="sidebar-item cursor-pointer px-4 py-3 rounded-lg flex items-center transition"
      >
        <i class="fas fa-sign-out-alt text-lg"></i>
        <span class="ml-3 font-medium text-sm">Logout</span>
      </div>
    </div> -->

  </div>
</template>

<style scoped>
.sidebar-item {
  color: white;
}

/* Active state (white pill + blue icon/text) */
.sidebar-item.active {
  background: white;
}

.sidebar-item.active i,
.sidebar-item.active span {
  color: #1f5aa3 !important;
  font-weight: 600;
}

/* Default icon/text */
.sidebar-item i,
.sidebar-item span {
  color: white;
  transition: 0.25s;
}

/* Vertical bar */
.sidebar-item.active::after {
  content: "";
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 40px;
  background: white;
  border-radius: 4px;
}
</style>
