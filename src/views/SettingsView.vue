<script setup>
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { ElNotification, ElMessageBox, ElTooltip, ElDialog } from 'element-plus'
import ApiService from '@/services/api'
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const tab = ref(route.query.tab || 'products')
const activeTab = ref(route.query.section || 'profile')

import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()

const user = computed(() => auth.user)

console.log('user:', user)
import { useProductsStore } from '@/stores/products'

const productsStore = useProductsStore()

const products = computed(() => productsStore.products)
console.log('product store:', productsStore.value)
const productsLoading = computed(() => productsStore.loading)
const productsError = computed(() => productsStore.error)

const toggleProductStatus = async (product) => {
  const previousGlobal = product.global
  const newStatus = product.global ? 'active' : 'inactive'

  toggleLoadingMap.value[product.id] = true
  const payload = {
    product_id: product.id,
    new_status: newStatus
  }
  console.log('payload:', payload)
  try {
    await ApiService.put('/toggle-product-status', payload, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    // sync UI with backend response
    // after successful API call
    productsStore.updateProductStatus(product.id, newStatus)

    ElNotification({
      type: 'success',
      message:
        newStatus === 'active'
          ? 'Product activated successfully'
          : 'Product deactivated successfully',
      duration: 2500
    })
  } catch (err) {
    console.log('error:', err.response.data)
    product.global = previousGlobal

    ElNotification({
      type: 'error',
      message: err.response?.data?.message || 'Failed to update product status'
    })
  } finally {
    toggleLoadingMap.value[product.id] = false
  }
}

const showCreateDialog = ref(false)
const createLoading = ref(false)
const createError = ref(null)

const createFormRef = ref(null)

const newAdmin = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  password: '',
  role: 'admin'
})

// VALIDATION RULES
const rules = {
  required: (v) => !!v || 'This field is required',
  email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address',
  phone: (v) => !v || /^[0-9+\-\s]{7,15}$/.test(v) || 'Invalid phone number',

  password: (v) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(v) ||
    'Min 8 chars, uppercase, lowercase, number & symbol'
}

// RESET FORM
const resetCreateForm = () => {
  newAdmin.value = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin'
  }

  createError.value = null
  createFormRef.value?.resetValidation()
}

const createAdmin = async () => {
  const { valid } = await createFormRef.value.validate()
  if (!valid) return

  createLoading.value = true
  createError.value = null

  const payload = {
    firstname: newAdmin.value.firstname,
    lastname: newAdmin.value.lastname,
    email: newAdmin.value.email,
    phone: newAdmin.value.phone,
    password: newAdmin.value.password,
    role: 'admin'
  }

  console.group('📤 CREATE ADMIN REQUEST')
  console.log('URL:', '/create-admin')
  console.log('Method:', 'POST')
  console.log('Payload:', payload)
  console.groupEnd()

  try {
    const response = await ApiService.post('/create-admin', payload)
    ElNotification({
      message: 'New Jupita admin added',
      type: 'success',
      duration: 3000
    })
     fetchAdminMembers()
    showCreateDialog.value = false
    resetCreateForm()
    fetchAdminMembers()
    // optionally refresh admins list here
  } catch (err) {
    createError.value = err.response?.data?.message || 'Failed to create admin'
  } finally {
    createLoading.value = false
  }
}

const router = useRouter()

const tabs = [
  { label: 'Products', value: 'products' },
  { label: 'My Account', value: 'account' },
  { label: 'Api-Keys', value: 'api-keys' }
]

const roles = ref([])
const selectedRoleId = ref(null)

// URL → Tabs
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab) tab.value = newTab
  }
)

watch(
  () => route.query.section,
  (newSection) => {
    if (newSection) activeTab.value = newSection
  }
)

// Tabs → URL
watch(tab, (newTab) => {
  router.replace({
    query: {
      ...route.query,
      tab: newTab
    }
  })
})

watch(activeTab, (newSection) => {
  router.replace({
    query: {
      ...route.query,
      section: newSection
    }
  })
})

// ----------------------
// TOGGLE PRODUCT FEATURE
// ----------------------
const toggleLoadingMap = ref({})

const teamLoading = ref(false)
const teamError = ref(null)
const team = ref([])

