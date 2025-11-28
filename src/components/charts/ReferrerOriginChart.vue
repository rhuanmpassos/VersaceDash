<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'

const props = defineProps({
  distribution: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 10
  }
})

const sourceIcons = {
  'google.com': '🔍',
  'facebook.com': '📘',
  'instagram.com': '📷',
  'twitter.com': '🐦',
  'x.com': '✖️',
  'linkedin.com': '💼',
  'youtube.com': '▶️',
  'tiktok.com': '🎵',
  'whatsapp.com': '💬',
  'Desconhecido': '🔗',
  'Direct': '🎯'
}

const topSources = computed(() => props.distribution.slice(0, props.limit))

const chartData = computed(() => ({
  labels: topSources.value.map(item => {
    const icon = Object.entries(sourceIcons).find(([key]) => 
      item.value.toLowerCase().includes(key.toLowerCase())
    )?.[1] ?? '🔗'
    return `${icon} ${item.value}`
  }),
  datasets: [
    {
      label: 'Cliques',
      data: topSources.value.map(item => item.total),
      backgroundColor: [
        'rgba(56, 189, 248, 0.8)',
        'rgba(192, 132, 252, 0.8)',
        'rgba(244, 114, 182, 0.8)',
        'rgba(52, 211, 153, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(167, 139, 250, 0.8)',
        'rgba(248, 113, 113, 0.8)',
        'rgba(74, 222, 128, 0.8)',
        'rgba(96, 165, 250, 0.8)'
      ],
      borderWidth: 0,
      borderRadius: 6,
      barThickness: 24
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((context.raw / total) * 100).toFixed(1)
          return `${context.raw} cliques (${percentage}%)`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { font: { size: 11 } }
    },
    y: {
      grid: { display: false },
      ticks: { font: { size: 11 } }
    }
  }
}

const totalFromReferrers = computed(() => 
  props.distribution.reduce((acc, item) => acc + item.total, 0)
)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="mb-4">
      <p class="text-lg font-semibold text-white">{{ totalFromReferrers }}</p>
      <p class="text-xs text-slate-400">Cliques com origem identificada</p>
    </div>
    <div class="flex-1 min-h-0">
      <Bar v-if="distribution.length" :data="chartData" :options="options" />
      <div v-else class="h-full flex items-center justify-center text-slate-500">
        Sem dados de origem
      </div>
    </div>
  </div>
</template>

