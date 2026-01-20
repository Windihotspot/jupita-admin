<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/full/MainLayout.vue'
import ApiService from '@/services/api'
import { ElNotification } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const productId = Number(route.params.productId)

const loading = ref(false)
const product = ref(null)

const fetchProduct = async () => {
  loading.value = true

  const payload = {
    product_id: productId
  }

  console.log('📤 GET PRODUCT PAYLOAD:', payload)

  try {
    const res = await ApiService.get('/get-product', {
  params: {
    product_id: productId
  },
  headers: {
    Authorization: `Bearer ${auth.token}`
  }
})

    console.log('📥 GET PRODUCT RESPONSE:', res.data)

    product.value = res.data.data || res.data
  } catch (err) {
    console.error('❌ GET PRODUCT ERROR:', err)

    ElNotification({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to load product',
      type: 'error'
    })

    router.back()
  } finally {
    loading.value = false
  }
}


const hasApiSource = computed(() =>
  product.value?.features?.some(f => f.api)
)

onMounted(fetchProduct)
</script>


<template>
  <MainLayout>
    <div class="p-6 bg-gray-50 min-h-screen">
       <RouterLink to="/settings">
            <button  class="mb-4 flex items-center text-black text-lg font-normal">
              <i class="fas fa-circle-arrow-left mr-2 text-xl" style="color: #2563eb"></i> Back
            </button>
          </RouterLink>

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-lg font-semibold flex items-center gap-2">
         
          <span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
            
          </span>
        </h1>

        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">Global Control:</span>
          <el-switch enabled />
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-sm font-semibold mb-1">Features</h2>
        <p class="text-xs text-gray-500 mb-4">
          Enable or Disable Internal Features
        </p>

       <table class="w-full text-sm border-collapse">
  <thead class="border-b text-gray-500">
    <tr>
      <th class="px-4 py-3 text-left">S/N</th>
      <th class="px-4 py-3 text-left">Feature Name</th>
      <th class="px-4 py-3 text-left">Status</th>
      <th class="px-4 py-3 text-left">Turn On/Off</th>
      <th v-if="hasApiSource" class="px-4 py-3 text-left">
        API Source
      </th>
    </tr>
  </thead>

  <tbody>
     <tr
      v-for="(feature, index) in product"
      :key="feature.id"
      class="border-b last:border-none"
    >
      <td class="px-4 py-3">{{ index }}</td>
      <td class="px-4 py-3 font-medium">{{ feature.name }}</td>

      <td class="px-4 py-3">
        <span
          class="px-2 py-0.5 rounded-full text-xs"
          :class="
            feature.enabled
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          "
        >
          {{ feature.enabled ? 'Active' : 'Inactive' }}
        </span>
      </td>

      <td class="px-4 py-3">
        <el-switch v-model="feature.enabled" />
      </td>

      <td v-if="hasApiSource" class="px-4 py-3">
        {{ feature.api || '-' }}
      </td>
    </tr>
  </tbody>
</table>

      </div>
    </div>
  </MainLayout>
</template>