const fetchAdminMembers = async () => {
  teamLoading.value = true
  teamError.value = null

  try {
    const response = await ApiService.get('/get-admin-members', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    team.value = response.data?.admins || []
  } catch (err) {
    teamError.value = err.response?.data?.data.message || 'Failed to load admin members'
  } finally {
    teamLoading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await ApiService.get('/fetch-roles-with-permissions', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    roles.value = response.data.roles.map((role) => ({
      id: role.id,
      title: role.title
    }))
  } catch (err) {
    console.log('Error:', err)
  }
}

const personalTitle = computed(() => {
  const role = roles.value.find((r) => r.id === selectedRoleId.value)
  return role ? `${role.title}` : 'Personal Information'
})

onMounted(async () => {
  selectedRoleId.value = auth.user.role_id

  if (!productsStore.products.length) {
    await productsStore.fetchProducts()
  }

  fetchAdminMembers()
  fetchRoles()
})

// search & filter
const searchQuery = ref('')
const selectedStatus = ref(null)

const statuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    // Filter by status if selected
    const statusMatch = selectedStatus.value ? product.global_status === selectedStatus.value : true

    // Filter by search query (name)
    const searchMatch = searchQuery.value
      ? product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    return statusMatch && searchMatch
  })
})

const goToProduct = (product) => {
  console.log('product:', product)
  router.push({
    name: 'product-details',
    params: { productId: product.id }
  })
}

// ====== Role Update Dialog ======
const showRoleDialog = ref(false)
const selectedAdmin = ref(null)
const selectedNewRoleId = ref(null)
const updatingRole = ref(false)
const roleUpdateError = ref(null)

// Open dialog for a specific admin
const openRoleDialog = (admin) => {
  selectedAdmin.value = admin
  selectedNewRoleId.value = admin.role_id // pre-select current role
  roleUpdateError.value = null
  showRoleDialog.value = true
}

// Update role API call
const updateAdminRole = async () => {
  if (!selectedAdmin.value || !selectedNewRoleId.value) return

  updatingRole.value = true
  roleUpdateError.value = null

  try {
    const payload = {
      admin_id: selectedAdmin.value.id,
      new_role_id: selectedNewRoleId.value
    }

    const response = await ApiService.put('/update-admin-role', payload, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })

    ElNotification({
      type: 'success',
      message: 'Admin role updated successfully',
      duration: 3000
    })

    // update the team array locally
    selectedAdmin.value.role_id = selectedNewRoleId.value
    selectedAdmin.value.role =
      roles.value.find((r) => r.id === selectedNewRoleId.value)?.title || 'Unknown'

    showRoleDialog.value = false
  } catch (err) {
    console.log('❌ Update role error', err)
    roleUpdateError.value = err.response?.data?.data.error || 'Failed to update role'
  } finally {
    updatingRole.value = false
  }
}

// ====== Update Personal Data ======
const updatingProfile = ref(false)
const updateProfileError = ref(null)

const personalData = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: ''
})

watch(
  user,
  (u) => {
    if (!u) return

    personalData.value.firstname = u.firstname
    personalData.value.lastname = u.lastname
    personalData.value.email = u.email
    personalData.value.phone = u.phone
  },
  { immediate: true }
)
// PUT request to update admin data
const updatePersonalData = async () => {
  updatingProfile.value = true
  updateProfileError.value = null

  const payload = {
    id: user.value.id,
    firstname: personalData.value.firstname,
    lastname: personalData.value.lastname,
    email: personalData.value.email,
    phone: personalData.value.phone
  }
  console.log('Payload:', payload)

  try {
    const response = await ApiService.put('/update-admin-data', payload, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    fetchAdminMembers()
    ElNotification({
      type: 'success',
      message: 'Profile updated successfully!',
      duration: 3000
    })

    console.log('RESPONSE:', response)
    // ✅ single source of truth
    await auth.fetchUser()
  } catch (err) {
    console.log('ERROR:', err)

    updateProfileError.value = err.response?.data?.message || 'Failed to update profile'
  } finally {
    updatingProfile.value = false
  }
}

// ====== Update Password ======
const passwordFormRef = ref(null)
const updatingPassword = ref(false)
const updatePasswordError = ref(null)

const passwordData = ref({
  old_password: '',
  password: '',
  password_confirmation: ''
})
const confirmPasswordRule = (v) => v === passwordData.value.password || 'Passwords do not match'

const updatePassword = async () => {
  const { valid } = await passwordFormRef.value.validate()
  if (!valid) return

  updatingPassword.value = true
  updatePasswordError.value = null

  const payload = {
    password: passwordData.value.password,
    password_confirmation: passwordData.value.password_confirmation
  }

  console.group('📤 UPDATE PASSWORD REQUEST')
  console.log('URL:', '/update-admin-password')
  console.log('Payload:', payload)
  console.groupEnd()

  try {
    await ApiService.put('/update-admin-password', payload, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })

    ElNotification({
      type: 'success',
      message: 'Password updated successfully',
      duration: 3000
    })

    // reset fields
    passwordData.value = {
      old_password: '',
      password: '',
      password_confirmation: ''
    }
    await nextTick()
    passwordFormRef.value?.resetValidation()

    passwordFormRef.value.resetValidation()
  } catch (err) {
    console.group('❌ UPDATE PASSWORD ERROR')
    console.log(err)
    console.groupEnd()

    updatePasswordError.value = err.response?.data?.message || 'Failed to update password'
  } finally {
    updatingPassword.value = false
  }
}

