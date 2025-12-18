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
      <!-- Date Filter -->
        <div class="m-4 flex items-center gap-4">
  <i class="fa-solid fa-filter pr-4"></i>

  <!-- products-->
         <el-select
                      v-model="selectedProductName"
                      size="large"
                      placeholder="Filter by product"
                      clearable
                      style="width: 200px"
                      class="flex justify-end"
                    >
                      <el-option
                        v-for="cls in products"
                        :key="cls.id"
                        :label="cls.name"
                        :value="cls.name"
                      />
                    </el-select>
</div>
      <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="350" />
    </div>
      </div>

      

  </MainLayout>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import moment from 'moment'
import MainLayout from '@/layouts/full/MainLayout.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ApiService from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// ───────────────────────────────
// AUTH STORE
// ───────────────────────────────
const auth = useAuthStore()
auth.hydrate() // restore store data on page load

// ───────────────────────────────
// LOADING STATE
// ───────────────────────────────
const loading = ref(false)

// ───────────────────────────────
// DATE FILTERS
// ───────────────────────────────
const startDate = ref('')
const endDate = ref('')

// ───────────────────────────────
// PRODUCTS
// ───────────────────────────────
const selectedProductName = ref('')
const products = [
  { id: 1, name: 'Analyze' },
  { id: 2, name: 'Credit Search' },
  { id: 3, name: 'Originate' },
  { id: 4, name: 'Verify' }
]

// Map frontend product names to backend keys
const productMap = {
  'Analyze': 'analysis',
  'Credit Search': 'credit_history',
  'Originate': 'loans',
  'Verify': 'id_verification'
}

// ───────────────────────────────
// DASHBOARD STATS
// ───────────────────────────────
const stats = reactive({
  total: auth.tenants,
  active: auth.active_tenants,
  inactive: auth.inactive_tenants,
  pending: 0,
  analysis: auth.analysis || [],
  loans: auth.loans || [],
  id_verification: auth.id_verification || [],
  credit_history: auth.credit_history || []
})

// ───────────────────────────────
// CHART STATE
// ───────────────────────────────
const chartOptions = reactive({
  chart: { id: 'dashboard-chart' },
  colors: ['#1e40af'],
   plotOptions: {
    bar: {
      columnWidth: '5%', // default is '70%', smaller % = thinner bars
      distributed: false,  // if you want each bar a different color
      borderRadius: 4     // optional, rounds corners
    }
  },
  dataLabels: {
    enabled: false,
    position: 'top',
    style: { fontSize: '12px', colors: ['#000'] }
  },
  xaxis: { categories: [] },
  yaxis: { show: false },
  grid: { yaxis: { lines: { show: false } } }
})

const chartSeries = reactive([{ name: 'Count', data: [] }])

// ───────────────────────────────
// INITIAL CHART (all products merged)
// ───────────────────────────────
const mergeAllProducts = () => {
  return [
    ...(stats.analysis || []),
    ...(stats.loans || []),
    ...(stats.id_verification || []),
    ...(stats.credit_history || [])
  ]
}

const setChartData = (dataArray) => {
  // Replace the entire xaxis object so ApexCharts detects the change
  chartOptions.xaxis = {
    ...chartOptions.xaxis,
    categories: dataArray.map(i => i.business_name)
  }

  // Replace the series entirely to force re-render
  chartSeries.splice(0, chartSeries.length, { name: 'Count', data: dataArray.map(i => i.count) })
}


// initialize chart
setChartData(mergeAllProducts())

// ───────────────────────────────
// UPDATE CHART BASED ON PRODUCT SELECTION
// ───────────────────────────────
const updateChartByProduct = () => {
  if (!selectedProductName.value) {
    setChartData(mergeAllProducts())
    return
  }
  const key = productMap[selectedProductName.value]
  const productData = stats[key] || []
  setChartData(productData)
}

// Watch product selection
watch(selectedProductName, () => {
  updateChartByProduct()
})

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

  try {
    const res = await ApiService.post('/filter-dashboard-data-by-date', payload)
    console.log("filter dashboard by date:", res)
    const d = res.data
    
    // Update totals
    stats.total = d.tenants
    stats.active = d.active_tenants
    stats.inactive = d.inactive_tenants
    stats.pending = 0

    // Update product arrays
    stats.analysis = d.analysis || []
    stats.loans = d.loans || []
    stats.id_verification = d.id_verification || []
    stats.credit_history = d.credit_history || []

     // If no product selected, default to 'Analyze'
    if (!selectedProductName.value) {
      selectedProductName.value = 'Analyze'
    } else {
      updateChartByProduct()
    }
  } catch (err) {
    console.error('Dashboard fetch error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Determine default product based on available data
  if (stats.analysis?.length) {
    selectedProductName.value = 'Analyze'
  } else if (stats.credit_history?.length) {
    selectedProductName.value = 'Credit Search'
  } else if (stats.loans?.length) {
    selectedProductName.value = 'Originate'
  } else if (stats.id_verification?.length) {
    selectedProductName.value = 'Verify'
  }

  // Initialize chart with the selected product
  updateChartByProduct()
})


</script>

