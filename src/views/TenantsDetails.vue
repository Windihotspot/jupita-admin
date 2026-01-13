<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref, onMounted, computed } from 'vue'
import ApiService from '@/services/api'
import { useRoute } from 'vue-router'
import { ElNotification, ElMessageBox, ElTooltip, ElDialog } from 'element-plus'
import moment from 'moment'
import { useAuthStore } from '@/stores/auth'

// ───────────────────────────────
// AUTH STORE
// ───────────────────────────────
const auth = useAuthStore()
import LoadingOverlay from '@/components/LoadingOverlay.vue'
const route = useRoute()
const tenantId = ref(route.params.tenantId)
// Set date range to last 1 year
const endDate = ref(moment().format('DD/MM/YYYY'))
const startDate = ref(moment().subtract(1, 'year').format('DD/MM/YYYY'))

const loading = ref(false)
const error = ref(null)
const tenant = ref({})
const usage = ref([])
const permissions = ref([])
const team = ref([])
const billing = ref([])
const usageLogs = ref([])
const editingPrice = ref(null) // product id currently being edited

const fetchTenantDetails = async (silent = false) => {
  if (!silent) {
    loading.value = true
  }

  error.value = null

  const params = {
    tenant_id: tenantId.value,
    start_date: startDate.value,
    end_date: endDate.value
  }

  const token = localStorage.getItem('token')

  console.log('🔍 Fetch Tenant Details Payload:', params)

  try {
    const res = await ApiService.get('/get-tenant', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = res.data
    console.log('tenant details data:', data)

    // Tenant info
    const superAdmin = data.team.find((member) => member.title.toLowerCase() === 'super_admin')
    tenant.value = {
      name: superAdmin ? superAdmin.name : `${data.user.firstname} ${data.user.lastname}`,
      activated: data.tenant.activated, // ✅ IMPORTANT
      startDate: moment(startDate.value, 'DD/MM/YYYY').format('DD MMM YYYY'),
      endDate: moment(endDate.value, 'DD/MM/YYYY').format('DD MMM YYYY')
    }

    // Usage cards (map analysis, loans, id_verification, credit_history)
    usage.value = [
      { title: 'Analysis', value: data.analysis.reduce((acc, i) => acc + i.count, 0) },
      { title: 'Loans', value: data.loans.reduce((acc, i) => acc + i.count, 0) },
      {
        title: 'ID Verification',
        value: data.id_verification.reduce((acc, i) => acc + i.count, 0)
      },
      { title: 'Credit History', value: data.credit_history.reduce((acc, i) => acc + i.count, 0) }
    ]

    const tenantProductIds = new Set(data.tenant_products.map((p) => Number(p.product_id)))

    permissions.value = data.all_products.map((product) => ({
      id: product.product_id,
      name: product.name,
      enabled: tenantProductIds.has(product.product_id),
      loading: false
    }))

    // Team management
    team.value = data.team.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.title,
      isActive: member.active === 1,
      status: member.active === 1 ? 'Active' : 'Frozen',
      date: moment(member.created_at).format('DD MMM YYYY')
    }))

    // Billing / subscription
    // Merge billing with tenant product IDs
