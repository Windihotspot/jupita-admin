<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/full/MainLayout.vue'
import ApiService from '@/services/api'
import { ElNotification } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
import { useProductsStore } from '@/stores/products'
const productsStore = useProductsStore()
const resolveProductName = (slug) => {
  const productName = productsStore.featureProductMap[slug]

  if (!productName) {
    throw new Error(`Invalid or unmapped feature slug: ${slug}`)
  }

  return productName
}

const productId = route.params.productId

const loading = ref(false)

const storeLoaded = computed(() => productsStore.products.length > 0)

const product = computed(() =>
  storeLoaded.value ? productsStore.getById(route.params.productId) : null
)

const productReady = computed(() => !!product.value)

const hasFeatures = computed(() => features.value.length > 0)

const hasApiSource = computed(() => product.value?.features?.some((f) => f.api))

const features = computed(() => {
  if (!productReady.value) return []

  const ids = product.value.feature_ids || {}
  const statuses = product.value.feature_status || {}
  const prices = product.value.price_determinants || {}
  const types = product.value.price_determinants_type || {}

  return Object.keys(ids).map((slug) => ({
    id: ids[slug],
    slug,
    name: slug.replace(/_/g, ' ').toUpperCase(),
    enabled: statuses[slug] === 'active',
    price: prices[slug] ?? null,
    type: types[slug] ?? null,
    api: null // unless you have this elsewhere
  }))
})


console.log("features:", features.value)
onMounted(async () => {
<<<<<<< HEAD
 
=======
>>>>>>> 9103600c06431636bf976219bfc741223e9d56e1
  try {
    // Ensure products exist
    if (!storeLoaded.value) {
      await productsStore.fetchProducts()
    }

    // Guard invalid product
    if (!product.value) {
      router.replace('/settings')
    }
  } catch (err) {
    ElNotification({
      type: 'error',
      message: 'Failed to load product details'
    })
  }
})

const toggleFeatureLoading = ref({})

const toggleFeatureStatus = async (feature) => {
  if (!feature || !product.value) return

  const slug = feature.slug
  const wasEnabled = product.value.feature_status[slug] === 'active'

  toggleFeatureLoading.value[slug] = true

  try {
    await ApiService.put(
      '/update-global-product-feature-availability',
      {
        feature_id: feature.id,
        status: wasEnabled ? 'deactivate' : 'activate'
      },
      {
        headers: { Authorization: `Bearer ${auth.token}` }
      }
    )

    // ✅ UPDATE SOURCE OF TRUTH
    product.value.feature_status = {
      ...product.value.feature_status,
      [slug]: wasEnabled ? 'inactive' : 'active'
    }

    ElNotification({
      type: 'success',
      message: `${feature.name} ${wasEnabled ? 'disabled' : 'enabled'}`
    })
  } catch (err) {
    console.log('toggle feature error:', err)
    ElNotification({
      type: 'error',
      message: err.response?.data?.message || 'Failed to update feature'
    })
  } finally {
    toggleFeatureLoading.value[slug] = false
  }
}


const toggleGlobalLoading = ref(false)

const toggleGlobalStatus = async (enabled) => {
  if (!product.value) return

  const newStatus = enabled ? 'active' : 'inactive'
  const previousStatus = product.value.global_status

  toggleGlobalLoading.value = true

  try {
    await ApiService.put(
      '/toggle-product-status',
      {
        product_id: product.value.id,
        new_status: newStatus
      },
      {
        headers: { Authorization: `Bearer ${auth.token}` }
      }
    )

    // ✅ SOURCE OF TRUTH UPDATE
    product.value.global_status = newStatus

    ElNotification({
      type: 'success',
      message:
        newStatus === 'active'
          ? 'Product activated'
          : 'Product deactivated'
    })
  } catch (err) {
    // rollback UI
    product.value.global_status = previousStatus

    ElNotification({
      type: 'error',
      message: err.response?.data?.message || 'Failed to toggle product'
    })
  } finally {
    toggleGlobalLoading.value = false
  }
}

</script>

<template>
  <MainLayout>
    <div class="p-6 bg-gray-50 min-h-screen">
      <RouterLink to="/settings">
        <button class="mb-4 flex items-center text-black text-lg font-normal">
          <i class="fas fa-circle-arrow-left mr-2 text-xl" style="color: #2563eb"></i> Back
        </button>
      </RouterLink>

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-lg font-semibold flex items-center gap-2">
          <span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700"> </span>
        </h1>

        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">Global Control:</span>
           <el-switch
            v-model="product.global"
            :loading="toggleGlobalLoading"
            active-color="#16a34a"
            inactive-color="#dc2626"
            @change="toggleGlobalStatus"
          />
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white rounded-sm shadow-sm p-6">
        <h2 class="text-sm font-semibold mb-1">Features</h2>
        <p class="text-xs text-gray-500 mb-4">Enable or Disable Internal Features</p>
        <div v-if="!product" class="py-12 text-center text-gray-500">
          <LoadingOverlay :visible="loading" message="Loading features..." />
        </div>
        <table v-else-if="hasFeatures" class="w-full text-sm border-collapse">
          <thead class="border-b font-semibold">
            <tr>
              <th class="px-4 py-3 text-left">S/N</th>
              <th class="px-4 py-3 text-left">Feature Name</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-left">Turn On/Off</th>
              <th v-if="hasApiSource" class="px-4 py-3 text-left">API Source</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(feature, index) in features"
              :key="feature.id"
              class="border-b last:border-none text-xs"
            >
              <td class="px-4 py-3">{{ index + 1 }}</td>
              <td class="px-4 py-3 font-medium">{{ feature.name }}</td>

              <td class="px-4 py-3">
                <span
                  v-if="feature.enabled !== null"
                  class="px-2 py-0.5 rounded-full"
                  :class="
                    feature.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  "
                >
                  {{ feature.enabled ? 'Active' : 'Inactive' }}
                </span>

                <span v-else class="text-xs text-gray-400">Loading…</span>
              </td>

              <td class="px-4 py-3">
                <div v-if="!productReady" class="py-12">
                  <LoadingOverlay visible message="Loading product..." />
                </div>

                <div v-else>
                  <el-switch
                    v-model="feature.enabled"
                    :loading="toggleFeatureLoading[feature.slug]"
                    @change="() => toggleFeatureStatus(feature)"
                    active-color="#16a34a"
                    inactive-color="#dc2626"
                  />
                </div>
              </td>

              <td v-if="hasApiSource" class="px-4 py-3">
                {{ feature.api || '-' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <i class="fas fa-layer-group text-4xl text-gray-300 mb-3"></i>

          <p class="text-sm font-medium text-gray-700">No features available</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
