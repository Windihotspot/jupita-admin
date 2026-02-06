<template>
  <MainLayout class="py-6">
    <!-- Header -->
    <div class="mb-6 bg-white rounded shadow p-6">
      <div class="m-4">
        <h1 class="text-md font-semibold">Dashboard</h1>
        <p class="text-xs text-gray">View what matters</p>
      </div>
      <hr />
      <div v-if="loading" class="flex flex-col items-center justify-center min-h-[200px]">
        <LoadingOverlay :visible="loading" message="Loading dashboard..." />
      </div>
      <div v-else>
        <div class="my-4">
          <!-- Date Filter -->
          <div class="m-4 flex items-center gap-4">
            <i class="fa-solid fa-filter pr-2 text-[#1F5AA3]"></i>

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

            <!-- Chip -->
            <div v-if="dateRangeLabel" class="ml-auto bg-blue-100 p-2 rounded shadow w-max">
              <div class="flex items-center gap-2">
                <i class="fa fa-calendar text-gray-500"></i>
                <span class="text-xs">{{ dateRangeLabel }}</span>
              </div>
            </div>
            <!-- <div
              v-if="dateRangeLabel"
              class="ml-auto bg-blue-100 text-[#1f5aa3] text-sm font-medium px-3 py-1 rounded-md"
            >
              {{ dateRangeLabel }}
            </div> -->
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="p-4 rounded-lg bg-blue-50">
          <p class="text-sm">Total Number of Tenants</p>
          <h2 class="text-sm mt-6 font-bold">{{ stats.total }}</h2>
        </div>
        <div class="p-4 rounded-lg bg-green-50">
          <p class="text-sm">Active Tenants</p>
          <h2 class="text-sm mt-6 font-bold">{{ stats.active }}</h2>
        </div>
        <div class="p-4 rounded-lg bg-pink-50">
          <p class="text-sm">Inactive Tenants</p>
          <h2 class="text-sm mt-6 font-bold">{{ stats.inactive }}</h2>
        </div>
        <div class="p-4 rounded-lg bg-orange-50">
          <p class="text-sm">Tenants Pending Approval</p>
          <h2 class="text-sm mt-6 font-bold">{{ stats.pending }}</h2>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white p-4 rounded-lg shadow">
        <!-- Date Filter -->
        <div class="my-4 flex items-center gap-4">
          <i class="fa-solid fa-filter pr-2 text-[#1F5AA3]"></i>

          <!-- products-->
          <el-select
            v-model="selectedProductName"
            size="large"
            placeholder="Filter by product"
            clearable
            style="width: 200px"
            class="flex justify-end"
          >
            <el-option v-for="cls in products" :key="cls.id" :label="cls.name" :value="cls.name" />
          </el-select>
        </div>
        <apexchart
          :key="chartKey"
          type="bar"
          :options="chartOptions"
          :series="chartSeries"
          height="350"
        />
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
  Analyze: 'periculum_analysis',
  'Credit Search': 'credit_history',
  Originate: 'loan',
  Verify: 'id_verification'
}

// ───────────────────────────────
// DASHBOARD STATS
// ───────────────────────────────

const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  pending: 0,
  rawStats: {}
})

// ───────────────────────────────
// CHART STATE
// ───────────────────────────────
const chartOptions = reactive({
  chart: { id: 'dashboard-chart' },
  colors: ['#1f5aa3'],
  plotOptions: {
    bar: {
      columnWidth: '10%',
      borderRadius: 4
    }
  },
  dataLabels: {
    enabled: false,
    position: 'top',
    style: { fontSize: '12px', colors: ['#000'] }
  },
  xaxis: {
    categories: [],
    labels: {
      show: true,
      rotate: -45,
      trim: false,
      style: {
        fontSize: '12px'
      }
    }
  },
  yaxis: { show: true },
  grid: { yaxis: { lines: { show: false } } }
})

const chartKey = ref(0)

const chartSeries = reactive([{ name: 'Count', data: [] }])

const buildChartFromStats = () => {
  if (!selectedProductName.value) return

  const backendKey = productMap[selectedProductName.value]
  const categories = []
  const data = []

  Object.entries(stats.rawStats).forEach(([tenantName, products]) => {
    categories.push(tenantName)
    data.push(products?.[backendKey] ?? 0)
  })

  Object.assign(chartOptions.xaxis, { categories })

  chartSeries.splice(0, 1, {
    name: selectedProductName.value,
    data
  })

  chartKey.value++ // 🔥 FORCE RE-RENDER
}

const dateRangeLabel = ref('')

watch(selectedProductName, (newVal) => {
  if (!newVal) {
    chartSeries.splice(0, 1, { name: '', data: [] })
    return
  }

  buildChartFromStats()
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
    const d = res.data
    console.log('Dashboard fetch dashboard data by date:', res)
    // summary cards
    stats.total = d.tenants
    stats.active = d.active_tenants
    stats.inactive = d.inactive_tenants
    stats.pending = 0

    // store raw stats
    stats.rawStats = d.stats || {}

    // default product
    if (!selectedProductName.value) {
      selectedProductName.value = 'Analyze'
    }

    buildChartFromStats()
  } catch (err) {
    console.log('Dashboard fetch error:', err)
  } finally {
    loading.value = false
  }
}

watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    dateRangeLabel.value = `${moment(newStart).format('DD MMM YYYY')} - ${moment(newEnd).format('DD MMM YYYY')}`
  } else {
    dateRangeLabel.value = ''
  }
})

onMounted(() => {
  // Default last 1 year
  const today = moment()
  const oneYearAgo = moment().subtract(1, 'year')

  startDate.value = oneYearAgo.toDate()
  endDate.value = today.toDate()

  // Update chip label
  dateRangeLabel.value = `${oneYearAgo.format('DD MMM YYYY')} - ${today.format('DD MMM YYYY')}`

  // Fetch dashboard data from API (ignores store)
  fetchDashboardData()
})

</script>


<style scoped>
.div{
  
}
</style>