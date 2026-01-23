<script setup>
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { ElNotification, ElMessageBox, ElTooltip, ElDialog } from 'element-plus'
import ApiService from '@/services/api'
import { ref, onMounted, computed, nextTick } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
const tab = ref('products')
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const user = auth?.user
console.log('user:', user)
const productsLoading = ref(false)
const productsError = ref(null)
const products = ref([])

const fetchProducts = async () => {
  productsLoading.value = true
  productsError.value = null

  console.group('📤 GET PRODUCTS REQUEST')
  console.log('URL:', '/get-products')
  console.log('Method:', 'GET')
  console.groupEnd()

  try {
    const response = await ApiService.get('/get-products', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    console.group('📥 GET PRODUCTS RESPONSE')
    console.log('Status:', response.status)
    console.log('Data:', response.data)
    console.groupEnd()

    const rawProducts = response.data?.products || response.data || []

    products.value = rawProducts.map((product) => ({
      ...product,
      global: product.global_status === 'active'
    }))
  } catch (err) {
    console.group('❌ GET PRODUCTS ERROR')
    console.log('Status:', err.response?.status)
    console.log('Data:', err.response?.data)
    console.log('Error:', err)
    console.groupEnd()

    productsError.value = err.response?.data?.message || 'Failed to load products'
  } finally {
    productsLoading.value = false
  }
}

const toggleProductStatus = async (product) => {
  const previousGlobal = product.global
  const newStatus = product.global ? 'active' : 'inactive'

  toggleLoadingMap.value[product.id] = true
  const payload = {
    product_id: product.id,
    status: newStatus
  }
  console.log('payload:', payload)
  try {
    await ApiService.put('/toggle-product-status', payload, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    // sync UI with backend response
    product.global_status = newStatus

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
    // rollback UI on failure
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
    console.group('📥 CREATE ADMIN RESPONSE')
    console.log('Status:', response.status)
    console.log('Data:', response.data)
    console.groupEnd()

    showCreateDialog.value = false
    resetCreateForm()
    // optionally refresh admins list here
  } catch (err) {
    console.group('❌ CREATE ADMIN ERROR')
    console.log('Status:', err.response?.status)
    console.log('Data:', err.response?.data)
    console.log('Error:', err)
    console.groupEnd()

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
const activeTab = ref('profile')

const roles = ref([])
const selectedRoleId = ref(null)

const profile = ref({
  fullname: 'Williams Adeyemi',
  phone: '09065512525',
  email: 'wadeyemi@getjupita.com',
  role: 'Super Admin'
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

  console.group('📤 GET ADMIN MEMBERS REQUEST')
  console.log('URL:', '/get-admin-members')
  console.log('Method:', 'GET')
  console.groupEnd()

  try {
    const response = await ApiService.get('/get-admin-members', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    console.group('📥 GET ADMIN MEMBERS RESPONSE')
    console.log('Status:', response.status)
    console.log('Data:', response.data)
    console.groupEnd()

    team.value = response.data?.admins || []
  } catch (err) {
    console.group('❌ GET ADMIN MEMBERS ERROR')
    console.log('Status:', err.response?.status)
    console.log('Data:', err.response?.data)
    console.log('Error:', err)
    console.groupEnd()

    teamError.value = err.response?.data?.message || 'Failed to load admin members'
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
    console.log('roles response:', response)
    roles.value = response.data.roles.map((role) => ({
      id: role.id,
      title: role.title
    }))
    console.log('Roles:', roles.value)
  } catch (err) {
    console.log('Error:', err)
    console.groupEnd()
  }
}

const personalTitle = computed(() => {
  const role = roles.value.find((r) => r.id === selectedRoleId.value)
  return role ? `${role.title}` : 'Personal Information'
})

onMounted(async () => {
  selectedRoleId.value = auth.user.role_id
  await fetchProducts()
  fetchAdminMembers()
  fetchRoles()
})

const goToProduct = (product) => {
  router.push({
    name: 'product-details',
    params: {
      productId: product.id
    }
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
    roleUpdateError.value = err.response?.data?.message || 'Failed to update role'
  } finally {
    updatingRole.value = false
  }
}

// ====== Update Personal Data ======
const updatingProfile = ref(false)
const updateProfileError = ref(null)

const personalData = ref({
  firstname: user?.firstname || '',
  lastname: user?.lastname || '',
  email: user?.email || '',
  phone: user?.phone || ''
})

// PUT request to update admin data
const updatePersonalData = async () => {
  updatingProfile.value = true
  updateProfileError.value = null

  const payload = {
    id: user.id,
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

    ElNotification({
      type: 'success',
      message: 'Profile updated successfully!',
      duration: 3000
    })
    fetchAdminMembers()
    console.log('RESPONSE:', response)
    // Update local auth user info
    auth.user.firstname = personalData.value.firstname
    auth.user.lastname = personalData.value.lastname
    auth.user.email = personalData.value.email
    auth.user.phone = personalData.value.phone
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

        <v-btn
          @click="showCreateDialog = true"
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
                class="w-64 bg-white"
                prepend-inner-icon="fa-solid fa-search text-gray text-sm"
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
                  <p class="text-sm font-semibold mb-6">Personal Information</p>
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
                    v-model="personalData.firstname"
                    label="First Name"
                    variant="outlined"
                    density="comfortable"
                  />
                  <v-text-field
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
                  <h3 class="text-sm font-semibold mb-4">Change Password</h3>

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
                <p class="text-sm font-semibold mb-6">Team</p>

                <div class="overflow-x-auto">
                  <table class="min-w-full border rounded-lg overflow-hidden">
                    <thead class="bg-gray-100">
                      <tr class="text-left text-sm font-semibold text-gray-600">
                        <th class="px-4 py-3">S/N</th>
                        <th class="px-4 py-3">Full Name</th>
                        <th class="px-4 py-3">Role</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3"></th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="(member, index) in team" :key="member.id" class="border-t text-sm">
                        <td class="px-4 py-3">{{ index + 1 }}</td>
                        <td class="px-4 py-3">{{ member.firstname + ' ' + member.lastname }}</td>
                        <td class="px-4 py-3">
                          {{ roles.find((r) => r.id === member.role_id)?.title || 'Unknown Role' }}
                        </td>

                        <td class="px-4 py-3">
                          <span
                            class="px-3 py-1 rounded-full text-xs font-medium"
                            :class="
                              member.status === 'active'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            "
                          >
                            {{ member.status }}
                          </span>
                        </td>

                        <td class="px-4 py-3">
                          <div class="flex items-center gap-4 text-gray-500">
                            <i
                              @click="openRoleDialog(member)"
                              class="fas fa-pen cursor-pointer hover:text-blue-600"
                            ></i>
                            <el-switch />
                            <i class="fas fa-trash cursor-pointer text-red hover:text-red-600"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <el-dialog
                    v-model="showRoleDialog"
                    title="Update Admin Role"
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