// ====== FORGOT / RESET PASSWORD (EMAIL LINK) ======
const resettingPassword = ref(false)

const sendResetPasswordEmail = async () => {
  resettingPassword.value = true

  const payload = {
    email: user.value.email
  }

  console.log('Payload:', payload)

  try {
    await ApiService.post('/forgot-password', payload)

    ElNotification({
      type: 'success',
      message: 'Password reset link sent to your email',
      duration: 3000
    })
  } catch (err) {
    console.log(err)

    ElNotification({
      type: 'error',
      message: err.response?.data?.message || 'Failed to send reset password email'
    })
  } finally {
    resettingPassword.value = false
  }
}

watch(searchQuery, (val) => {
  if (!val) selectedStatus.value = null
})

const toggleAdminStatus = async (member, newStatus) => {
  toggleLoadingMap.value[member.id] = true

  const payload = {
    admin_id: member.id,
    new_status: newStatus
  }

  try {
    await ApiService.put('/update-admin-status', payload, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })

    // ✅ Only update the UI after success
    member.status = newStatus

    ElNotification({
      type: 'success',
      message:
        newStatus === 'active'
          ? 'Admin activated successfully'
          : 'Admin deactivated successfully',
      duration: 2500
    })
  } catch (err) {
    ElNotification({
      type: 'error',
      message: err.response?.data?.data.message || 'Failed to update admin status'
    })
    // No need to revert, because UI never updated yet
  } finally {
    toggleLoadingMap.value[member.id] = false
  }
}




</script>

