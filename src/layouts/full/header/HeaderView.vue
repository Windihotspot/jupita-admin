<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// Reactive variable to handle loading state
</script>

<template>
  <div class="header items-center px-4 py-4 bg-white">
    <!-- Icons (Right) -->
     <div class="flex space-x-4">
      <v-avatar size="36px">
      <v-img
        
        alt="Avatar"
        src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460"
      ></v-img>
     
    </v-avatar>
     <p class="m-1 text-sm">Williams</p>
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
