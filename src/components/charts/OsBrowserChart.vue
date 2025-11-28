<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'

const props = defineProps({
  osDistribution: {
    type: Array,
    default: () => []
  },
  browserDistribution: {
    type: Array,
    default: () => []
  }
})

const osIcons = {
  Windows: '🪟',
  macOS: '🍎',
  Android: '🤖',
  iOS: '📱',
  Linux: '🐧',
  Desconhecido: '❓'
}

const browserIcons = {
  Chrome: '🌐',
  Firefox: '🦊',
  Safari: '🧭',
  Edge: '🌀',
  Opera: '⭕',
  Desconhecido: '❓'
}

const topOS = computed(() => props.osDistribution.slice(0, 6))
const topBrowsers = computed(() => props.browserDistribution.slice(0, 6))

const osChartData = computed(() => ({
  labels: topOS.value.map(item => `${osIcons[item.value] ?? '❓'} ${item.value}`),
  datasets: [
    {
      label: 'Cliques',
      data: topOS.value.map(item => item.total),
      backgroundColor: [
        'rgba(56, 189, 248, 0.8)',
        'rgba(192, 132, 252, 0.8)',
        'rgba(52, 211, 153, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(244, 114, 182, 0.8)',
        'rgba(167, 139, 250, 0.8)'
      ],
      borderWidth: 0,
      borderRadius: 6
    }
  ]
}))

const browserChartData = computed(() => ({
  labels: topBrowsers.value.map(item => `${browserIcons[item.value] ?? '❓'} ${item.value}`),
  datasets: [
    {
      label: 'Cliques',
      data: topBrowsers.value.map(item => item.total),
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(56, 189, 248, 0.8)',
        'rgba(52, 211, 153, 0.8)',
        'rgba(244, 114, 182, 0.8)',
        'rgba(167, 139, 250, 0.8)'
      ],
      borderWidth: 0,
      borderRadius: 6
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { 
        font: { size: 10 },
        maxRotation: 45,
        minRotation: 45
      }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { font: { size: 10 } }
    }
  }
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
    <div class="flex flex-col">
      <h4 class="text-sm font-medium text-slate-300 mb-3">Sistema Operacional</h4>
      <div class="flex-1 min-h-[180px]">
        <Bar v-if="osDistribution.length" :data="osChartData" :options="chartOptions" />
        <div v-else class="h-full flex items-center justify-center text-slate-500 text-sm">
          Sem dados
        </div>
      </div>
    </div>
    <div class="flex flex-col">
      <h4 class="text-sm font-medium text-slate-300 mb-3">Navegador</h4>
      <div class="flex-1 min-h-[180px]">
        <Bar v-if="browserDistribution.length" :data="browserChartData" :options="chartOptions" />
        <div v-else class="h-full flex items-center justify-center text-slate-500 text-sm">
          Sem dados
        </div>
      </div>
    </div>
  </div>
</template>

