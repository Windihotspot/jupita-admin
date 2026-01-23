<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()

// Reactive variable to handle loading state
</script>

<template>
  <div class="header items-center px-8 py-4 bg-white">
     
      <div
        class="flex items-center bg-white px-3 py-2 cursor-pointer"
      >
        <!-- Avatar -->
        <img
          src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460"
          class="w-8 h-8 rounded-full object-cover"
        />

        <!-- Name -->
        <span class="ml-2 text-sm font-medium text-gray-700 max-w-[80px] truncate">
          {{ auth.user.firstname }} 
        </span>

        
      </div>

     
   
  </div>
</template>

<style scoped>
v-btn {
  text-transform: none;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icons-container {
  display: flex;
  justify-content: flex-end;
  flex-grow: 1;
}

.search {
  flex-grow: 0;
}
</style>
