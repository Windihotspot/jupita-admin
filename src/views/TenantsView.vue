<script setup>
import { ref, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'

const statuses = ['All', 'Active', 'Inactive']
const selectedStatus = ref('All')

const itemsPerPage = ref(10)
const currentPage = ref(1)

const tenants = ref([
  // 30 dummy Nigerian football legends
  {
    id: 1,
    created_at: '2024-01-10',
    tenant_id: 'TEN001',
    name: 'Jay-Jay Okocha',
    status: 'Active'
  },
  { id: 2, created_at: '2024-02-12', tenant_id: 'TEN002', name: 'Nwankwo Kanu', status: 'Active' },
  {
    id: 3,
    created_at: '2024-03-15',
    tenant_id: 'TEN003',
    name: 'Rashidi Yekini',
    status: 'Inactive'
  },
  { id: 4, created_at: '2024-01-22', tenant_id: 'TEN004', name: 'Finidi George', status: 'Active' },
  {
    id: 5,
    created_at: '2024-03-03',
    tenant_id: 'TEN005',
    name: 'Daniel Amokachi',
    status: 'Active'
  },
  { id: 6, created_at: '2024-04-10', tenant_id: 'TEN006', name: 'Taribo West', status: 'Inactive' },
  { id: 7, created_at: '2024-05-01', tenant_id: 'TEN007', name: 'Sunday Oliseh', status: 'Active' },
  { id: 8, created_at: '2024-02-20', tenant_id: 'TEN008', name: 'Victor Ikpeba', status: 'Active' },
  {
    id: 9,
    created_at: '2024-03-09',
    tenant_id: 'TEN009',
    name: 'Celestine Babayaro',
    status: 'Inactive'
  },
  {
    id: 10,
    created_at: '2024-06-12',
    tenant_id: 'TEN010',
    name: 'Mutiu Adepoju',
    status: 'Active'
  },
  {
    id: 11,
    created_at: '2024-01-14',
    tenant_id: 'TEN011',
    name: 'Stephen Keshi',
    status: 'Inactive'
  },
  { id: 12, created_at: '2024-02-16', tenant_id: 'TEN012', name: 'Peter Rufai', status: 'Active' },
  { id: 13, created_at: '2024-03-18', tenant_id: 'TEN013', name: 'Joseph Yobo', status: 'Active' },
  {
    id: 14,
    created_at: '2024-04-20',
    tenant_id: 'TEN014',
    name: 'Austin Eguavoen',
    status: 'Inactive'
  },
  {
    id: 15,
    created_at: '2024-05-15',
    tenant_id: 'TEN015',
    name: 'Daniel Shittu',
    status: 'Active'
  },
  {
    id: 16,
    created_at: '2024-06-10',
    tenant_id: 'TEN016',
    name: 'Yakubu Aiyegbeni',
    status: 'Active'
  },
  {
    id: 17,
    created_at: '2024-01-30',
    tenant_id: 'TEN017',
    name: 'Obafemi Martins',
    status: 'Inactive'
  },
  { id: 18, created_at: '2024-02-27', tenant_id: 'TEN018', name: 'Ike Shorunmu', status: 'Active' },
  {
    id: 19,
    created_at: '2024-03-21',
    tenant_id: 'TEN019',
    name: 'Emmanuel Amunike',
    status: 'Active'
  },
  {
    id: 20,
    created_at: '2024-04-25',
    tenant_id: 'TEN020',
    name: 'Segun Odegbami',
    status: 'Inactive'
  },
  { id: 21, created_at: '2024-05-29', tenant_id: 'TEN021', name: 'Alloy Agu', status: 'Active' },
  {
    id: 22,
    created_at: '2024-02-13',
    tenant_id: 'TEN022',
    name: 'Samson Siasia',
    status: 'Inactive'
  },
  {
    id: 23,
    created_at: '2024-03-11',
    tenant_id: 'TEN023',
    name: 'Uche Okechukwu',
    status: 'Active'
  },
  { id: 24, created_at: '2024-04-14', tenant_id: 'TEN024', name: 'Garba Lawal', status: 'Active' },
  {
    id: 25,
    created_at: '2024-06-11',
    tenant_id: 'TEN025',
    name: 'Wilson Oruma',
    status: 'Inactive'
  },
  { id: 26, created_at: '2024-01-18', tenant_id: 'TEN026', name: 'Sani Kaita', status: 'Active' },
  {
    id: 27,
    created_at: '2024-02-17',
    tenant_id: 'TEN027',
    name: 'Sam Okwaraji',
    status: 'Inactive'
  },
  {
    id: 28,
    created_at: '2024-03-26',
    tenant_id: 'TEN028',
    name: 'Thompson Usiyan',
    status: 'Active'
  },
  { id: 29, created_at: '2024-04-28', tenant_id: 'TEN029', name: 'Dosu Joseph', status: 'Active' },
  {
    id: 30,
    created_at: '2024-05-30',
    tenant_id: 'TEN030',
    name: 'Stephen Odegbami',
    status: 'Inactive'
  }
])

// FILTERED LIST
const filteredTenants = computed(() => {
  if (selectedStatus.value === 'All') return tenants.value
  return tenants.value.filter((t) => t.status === selectedStatus.value)
})

// PAGINATION LOGIC
const paginatedTenants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTenants.value.slice(start, end)
})

const pageCount = computed(() => Math.ceil(filteredTenants.value.length / itemsPerPage.value))
</script>

<template>
  <MainLayout
    ><div class="p-4 rounded shadow-sm bg-white m-4">
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

          <v-select
            color="#1f5aa3"
            v-model="selectedStatus"
            :items="statuses"
            label="Status"
            density="compact"
            hide-details
            variant="outlined"
            class="w-32"
          ></v-select>
        </div>

        <v-text-field
          placeholder="Search for a tenant"
          density="compact"
          hide-details
          variant="outlined"
          class="max-w-xs bg-gray-50"
          label="Search"
          color="#1f5aa3"
          append-inner-icon=""
        >
          <!-- FontAwesome Search Icon inside append-inner slot -->
          <template #append-inner>
            <i class="fas fa-search text-[#1f5aa3]"></i>
          </template>
        </v-text-field>
      </div>
    </div>

    <div class="p-4">
      <!-- <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[200px]">
    
         <LoadingOverlay :visible="isLoading" message="Loading statements..." />
      </div> -->

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

              <td class="py-3 px-6">{{ tenant.created_at }}</td>
              <td class="py-3 px-6">{{ tenant.tenant_id }}</td>
              <td class="py-3 px-6">{{ tenant.name }}</td>

              <td class="py-3 px-6">
                <span
                  :class="
                    tenant.status === 'Active'
                      ? 'text-green-600 py-1 px-2 text-xs font-semibold rounded-full bg-green-100'
                      : 'text-red-600 py-1 px-2 text-xs font-semibold rounded-full bg-red-100'
                  "
                >
                  {{ tenant.status }}
                </span>
              </td>

              <td class="py-3 px-6 text-center">
                <router-link to="tenants-details">
                  <span
                  class="bg-[#1f5aa3] text-white px-4 py-1 rounded hover:bg-blue-600 cursor-pointer"
                >
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
