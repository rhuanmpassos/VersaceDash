<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

const props = defineProps({
  timeline: {
    type: Array,
    default: () => []
  }
})

const chartData = computed(() => ({
  labels: props.timeline.map(item => item.dateLabel),
  datasets: [
    {
      label: 'Cliques',
      data: props.timeline.map(item => item.total),
      borderColor: '#c084fc',
      backgroundColor: 'rgba(192, 132, 252, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#c084fc',
      pointBorderColor: '#0e0b14',
      pointBorderWidth: 2
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(14, 11, 20, 0.95)',
      titleColor: '#f5f3ff',
      bodyColor: '#c084fc',
      borderColor: '#322140',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        title: (items) => items[0]?.label ?? '',
        label: (context) => `${context.raw} cliques`
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { 
        font: { size: 11 },
        maxTicksLimit: 10
      }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { font: { size: 11 } },
      beginAtZero: true
    }
  }
}

const totalClicks = computed(() => props.timeline.reduce((acc, item) => acc + item.total, 0))
const avgPerDay = computed(() => {
  if (!props.timeline.length) return 0
  return Math.round(totalClicks.value / props.timeline.length)
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-6">
        <div>
          <p class="text-2xl font-semibold text-white">{{ totalClicks }}</p>
          <p class="text-xs text-slate-400">Total no período</p>
        </div>
        <div>
          <p class="text-2xl font-semibold text-fuchsia-300">{{ avgPerDay }}</p>
          <p class="text-xs text-slate-400">Média/dia</p>
        </div>
      </div>
    </div>
    <div class="flex-1 min-h-0">
      <Line v-if="timeline.length" :data="chartData" :options="options" />
      <div v-else class="h-full flex items-center justify-center text-slate-500">
        Sem dados de cliques no período
      </div>
    </div>
  </div>
</template>

