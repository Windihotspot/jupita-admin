<template>
  <MainLayout class="py-6">
    <!-- Header -->
    <div class="mb-6 bg-white rounded shadow p-6">
      <div class="m-4">
        <h1 class="text-md font-semibold">Dashboard</h1>
        <p class="text-xs text-gray">View what matters</p>
      </div>

      <hr>

      <div v-if="loading" class="flex flex-col items-center justify-center min-h-[200px]">
    
         <LoadingOverlay :visible="loading" message="Loading dashboard..." />
      </div>
      <div v-else>
        <div class="m-4">
      

        <!-- Date Filter -->
        <div class="m-4 flex items-center gap-4">
  <i class="fa-solid fa-filter pr-4"></i>

  <!-- Start Date -->
  <el-date-picker
    v-model="startDate"
    type="date"
    placeholder="Start date"
    :default-value="null"
    @change="fetchDashboardData"
  />

  <!-- End Date -->
  <el-date-picker
    v-model="endDate"
    type="date"
    placeholder="End date"
    :default-value="null"
    @change="fetchDashboardData"
  />
</div>

      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="p-4 rounded-lg bg-[#EAF2FF]">
        <p class="text-gray-700">Total Number of Tenants</p>
        <h2 class="text-xl mt-6 font-bold">{{ stats.total }}</h2>
      </div>
      <div class="p-4 rounded-lg bg-[#F6FBF5]">
        <p class="text-gray-700">Active Tenants</p>
        <h2 class="text-xl mt-6 font-bold">{{ stats.active }}</h2>
      </div>
      <div class="p-4 rounded-lg bg-[#F9EAF1]">
        <p class="text-gray-700">Inactive Tenants</p>
        <h2 class="text-xl mt-6 font-bold">{{ stats.inactive }}</h2>
      </div>
      <div class="p-4 rounded-lg bg-[#FCF3EA]">
        <p class="text-gray-700">Tenants Pending Approval</p>
        <h2 class="text-xl mt-6 font-bold">{{ stats.pending }}</h2>
      </div>
    </div>

    <!-- Chart -->
    <div class="bg-white p-4 rounded-lg shadow">
      <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="350" />
    </div>
      </div>

      

  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import moment from 'moment'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ApiService from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
auth.hydrate() // restore store data on page load

const loading = ref(false)

// ───────────────────────────────
// DATE RANGE
// ───────────────────────────────
const dateRange = ref([null, null]) // empty initially, fetch only on user select

const shortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  },
  {
    text: 'Last 3 months',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  }
]

const startDate = ref("")
const endDate = ref("")

// watch(dateRange, () => {
//   if (!dateRange.value[0] || !dateRange.value[1]) return
//   startDate.value = moment(dateRange.value[0]).format("DD/MM/YYYY")
//   endDate.value = moment(dateRange.value[1]).format("DD/MM/YYYY")
// }, { immediate: false })

// ───────────────────────────────
// DASHBOARD STATE
// ───────────────────────────────
const stats = reactive({
  total: auth.tenants,
  active: auth.active_tenants,
  inactive: auth.inactive_tenants,
  pending: 0
})

const chartOptions = reactive({
  chart: { id: 'dashboard-chart' },
  colors: ['#1e40af'],
  plotOptions: {
    bar: {
      columnWidth: '10%', // thinner bars
      distributed: false
    }
  },
  dataLabels: {
    enabled: true,
    position: 'top',   // show count on top of bars
    style: {
      fontSize: '12px',
      colors: ['#000']
    }
  },
  xaxis: {
    categories: [],     // your business names
   
   
  },
  yaxis: {
    show: false        // hide the y-axis labels
  },
  grid: {
    yaxis: { lines: { show: false } }  // optional: remove horizontal grid lines
  }
})

const chartSeries = reactive([
  {
    name: 'Count',
    data: []
  }
])

// initialize chart from store
const merged = [
  ...(auth.analysis || []),
  ...(auth.loans || []),
  ...(auth.id_verification || []),
  ...(auth.credit_history || [])
]


chartOptions.xaxis.categories = merged.map(i => i.business_name)
chartSeries[0].data = merged.map(i => i.count)

// ───────────────────────────────
// FETCH DASHBOARD DATA BY DATE
// ───────────────────────────────
const fetchDashboardData = async () => {
  if (!startDate.value || !endDate.value) return

  loading.value = true
  const payload = {
    start_date: moment(startDate.value).format('DD/MM/YYYY'),
    end_date: moment(endDate.value).format('DD/MM/YYYY')
  }
  console.log('dashboard data by date payload:', payload)

  try {
    const res = await ApiService.post('/filter-dashboard-data-by-date', payload)
    console.log('dashboard data by date response:', res)
    const d = res.data

    stats.total = d.tenants
    stats.active = d.active_tenants
    stats.inactive = d.inactive_tenants
    stats.pending = 0

    const merged = [
      ...(d.analysis || []),
      ...(d.loans || []),
      ...(d.id_verification || []),
      ...(d.credit_history || [])
    ]

    chartOptions.xaxis.categories = merged.map(i => i.business_name)
    chartSeries[0].data = merged.map(i => i.count)
  } catch (err) {
    console.log('Dashboard fetch error:', err)
  } finally {
    loading.value = false
  }
}


</script>
