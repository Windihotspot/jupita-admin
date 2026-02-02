<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/api'
const router = useRouter()
const auth = useAuthStore()

const menuOpen = ref(false)
const goToProfile = () => {
    menuOpen.value = false
  router.push({
    path: '/settings',
    query: {
      tab: 'account',
      section: 'profile'
    }
  })
}


// const logout = async () => {
//   await auth.logout()
//   router.push('/login')
// }

const logout = async () => {
  try {
    console.log('token:', auth.token)
    const response = await ApiService.post('/admin-logout', {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    console.log('Logged out successfully:', response.data)

  
    router.push('/')
  } catch (error) {
    console.log('Logout failed:', error.response.data.data)
  }
}
</script>

<template>
  <div class="header px-8 py-4 bg-white">
    <v-menu v-model="menuOpen" offset-y>
      <!-- Activator -->
      <template #activator="{ props }">
        <div
          v-bind="props"
          class="flex items-center px-3 py-2 cursor-pointer hover:bg-blue-50 rounded-lg"
        >
          <img
            src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460"
            class="w-8 h-8 rounded-full object-cover"
          />

          <span class="ml-2 text-sm font-medium text-gray-700 max-w-[80px] truncate">
            {{ auth.user.firstname }}
          </span>

          <v-icon
            size="18"
            class="ml-1 transition-transform duration-200"
            :class="{ 'rotate-180': menuOpen }"
          >
            mdi-chevron-down
          </v-icon>
        </div>
      </template>

      <!-- Dropdown -->
      <v-list density="compact">
        <v-list-item @click="goToProfile" prepend-icon="mdi-account-circle">
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-divider />

        <v-list-item @click="logout" prepend-icon="mdi-logout" class="text-red-600">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
