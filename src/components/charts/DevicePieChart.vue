<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'

const props = defineProps({
  distribution: {
    type: Array,
    default: () => []
  }
})

const deviceIcons = {
  desktop: '🖥️',
  mobile: '📱',
  tablet: '📲',
  Desconhecido: '❓'
}

const colors = ['#c084fc', '#38bdf8', '#f472b6', '#a855f7']

const chartData = computed(() => ({
  labels: props.distribution.map(item => `${deviceIcons[item.value] ?? ''} ${item.value}`),
  datasets: [
    {
      data: props.distribution.map(item => item.total),
      backgroundColor: colors,
      borderWidth: 0,
      hoverOffset: 8
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 16,
        usePointStyle: true,
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((context.raw / total) * 100).toFixed(1)
          return `${context.raw} cliques (${percentage}%)`
        }
      }
    }
  }
}

const total = computed(() => props.distribution.reduce((acc, item) => acc + item.total, 0))
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 min-h-0">
      <Doughnut v-if="distribution.length" :data="chartData" :options="options" />
      <div v-else class="h-full flex items-center justify-center text-slate-500">
        Sem dados disponíveis
      </div>
    </div>
    <div class="mt-4 text-center">
      <p class="text-2xl font-semibold text-white">{{ total }}</p>
      <p class="text-xs text-slate-400">Total de cliques</p>
    </div>
  </div>
</template>

