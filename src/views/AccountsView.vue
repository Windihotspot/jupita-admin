<template>
    <main-layout>
        
    </main-layout>

</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
const activeTab = ref('profile')

const roles = ['Super Admin', 'Admin', 'User']

const profile = ref({
  fullname: 'Williams Adeyemi',
  phone: '09065512525',
  email: 'wadeyemi@getjupita.com',
  role: 'Super Admin',
})

const team = ref([
  { id: 1, name: 'Adeyemi Williams', role: 'Super Admin', status: 'Inactive' },
  { id: 2, name: 'Anthony Oboli', role: 'Super Admin', status: 'Active' },
  { id: 3, name: 'Faramni Power Bank', role: 'Admin', status: 'Active' },
  { id: 4, name: 'Ifiok 😄', role: 'Admin', status: 'Active' },
])
</script>
