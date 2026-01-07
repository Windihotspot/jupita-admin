<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { PRODUCT_CONFIG } from '@/data/products.config'

const route = useRoute()
const router = useRouter()

const product = computed(() => PRODUCT_CONFIG[route.params.slug])

const globalEnabled = ref(product.value?.global ?? false)

const hasApiSource = computed(() =>
  product.value.features.some(f => f.api)
)
</script>

<template>
  <MainLayout>
    <div class="p-6 bg-gray-50 min-h-screen">
      <!-- Back -->
      <button
        class="text-sm text-blue-600 mb-4"
        @click="router.back()"
      >
        ← Back
      </button>

      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-lg font-semibold flex items-center gap-2">
          {{ product.name }}
          <span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
            {{ product.status }}
          </span>
        </h1>

        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-600">Global Control:</span>
          <el-switch v-model="globalEnabled" />
        </div>
      </div>

      <!-- Features -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-sm font-semibold mb-1">Features</h2>
        <p class="text-xs text-gray-500 mb-4">
          Enable or Disable Internal Features
        </p>

        <table class="w-full text-sm">
          <thead class="border-b text-gray-500">
            <tr>
              <th class="py-3 text-left">S/N</th>
              <th class="text-left">Product Name</th>
              <th>Status</th>
              <th>Turn On/Off</th>
              <th v-if="hasApiSource">API Source</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(feature, index) in product.features"
              :key="feature.id"
              class="border-b last:border-none"
            >
              <td class="py-3">{{ index + 1 }}</td>
              <td class="font-medium">{{ feature.name }}</td>

              <td>
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

              <td>
                <el-switch v-model="feature.enabled" />
              </td>

              <td v-if="hasApiSource">
                {{ feature.api || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </MainLayout>
</template>