<template>
  <v-dialog v-model="showCreateDialog" max-width="520" persistent>
    <v-card class="rounded-sm px-6 py-6 relative">
      <!-- CLOSE ICON -->
      <button
        class="absolute top-4 right-4 text-gray-400 hover:text-red-600"
        @click="showCreateDialog = false"
      >
        ✕
      </button>

      <!-- TITLE -->
      <h2 class="text-sm font-bold mb-6">Create New Admin</h2>

      <v-form ref="createFormRef">
        <div class="space-y-4">
          <v-text-field
            label="First Name"
            v-model="newAdmin.firstname"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
          />

          <v-text-field
            label="Last Name"
            v-model="newAdmin.lastname"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
          />

          <v-text-field
            label="Email Address"
            v-model="newAdmin.email"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.email]"
          />

          <v-text-field
            label="Phone Number"
            v-model="newAdmin.phone"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.phone]"
          />

          <v-text-field
            label="Password"
            v-model="newAdmin.password"
            type="password"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.password]"
          />
        </div>

        <!-- ERROR -->
        <p v-if="createError" class="text-red-600 text-sm mt-3">
          {{ createError }}
        </p>

        <!-- ACTIONS -->
        <div class="flex justify-end gap-3 mt-6">
          <v-btn
            color="error"
            variant="plain"
            class="normal-case"
            @click="showCreateDialog = false"
            :disabled="createLoading"
          >
            Cancel
          </v-btn>

          <v-btn
            class="custom-btn text-white normal-case"
            :loading="createLoading"
            @click="createAdmin"
          >
            Create Admin
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
  <MainLayout>
    <div class="p-4 rounded shadow-sm bg-white m-4">
      <div class="items-center border-b p-2 mb-6 flex justify-between">
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
              <i class="fa fa-filter text-[#1F5AA3] pr-2"></i>
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
                v-model="searchQuery"
                placeholder="Search a product"
                density="compact"
                hide-details
                variant="outlined"
                class="w-64 bg-white"
                color="blue"
                prepend-inner-icon="mdi-magnify text-blue"
              >
              </v-text-field>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow overflow-hidden mt-4">
            <div
              v-if="productsLoading"
              class="flex flex-col items-center justify-center min-h-[200px]"
            >
              <LoadingOverlay :visible="productsLoading" message="Loading products..." />
            </div>
            <table v-else class="min-w-full border-collapse">
              <!-- Header -->
              <thead class="bg-gray-50 border-b">
                <tr class="text-left text-sm font-semibold">
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
                  v-for="(product, index) in filteredProducts"
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
                        product.global_status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      "
                    >
                      {{ product.global_status }}
                    </span>
                  </td>

                  <!-- Action -->
                  <td class="px-4 py-3">
                    <button
                      class="px-4 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                      @click="goToProduct(product)"
                    >
                      View
                    </button>
                  </td>

                  <!-- Global Control -->
                  <td class="px-4 py-3">
                    <el-switch
                      v-model="product.global"
                      :loading="toggleLoadingMap[product.id]"
                      :disabled="toggleLoadingMap[product.id]"
                      active-color="#13ce66"
                      inactive-color="#dc2626"
                      @change="() => toggleProductStatus(product)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="account">
          <div class="flex bg-white rounded-lg shadow min-h-[600px]">
            <!-- Sidebar -->
            <aside class="w-64 M-4 bg-blue-50 p-4">
              <ul class="space-y-4">
                <li>
                  <button
                    class="w-full text-left text-sm px-4 py-2 rounded-lg font-medium"
                    :class="
                      activeTab === 'profile'
                        ? 'bg-[#1F5AA3] text-white'
                        : 'text-black-600 hover:bg-gray-100'
                    "
                    @click="activeTab = 'profile'"
                  >
                    Personal Information
                  </button>
                </li>

                <li>
                  <button
                    class="w-full text-left text-sm px-4 py-2 rounded-lg font-medium"
                    :class="
                      activeTab === 'team'
                        ? 'bg-[#1F5AA3] text-white'
                        : 'text-black-600 hover:bg-gray-100'
                    "
                    @click="activeTab = 'team'"
                  >
                    Team
                  </button>
                </li>
              </ul>
            </aside>

            <!-- Content -->
            <main class="flex-1 m-4 p-8">
              <!-- ================= PERSONAL INFORMATION ================= -->
              <!-- ================= PERSONAL INFORMATION ================= -->
              <section v-if="activeTab === 'profile'">
                <div class="flex gap-6">
                  <div class="flex justify-between">
                    <p class="text-sm font-semibold mb-6">Personal Information</p>
                  </div>

                  <v-chip
                    color="primary"
                    label
                    variant="tonal"
                    size="small"
                    class="mb-6 font-semibold"
                  >
                    {{ personalTitle }}
                  </v-chip>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                  <v-text-field
                    readonly
                    disabled
                    v-model="personalData.firstname"
                    label="First Name"
                    variant="outlined"
                    density="comfortable"
                  />
                  <v-text-field
                    readonly
                    disabled
                    v-model="personalData.lastname"
                    label="Last Name"
                    variant="outlined"
                    density="comfortable"
                  />
                  <v-text-field
                    v-model="personalData.phone"
                    label="Phone Number"
                    variant="outlined"
                    density="comfortable"
                  />
                  <v-text-field
                    readonly
                    disabled
                    v-model="personalData.email"
                    label="Email Address"
                    variant="outlined"
                    density="comfortable"
                  />
                </div>

                <p v-if="updateProfileError" class="text-red-600 text-sm mt-3">
                  {{ updateProfileError }}
                </p>

                <div class="mt-8">
                  <v-btn color="primary" :loading="updatingProfile" @click="updatePersonalData">
                    Save Changes
                  </v-btn>
                </div>

                <!-- ================= CHANGE PASSWORD ================= -->
                <div class="mt-12 max-w-3xl">
                  <div class="flex justify-between">
                    <h3 class="text-sm font-semibold mb-4">Change Password</h3>
                    <v-btn
                      variant="text"
                      color="primary"
                      :loading="resettingPassword"
                      @click="sendResetPasswordEmail"
                    >
                      Reset Password
                    </v-btn>
                  </div>

                  <v-form ref="passwordFormRef">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <v-text-field
                        v-model="passwordData.old_password"
                        label="Old Password"
                        type="password"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                      />

                      <div></div>

                      <v-text-field
                        v-model="passwordData.password"
                        label="New Password"
                        type="password"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required, rules.password]"
                      />

                      <v-text-field
                        v-model="passwordData.password_confirmation"
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required, confirmPasswordRule]"
                      />
                    </div>

                    <p v-if="updatePasswordError" class="text-red-600 text-sm mt-3">
                      {{ updatePasswordError }}
                    </p>

                    <div class="mt-6">
                      <v-btn color="primary" :loading="updatingPassword" @click="updatePassword">
                        Update Password
                      </v-btn>
                    </div>
                  </v-form>
                </div>
              </section>

              <!-- ================= TEAM ================= -->
              <section v-else>
                <div class="flex justify-between">
                  <p class="text-sm font-semibold mb-6">Team</p>

                <v-btn
                  @click="showCreateDialog = true"
                  size="mediumi"
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
                
                <div class="overflow-x-auto">
                  <tbody>
  <!-- Loading Skeleton -->
  <template v-if="teamLoading">
    <tr v-for="n in 8" :key="n" class="border-t">
      <td class="px-4 py-3">
        <v-skeleton-loader type="text" :loading="true" class="w-6 h-4 rounded-sm shining" />
      </td>
      <td class="px-4 py-3">
        <v-skeleton-loader type="text" :loading="true"  class="w-32 h-4 rounded-sm shining" />
      </td>
      <td class="px-4 py-3">
        <v-skeleton-loader type="text" :loading="true"  class="w-20 h-4 rounded-sm shining" />
      </td>
      <td class="px-4 py-3">
        <v-skeleton-loader type="text" :loading="true"  class="w-12 h-4 rounded-full shining" />
      </td>
      <td class="px-4 py-3">
        <v-skeleton-loader type="text" :loading="true"  class="w-24 h-4 rounded-sm shining" />
      </td>
    </tr>
  </template>

  <!-- Actual Data -->
  <template v-else>
    <tr v-for="(member, index) in team" :key="member.id" class="border-t text-sm">
      <td class="px-4 py-3">{{ index + 1 }}</td>
      <td class="px-4 py-3">{{ member.firstname + ' ' + member.lastname }}</td>
      <td class="px-4 py-3">
        {{ roles.find((r) => r.id === member.role_id)?.title || 'Unknown Role' }}
      </td>
      <td class="px-4 py-3">
        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="member.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
        >
          {{ member.status }}
        </span>
      </td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-4 text-gray-500">
          <i @click="openRoleDialog(member)" class="fas fa-pen cursor-pointer hover:text-blue-600"></i>
          <el-switch
            :model-value="member.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            :loading="toggleLoadingMap[member.id]"
            :disabled="toggleLoadingMap[member.id]"
            @change="(val) => toggleAdminStatus(member, val)"
          />
          <i class="fas fa-trash cursor-pointer text-red hover:text-red-600"></i>
        </div>
      </td>
    </tr>
  </template>
