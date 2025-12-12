<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import ApiService from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import moment from 'moment'
const auth = useAuthStore()

const tenants = ref([])
const loading = ref(false)
const error = ref(null)

// FILTER OPTIONS
const statuses = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' }
]

const selectedStatus = ref('All')
const itemsPerPage = ref(10)
const currentPage = ref(1)

// 🔥 FETCH TENANTS FUNCTION
const fetchTenants = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await ApiService.get('/fetch-tenants', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    console.log('🔥 TENANTS API RAW:', response)

    const res = response.data // the real data
    tenants.value = res.tenants.data // <---- 🔥🔥 correct location

    console.log('📌 TENANTS LOADED:', tenants.value)
  } catch (err) {
    console.log(err)
    error.value = err.response?.data?.message || 'Failed to load tenants'
  } finally {
    loading.value = false
  }
}

// RUN ON PAGE LOAD
onMounted(() => {
  fetchTenants()
})

const formatDate = (dateStr) => {
  return moment(dateStr).format('DD MMM YYYY, hh:mm A') // Example: 10 Jul 2025, 10:40 AM
}

// FILTER SYSTEM
const filteredTenants = computed(() => {
  if (selectedStatus.value === 'All') return tenants.value
  return tenants.value.filter(
    (t) =>
      (t.activated === 1 && selectedStatus.value === 'Active') ||
      (t.activated === 0 && selectedStatus.value === 'Inactive')
  )
})

// PAGINATION
const paginatedTenants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredTenants.value.slice(start, start + itemsPerPage.value)
})
</script>

<template>
  <MainLayout>
    <div class="p-4 rounded shadow-sm bg-white m-4">
      <!-- Header with Title and Add Statement Button -->
      <div class="bg-white flex justify-between items-center border-b p-2">
        <div class="mb-2">
          <h1 class="text-xl font-bold text-gray-900">Tenants</h1>
          <p class="text-gray-500 text-sm mt-1">List of Jupita Users</p>
        </div>

        <v-btn
          size="large"
          class="normal-case custom-btn hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-md shadow-md"
        >
          <span
            class="bg-white text-blue-600 rounded-full p-1 flex items-center justify-center w-4 h-4 mr-2"
          >
            <i class="fa-solid fa-plus text-sm text-[#1f5aa3]"></i>
          </span>
          Add New
        </v-btn>
      </div>

      <div class="flex items-center space-x-6 p-2">
        <!-- Filter (Vuetify Select) -->
        <div class="flex items-center space-x-2 pt-2">
          <!-- Filter Icon -->
          <i class="fa fa-filter"></i>

          <el-select
            v-model="selectedStatus"
            placeholder="Status"
            clearable
            style="width: 120px"
            size="large"
          >
            <el-option
              v-for="item in statuses"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <v-text-field
            placeholder="Search by Tenant name"
            density="compact"
            hide-details
            variant="outlined"
            class="w-64"
            prepend-inner-icon="fa-solid fa-search text-gray text-sm"
          >
          </v-text-field>
        </div>
      </div>
    </div>

     <div v-if="loading" class="flex flex-col items-center justify-center min-h-[200px]">
    
         <LoadingOverlay :visible="loading" message="Loading tenants..." />
      </div>

    <div v-else class="p-4">
     

      <div v-if="tenants.length > 0" class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="font-semibold uppercase text-xs leading-normal">
            <tr>
              <th class="py-3 px-6 text-left">S/N</th>

              <th class="py-3 px-6 text-left">Created At</th>
              <th class="py-3 px-6 text-left">Tenant ID</th>
              <th class="py-3 px-6 text-left">Tenant Name</th>
              <th class="py-3 px-6 text-left">Status</th>
              <th class="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 text-sm font-light bg-white rounded-xl shadow-lg">
            <tr
              v-for="(tenant, index) in paginatedTenants"
              :key="tenant.id"
              class="border-b border-gray-200 font-normal"
            >
              <td class="py-3 px-6 text-left">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <td class="py-3 px-6">{{formatDate(tenant.created_at) }}</td>
              <td class="py-3 px-6">{{ tenant.tenant_id }}</td>
              <td class="py-3 px-6">{{ tenant.name }}</td>

              <td class="py-3 px-6">
                <span
                  :class="
                    tenant.activated === 1
                      ? 'text-green-600 bg-green-100'
                      : 'text-red-600 bg-red-100'
                  "
                  class="py-1 px-2 text-xs font-semibold rounded-full"
                >
                  {{ tenant.activated === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td class="py-3 px-6 text-center">
                <router-link 
  :to="{ name: 'tenants-details', params: { tenantId: tenant.tenant_id } }"
>
  <span class="bg-[#1f5aa3] text-white px-4 py-1 rounded hover:bg-blue-600 cursor-pointer">
    View
  </span>
</router-link>

              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Row -->
        <div class="flex items-center justify-between mt-4">
          <!-- ITEMS PER PAGE (LEFT) -->
          <!-- <v-select
    v-model="itemsPerPage"
    :items="[5, 10, 15, 20]"
    label="Items per Page"
    density="comfortable"
    variant="outlined"
    color="#1f5aa3"
    class="w-40"
    hide-details
    rounded="lg"
    style="border-color:#1f5aa3;"
  ></v-select> -->

          <!-- PAGINATION (RIGHT) -->
          <!-- <v-pagination
    v-model="currentPage"
    :length="pageCount"
    rounded="circle"
    color="#1f5aa3"
    class="pagination-custom"
  ></v-pagination> -->
        </div>
      </div>

      <div v-else class="fill-height align-center justify-center">
        <div class="mx-auto text-center align-center w-[200px] h-[200px]">
          <img src="/src/assets/images/no-data.png" alt="No Data" />
          <div class="empty-text font-semibold mt-8">No Tenants</div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.pagination-custom .v-pagination__item {
  border-radius: 50% !important;
}
.custom-btn {
  background-color: #1f5aa3;
  text-transform: none;
  text-transform: none;
}
v-btn {
  text-transform: none;
}
</style>
