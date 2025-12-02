<template>
  <MainLayout class="py-6">
    <!-- Header -->
    <div class="mb-6 bg-white rounded shadow p-6">
      <div class="m-4">
        <h1 class="text-md font-semibold">Dashboard</h1>
        <p class="text-xs text-gray">View what matters</p>
      </div>

      <hr>
      <div class="m-4">
        <!-- Date Filter -->
        <i class="fa-solid fa-filter"></i>

        <el-date-picker type="date" placeholder="Start date" class="w-20 m-2" size="small" />
        <el-date-picker type="date" placeholder="End date" class="w-20 m-2" size="small" />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="p-4 rounded-lg bg-blue-100">
        <p class="text-gray-700">Total Number of Tenants</p>
        <h2 class="text-2xl mt-6 font-bold">{{ stats.total }}</h2>
      </div>
      <div class="p-4 rounded-lg bg-green-100">
        <p class="text-gray-700">Active Tenants</p>
        <h2 class="text-2xl mt-6 font-bold">{{ stats.active }}</h2>
      </div>
      <div class="p-4 rounded-lg bg-red-100">
        <p class="text-gray-700">Inactive Tenants</p>
        <h2 class="text-2xl mt-6 font-bold">{{ stats.inactive }}</h2>
      </div>
      <div class="p-4 rounded-lg bg-yellow-100">
        <p class="text-gray-700">Tenants Pending Approval</p>
        <h2 class="text-2xl mt-6 font-bold">{{ stats.pending }}</h2>
      </div>
    </div>

    <!-- Chart -->
    <div class="bg-white p-4 rounded-lg shadow">
      <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="350" />
    </div>
  </MainLayout>
</template>

<script setup>
import { reactive } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import ApexCharts from 'vue3-apexcharts'

// Register ApexCharts globally if needed
// app.component('apexchart', ApexCharts)

const stats = reactive({
  total: 2,
  active: 2,
  inactive: 0,
  pending: 1
})

// ApexCharts data
const chartOptions = reactive({
  chart: {
    id: 'tenants-chart',
    toolbar: {
      show: true
    }
  },
  xaxis: {
    categories: [
      'Seamless HR',
      'Sofri Trust MFB',
      'Ace MFB',
      'Rex Credit',
      'Shara Technology',
      'Sprout Technology',
      'Rex Credit',
      'Shara Technology'
    ],
    axisBorder: {
      show: true
    },
    axisTicks: {
      show: true
    }
  },
  yaxis: {
    title: {
      text: 'Value'
    }
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    enabled: true
  },
  grid: {
    borderColor: '#e0e0e0',
    xaxis: {
      lines: {
        show: false // <-- hide vertical lines (grid lines along X-axis)
      }
    },
    yaxis: {
      lines: {
        show: false // <-- keep horizontal lines if you want
      }
    }
  },
  colors: ['#1e40af']
})

const chartSeries = reactive([
  {
    name: 'Value',
    data: [30, 90, 30, 30, 90, 30, 30, 90]
  }
])
</script>

<style scoped>
/* Optional custom spacing */
</style>