</tbody>


                  <el-dialog
                    v-model="showRoleDialog"
                    width="400px"
                    :before-close="() => (showRoleDialog = false)"
                  >
                    <div class="space-y-4">
                      <p class="text-sm font-medium">
                        Updating role for
                        <strong
                          >{{ selectedAdmin?.firstname }} {{ selectedAdmin?.lastname }}</strong
                        >
                      </p>

                      <el-select
                        v-model="selectedNewRoleId"
                        placeholder="Select new role"
                        filterable
                        style="width: 100%"
                      >
                        <el-option
                          v-for="role in roles"
                          :key="role.id"
                          :label="role.title"
                          :value="role.id"
                        />
                      </el-select>

                      <p v-if="roleUpdateError" class="text-red-600 text-sm">
                        {{ roleUpdateError }}
                      </p>
                    </div>

                    <template #footer>
                      <el-button @click="showRoleDialog = false">Cancel</el-button>
                      <el-button type="primary" :loading="updatingRole" @click="updateAdminRole">
                        Update Role
                      </el-button>
                    </template>
                  </el-dialog>
                </div>
              </section>
            </main>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="api-keys"></v-tabs-window-item>
      </v-tabs-window>
    </div>
  </MainLayout>
</template>

<style scoped>
.custom-btn {
  background-color: #1f5aa3;
  text-transform: none;
  text-transform: none;
}
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
