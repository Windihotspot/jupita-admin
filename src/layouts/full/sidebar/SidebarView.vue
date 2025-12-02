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
  <div class="side-bar bg-[#1e57a8]   d-flex flex-column h-full justify-between overflow-hidden">
    <!-- Logo part -->
    <!-- <div class="logo pa-4">
      <img src="/src/assets/images/white.png" class="" />
    </div> -->

    <!-- Navigation -->
    <div class="flex-grow mt-4">
      <v-list class="pa-4">
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <v-list-item
            @click="router.push(item.path)"
            class="mb-4 pr-4 custom-btn no-uppercase relative"
            size="small"
            rounded="lg"
            block
            :class="{ 'custom-active': isActive(item.path) }"
          >
            <div class="flex items-center w-full">
              <v-icon left>{{ item.icon }}</v-icon>
              <span class="menu-item ml-4" v-text="item.title"></span>
            </div>

            <!-- Active bar INSIDE the v-list-item -->
          </v-list-item>
          <!-- <div v-if="isActive(item.path)" class="active-bar"></div> -->
        </template>
      </v-list>
    </div>

    <!-- Footer Logout -->
    <!-- <div class="pa-4">
      <v-list-item @click="logout" class="custom-btn logout-btn" rounded="lg" block>
        <v-icon class="text-lg" left>
          <i class="fas fa-sign-out-alt"></i>
        </v-icon>
        <span class="menu-item ml-4">Logout</span>
      </v-list-item>
    </div> -->
  </div>
</template>

<style scoped>

.side-bar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.logout-btn:hover {
  background-color: #ffecec;
}

.logo {
  width: 50%;
}
.menu-item {
  font-size: 36px;
  text-transform: none;
  color: #1e1e1e;
}

.custom-btn:hover {
  background-color: #e8f0fe;
}

.custom-btn {
  text-align: left;
  justify-content: flex-start;
  transition: background-color 0.2s ease;
}
.custom-btn .v-icon {
  margin-right: 8px;
  color: #1e1e1e;
}
.custom-btn .menu-item {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Helvetica,
    Arial,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 28px;
}
.custom-link {
  text-decoration: none; /* Remove underline from Link */
}

.custom-active {
  color: #1f5aa3 !important; /* Active state color */
  background-color: rgba(0, 0, 255, 0.1); /* Light blue background */

  border-radius: 12px;
}

.custom-active .menu-item {
  color: #1f5aa3 !important;
}

.custom-active .v-icon {
  color: #1f5aa3 !important;
}
.active-bar {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 4px;
  height: 40px; /* Adjust to match your button height */
  background-color: #1f5aa3;
  border-radius: 8px;
}
</style>