billing.value = data.tenant_product_price.map((item) => {
  const tenantProduct = data.tenant_products.find((p) => p.name === item.name)
  return {
    service: item.name,
    price: item.product_price,
    productId: tenantProduct ? tenantProduct.product_id : null
  }
})


    // Usage logs (transactions)
    usageLogs.value = data.transactions.data.map((t) => ({
      date: moment(t.created_at).format('DD MMM YYYY'),
      type: t.description,
      amount: t.amount,
      user: tenant.value.name
    }))
  } catch (err) {
    console.error('Error fetching tenant details:', err)
    error.value = err.response?.data?.message || 'Failed to load tenant details'
  } finally {
    if (!silent) {
      loading.value = false
    }
  }
}
const newApiStatus = computed(() => (tenant.value.activated === 1 ? 'deactivate' : 'activate'))
const toggleTenantStatus = async () => {
  const token = localStorage.getItem('token')

  const payload = {
    tenant_id: tenantId.value,
    status: newApiStatus.value // ✅ dynamic
  }

  console.log('🔹 PUT /update-tenant-status Request Payload:', payload)

  try {
    const res = await ApiService.put('/update-tenant-status', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    console.log('🔹 PUT /update-tenant-status Response:', res.data)

    ElNotification({
      message: `Tenant ${newApiStatus.value === 'activate' ? 'activated' : 'deactivated'} successfully`,
      type: 'success',
      duration: 3000
    })

    // Refresh tenant details after update
    await fetchTenantDetails(true)
  } catch (err) {
    console.error('Error updating tenant status:', err)

    ElNotification({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to update tenant status',
      type: 'error',
      duration: 3000
    })
  }
}
const toggleMemberStatus = async (member) => {
  const action = member.isActive ? 'freeze' : 'unfreeze'
  const actionLabel = member.isActive ? 'Freeze' : 'Unfreeze'

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to ${actionLabel.toLowerCase()} ${member.name}?`,
      `${actionLabel} Member`,
      {
        confirmButtonText: actionLabel,
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    const token = localStorage.getItem('token')

    const payload = {
      tenant_id: tenantId.value,
      user_id: member.id,
      status: action // freeze | unfreeze
    }

    await ApiService.put('/update-member-status', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    ElNotification({
      message: `${member.name} has been ${action === 'freeze' ? 'frozen' : 'unfrozen'} successfully`,
      type: 'success',
      duration: 3000
    })

    // 🔄 silent refresh
    await fetchTenantDetails(true)
  } catch (err) {
    // ignore cancel
    if (err !== 'cancel') {
      ElNotification({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update member status',
        type: 'error'
      })
    }
  }
}

const toggleProductAvailability = async (product) => {
  const action = product.enabled ? 'deactivate' : 'activate'
  const actionLabel = product.enabled ? 'Deactivate' : 'Activate'

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to ${actionLabel.toLowerCase()} ${product.name}?`,
      `${actionLabel} Product`,
      {
        confirmButtonText: actionLabel,
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    product.loading = true
    const token = localStorage.getItem('token')

    const payload = {
      tenant_id: tenantId.value,
      product_id: product.id,
      status: action // activate | deactivate
    }

    await ApiService.put('/update-tenant-product-availability', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    ElNotification({
      message: `${product.name} ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
      type: 'success',
      duration: 3000
    })

    // 🔄 silent refresh (no loading state)
    await fetchTenantDetails(true)
  } catch (err) {
    if (err !== 'cancel') {
      ElNotification({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to update product availability',
        type: 'error'
      })
    }
  } finally {
    product.loading = false
  }
}

const deleteMember = async (member) => {
  try {
    await ElMessageBox.confirm(
      `This will permanently remove ${member.name} from the team. Continue?`,
      'Delete Member',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )

    const token = localStorage.getItem('token')

    const payload = {
      tenant_id: member.id,
      user_id: auth.user.id
    }
    console.log('delete payload:', payload)

    await ApiService.post('/delete-member', {
      data: payload,
      headers: { Authorization: `Bearer ${token}` }
    })

    ElNotification({
      message: `${member.name} has been removed successfully`,
      type: 'success',
      duration: 3000
    })

    // 🔄 silent refresh (no loading screen)
    await fetchTenantDetails(true)
  } catch (err) {
    console.log('error delete:', err.response.data.data.error)
    // user cancelled
    if (err === 'cancel') return

    ElNotification({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to delete member',
      type: 'error'
    })
  }
}
const editingProduct = ref(null)
const newPrice = ref(0)
const savingPrice = ref(false)
const showPriceDialog = ref(false)

const openPriceDialog = (item) => {
  editingProduct.value = item
  newPrice.value = item.price
  showPriceDialog.value = true
}

const closePriceDialog = () => {
  editingProduct.value = null
  showPriceDialog.value = false
}

const updateProductPrice = async () => {
  if (!editingProduct.value) return
  savingPrice.value = true
  const token = localStorage.getItem('token')

  const payload = {
    tenant_id: tenantId.value,
    product_id: editingProduct.value.productId,
    price: Number(newPrice.value)
  }
  console.log("update price payload:", payload)

  try {
    await ApiService.put('/update-product-price', payload, {
      headers: { Authorization: `Bearer ${token}` }
    })

    ElNotification({
      message: `${editingProduct.value.name} price updated successfully`,
      type: 'success',
      duration: 3000
    })

    await fetchTenantDetails(true)

    closePriceDialog() // 🔹 close after saving
  } catch (err) {
    console.error('Error updating product price:', err)
    ElNotification({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to update product price',
      type: 'error'
    })
  } finally {
    savingPrice.value = false
  }
}


onMounted(fetchTenantDetails)
</script>

<template>
  <MainLayout>
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[200px]">
      <LoadingOverlay :visible="loading" message="Loading data..." />
    </div>
    <div v-else class="p-6 space-y-6">
      <!-- HEADER -->
      <div class="bg-white p-6 rounded shadow flex justify-between items-center">
        <div class="flex justify-between gap-4">
          <h1 class="text-md font-semibold">{{ tenant.name }}</h1>
          <span
            class="px-3 py-1 rounded text-xs"
            :class="
              tenant.activated === 1 ? 'bg-[#A2F8DE] text-green-600' : 'bg-red-100 text-red-600'
            "
          >
            {{ tenant.activated === 1 ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <v-btn
          size="small"
          :color="tenant.activated === 1 ? 'red' : 'green'"
          variant="flat"
          class="text-white"
          @click="toggleTenantStatus"
        >
          <template #prepend>
            <i
              :class="tenant.activated === 1 ? 'fas fa-lock' : 'fas fa-unlock'"
              class="text-white text-sm mr-2"
            ></i>
          </template>
          {{ tenant.activated === 1 ? 'Deactivate Tenant' : 'Activate Tenant' }}
        </v-btn>
      </div>

      <!-- DATE RANGE -->
      <div class="bg-white p-4 rounded shadow w-max">
        <div class="flex items-center gap-2">
          <i class="fa fa-calendar text-gray-500"></i>
          <span class="text-sm">{{ tenant.startDate }} - {{ tenant.endDate }}</span>
        </div>
      </div>

      <!-- USAGE CARDS -->

      <div class="bg-white p-4 rounded shadow">
        <!-- <h2 class="font-semibold mb-4 text-sm">Usage</h2> -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            v-for="(item, index) in usage"
            :key="index"
            class="p-6 rounded shadow-sm"
            :class="{
              'bg-blue-50 border-blue-300': index === 0,
              'bg-green-50 border-green-300': index === 1,
              'bg-pink-50 border-pink-300': index === 2,
              'bg-orange-50 border-orange-300': index === 3
            }"
          >
            <div class="flex justify-between items-center mb-6">
              <p class="font-medium text-xs">{{ item.title }}</p>
              <i class="fa fa-chevron-down text-xs"></i>
            </div>
            <p class="text-md font-bold mt-2">{{ item.value }}</p>
          </div>
        </div>
      </div>

      <!-- ACCESS MANAGEMENT -->
      <div class="bg-white p-6 rounded shadow">
        <h2 class="font-semibold mb-4 tex-sm">Access Management</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="(item, index) in permissions"
            :key="index"
            class="flex items-center p-2 space-x-2"
          >
            <!-- Name -->
            <span class="text-xs">{{ item.name }}</span>

            <!-- Switch -->
            <el-switch
              :model-value="item.enabled"
              :loading="item.loading"
              :disabled="item.loading"
              @change="() => toggleProductAvailability(item)"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            />
          </div>
        </div>
      </div>

      <!-- TEAM MANAGEMENT -->
      <div class="bg-white p-6 rounded shadow">
        <h2 class="font-semibold mb-4 text-sm">Team Management</h2>

        <table class="w-full text-sm m-4">
          <thead>
            <tr class="font-semibold">
              <th class="text-left py-2">Team Members</th>
              <th class="text-left">Status</th>
              <th class="text-left">Role</th>
              <th class="text-left">Date Created</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(member, index) in team" :key="index" class="p-2">
              <td class="py-2">{{ member.name }}</td>
              <td>
                <span :class="member.status === 'Active' ? 'text-green-500' : 'text-red-500'">
                  {{ member.status }}
                </span>
              </td>
              <td>{{ member.role }}</td>
              <td>{{ member.date }}</td>
              <td class="text-center space-x-6">
                <!-- Edit -->
                <el-tooltip content="Edit member" placement="top">
                  <i class="fa fa-edit text-gray-500 cursor-pointer"></i>
                </el-tooltip>

                <!-- Freeze / Unfreeze -->
                <el-tooltip
                  :content="member.isActive ? 'Freeze member' : 'Unfreeze member'"
                  placement="top"
                >
                  <i
                    :class="
                      member.isActive ? 'fa fa-pause text-red-500' : 'fa fa-play text-green-500'
                    "
                    class="cursor-pointer"
                    @click="toggleMemberStatus(member)"
                  ></i>
                </el-tooltip>

                <!-- Delete -->
                <el-tooltip content="Delete member" placement="top">
                  <i
                    class="fa fa-trash text-red-500 cursor-pointer"
                    @click="deleteMember(member)"
                  ></i>
                </el-tooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SUBSCRIPTION & BILLING MANAGEMENT -->
      <div class="bg-white p-6 rounded shadow mt-6">
        <p class="font-semibold mb-4 text-sm">Subscription and Billing Management</p>

        <table class="w-full text-sm m-4">
          <thead>
            <tr class="text-semibold">
              <th class="text-left py-2">Service</th>
              <th class="text-left">Unit Price</th>
              <th class="text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in billing" :key="index" class="p-2">
              <td class="py-2">{{ item.service }}</td>
              <td>{{ item.price }}</td>
              <td>
                <i
                  class="fa fa-edit text-gray-500 cursor-pointer"
                  @click="openPriceDialog(item)"
                ></i>
              </td>
            </tr>
          </tbody>
        </table>
        <v-dialog v-model="showPriceDialog" max-width="400">
        <v-card class="">
          <p class="text-sm mx-6 my-4">Edit price for <span class="font-medium">{{ editingProduct?.service }}</span></p>

          <v-card-text>
            <v-text-field
            density="compact"
              v-model="newPrice"
              label="New Price"
              type="number"
              variant="outlined"
              dense
            />
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn text @click="closePriceDialog">Cancel</v-btn>
            <v-btn color="primary" :loading="savingPrice" @click="updateProductPrice">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      </div>

      <!-- USAGE TABLE -->
      <div class="bg-white p-6 rounded shadow mt-6">
        <p class="font-semibold mb-4 text-sm">Usage</p>

        <table class="w-full text-sm m-4">
          <thead>
            <tr class="text-semibold">
              <th class="text-left py-2">Date</th>
              <th class="text-left">Type</th>
              <th class="text-left">Amount</th>
              <th class="text-left">User</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(u, index) in usageLogs" :key="index" class="p-2 hover:bg-blue-50">
              <td class="py-2">{{ u.date }}</td>
              <td>{{ u.type }}</td>
              <td>{{ u.amount }}</td>
              <td>{{ u.user }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
