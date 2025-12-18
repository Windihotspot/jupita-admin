<script setup>
import { ref } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
const tab = ref('products')

const tabs = [
  { label: 'Products', value: 'products' },
  { label: 'My Account', value: 'account' },
  { label: 'Api-Keys', value: 'api-keys' }
]

const products = ref([
  {
    id: 1,
    name: 'Loan Origination',
    status: 'Inactive',
    global: false
  },
  {
    id: 2,
    name: 'Credit Search',
    status: 'Active',
    global: true
  },
  {
    id: 3,
    name: 'Analyze',
    status: 'Active',
    global: true
  },
  {
    id: 4,
    name: 'ID Verification',
    status: 'Active',
    global: true
  }
])
</script>
<template>
  <MainLayout>
    <div class="p-4 rounded shadow-sm bg-white m-4">
      <div class="items-center border-b p-2 mb-6">
        <div class="mb-2">
          <h1 class="text-xl font-bold text-gray-900">Settings</h1>
          <p class="text-gray-500 text-sm mt-1">Manage platform wide configurations</p>
        </div>

       
      </div>
       <v-tabs v-model="tab" density="compact">
        <v-tab
        class="mb-4"
          v-for="item in tabs"
          :key="item.value"
          :value="item.value"
          slider-size="8"
          :class="{
            'text-black font-semibold': tab === item.value,
            'text-gray-500': tab !== item.value
          }"
        >
          {{ item.label }}
        </v-tab>
      </v-tabs>
    </div>

    <div class="m-4">
      

      <v-tabs-window v-model="tab" class="mt-4">
        <v-tabs-window-item value="products">
          <div class="flex items-center space-x-6 p-2">
            <!-- Filter (Vuetify Select) -->
            <div class="flex items-center space-x-2 pt-2">
              <!-- Filter Icon -->
              <i class="fa fa-filter"></i>

              <!-- <el-select
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
            </el-select> -->

              <v-text-field
                placeholder="Search a product"
                density="compact"
                hide-details
                variant="outlined"
                class="w-64"
                prepend-inner-icon="fa-solid fa-search text-gray text-sm"
              >
              </v-text-field>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow overflow-hidden mt-4">
            <table class="min-w-full border-collapse">
              <!-- Header -->
              <thead class="bg-gray-50 border-b">
                <tr class="text-left text-sm font-semibold text-gray-600">
                  <th class="px-4 py-3">S/N</th>
                  <th class="px-4 py-3">Product Name</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Action</th>
                  <th class="px-4 py-3">Global Control</th>
                </tr>
              </thead>

              <!-- Body -->
              <tbody>
                <tr
                  v-for="(product, index) in products"
                  :key="product.id"
                  class="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <!-- S/N -->
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ index + 1 }}
                  </td>

                  <!-- Product Name -->
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">
                    {{ product.name }}
                  </td>

                  <!-- Status -->
                  <td class="px-4 py-3">
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="
                        product.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      "
                    >
                      {{ product.status }}
                    </span>
                  </td>

                  <!-- Action -->
                  <td class="px-4 py-3">
                    <button
                      class="px-4 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                    >
                      View
                    </button>
                  </td>

                  <!-- Global Control -->
                  <td class="px-4 py-3">
                    <el-switch v-model="product.global" active-color="green" inactive-color="red" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="account"></v-tabs-window-item>
        <v-tabs-window-item value="api-keys"></v-tabs-window-item>
      </v-tabs-window>
    </div>
  </MainLayout>
</template>

<style scoped>
.v-slider {
  --v-slider-track-size: 4px;
  --v-slider-thumb-size: 12px;
}

.v-tab {
  text-transform: none;
}
.v-btn {
  text-transform: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
:deep(.v-tab__slider) {
  height: 4px !important; /* Adjust thickness */
  background-color: #214ec8 !important; /* Change color if needed */
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
