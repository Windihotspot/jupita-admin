<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// Reactive variable to handle loading state
</script>

<template>
  <div class="header items-center px-4 py-4 bg-white">
      <el-dropdown >
      <div
        class="flex items-center bg-white shadow-sm px-3 py-2 rounded cursor-pointer"
      >
        <!-- Avatar -->
        <img
          src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460"
          class="w-8 h-8 rounded-full object-cover"
        />

        <!-- Name -->
        <span class="ml-2 text-sm font-medium text-gray-700 max-w-[80px] truncate">
          Williams...
        </span>

        <!-- Arrow -->
        <el-icon class="ml-1 text-gray-600" size="14">
          <arrow-down />
        </el-icon>
      </div>

      <!-- Dropdown Menu -->
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">Profile</el-dropdown-item>
          <el-dropdown-item divided command="logout">Logout</el-dropdown-item>
        </el-dropdown-menu>
      </template>

    </el-dropdown>
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
