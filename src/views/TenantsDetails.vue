<script setup>
import MainLayout from '@/layouts/full/MainLayout.vue'
import { ref } from 'vue'

// Dummy Data
const tenant = ref({
  name: 'Links Microfinance Bank',
  status: 'Active',
  startDate: 'Nov 16, 2020',
  endDate: 'Dec 16, 2020'
})

const usage = ref([
  { title: 'Originate', value: 2 },
  { title: 'Credit Search', value: 2 },
  { title: 'Analyze', value: 0 },
  { title: 'Verify', value: 1 }
])

const permissions = ref([
  { name: 'Loan Origination', enabled: true },
  { name: 'Client Management', enabled: true },
  { name: 'Analyze', enabled: true },
  { name: 'Create Loan', enabled: true },
  { name: 'Credit Search', enabled: true },
  { name: 'Decide', enabled: true },
  { name: 'Logs', enabled: false },
  { name: 'Id Verification', enabled: true }
])

const team = ref([
  { name: 'Adeyemi Williams', status: 'Active', role: 'Owner', date: '25/09/2025' },
  { name: 'Jessica Ifunanya Izegbu', status: 'Active', role: 'Super Admin', date: '25/09/2025' },
  { name: 'Purity Williams', status: 'Active', role: 'Admin', date: '25/09/2025' },
  { name: 'William El-roi Williams', status: 'Inactive', role: 'Operator', date: '25/09/2025' }
])

// Billing Table Dummy Data
const billing = ref([
  { service: 'Loan Origination', price: '200.00' },
  { service: 'BVN Liveliness Check', price: '100.00' },
  { service: 'Bank Statement Analyzer (1 - 100 Pages)', price: '500.00' },
  { service: 'Loan Recommendation', price: '20.00' },
  { service: 'Credit Registry Full Report', price: '250.00' },
  { service: 'CRC Full Report', price: '20.00' },
  { service: 'First Central Full Report', price: '250.00' },
  { service: 'BVN Check', price: '20.00' },
  { service: 'NIN Check', price: '250.00' },
  { service: 'Phone Number Check', price: '20.00' },
  { service: 'Bank Statement Analyzer (101 - 500 Pages)', price: '250.00' }
])

// Usage Logs
const usageLogs = ref([
  { date: '25/09/2025', type: 'BVN Liveliness Check', amount: '500.00', user: 'Akinjo Folashade' },
  {
    date: '25/09/2025',
    type: 'Bank Statement Analysis',
    amount: '100.00',
    user: 'Akinjo Folashade'
  },
  { date: '25/09/2025', type: 'BVN Liveliness Check', amount: '500.00', user: 'Akinjo Folashade' },
  {
    date: '25/09/2025',
    type: 'Bank Statement Analysis',
    amount: '100.00',
    user: 'Akinjo Folashade'
  },
  { date: '25/09/2025', type: 'BVN Liveliness Check', amount: '500.00', user: 'Akinjo Folashade' },
  {
    date: '25/09/2025',
    type: 'Bank Statement Analysis',
    amount: '100.00',
    user: 'Akinjo Folashade'
  },
  { date: '25/09/2025', type: 'BVN Liveliness Check', amount: '500.00', user: 'Akinjo Folashade' },
  {
    date: '25/09/2025',
    type: 'Bank Statement Analysis',
    amount: '100.00',
    user: 'Akinjo Folashade'
  },
  { date: '25/09/2025', type: 'BVN Liveliness Check', amount: '500.00', user: 'Akinjo Folashade' },
  {
    date: '25/09/2025',
    type: 'Bank Statement Analysis',
    amount: '100.00',
    user: 'Akinjo Folashade'
  }
])
</script>

<template>
  <MainLayout>
    <div class="p-6 space-y-6">
      <!-- HEADER -->
      <div class="bg-white p-6 rounded shadow flex justify-between items-center">
        <div class="flex justify-between gap-4">
          <h1 class="text-md font-semibold">{{ tenant.name }}</h1>
          <span class="px-3 py-1 bg-[#A2F8DE] text-green-600 rounded text-xs">{{
            tenant.status
          }}</span>
        </div>

        <v-btn size="small" color="red" variant="flat" class="text-white">
  <template #prepend>
    <i class="fas fa-lock text-white text-sm mr-2"></i>
  </template>
  Deactivate Tenant
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
       
      <div class="bg-white p-4 rounded shadow ">
        <h2 class="font-semibold mb-4 text-sm">Usage</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
          v-for="(item, index) in usage"
          :key="index"
          class="p-6 rounded  shadow-sm"
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
      v-model="item.enabled"
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
            <tr v-for="(member, index) in team" :key="index" class="p-2 hover:bg-blue-50">
              <td class="py-2">{{ member.name }}</td>
              <td>
                <span :class="member.status === 'Active' ? 'text-green-500' : 'text-red-500'">
                  {{ member.status }}
                </span>
              </td>
              <td>{{ member.role }}</td>
              <td>{{ member.date }}</td>
              <td class="text-center space-x-6">
                <i class="fa fa-edit text-gray-500 cursor-pointer"></i>
                <i class="fa fa-play text-green-500 cursor-pointer"></i>
                <i class="fa fa-trash text-red-500 cursor-pointer"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SUBSCRIPTION & BILLING MANAGEMENT -->
      <div class="bg-white p-6 rounded shadow mt-6">
        <h2 class="font-semibold mb-4 text-sm">Subscription and Billing Management</h2>

        <table class="w-full text-sm m-4">
          <thead>
            <tr class="text-semibold">
              <th class="text-left py-2">Service</th>
              <th class="text-left">Unit Price</th>
              <th class="text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in billing" :key="index" class="p-2 hover:bg-blue-50">
              <td class="py-2">{{ item.service }}</td>
              <td>{{ item.price }}</td>
              <td>
                <i class="fa fa-edit text-gray-500 cursor-pointer"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- USAGE TABLE -->
      <div class="bg-white p-6 rounded shadow mt-6">
        <h2 class="font-semibold mb-4 text-sm">Usage</h2>

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