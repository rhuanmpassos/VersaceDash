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

const countryFlags = {
  BR: '🇧🇷',
  US: '🇺🇸',
  PT: '🇵🇹',
  AR: '🇦🇷',
  CL: '🇨🇱',
  MX: '🇲🇽',
  CO: '🇨🇴',
  PE: '🇵🇪',
  ES: '🇪🇸',
  UK: '🇬🇧',
  DE: '🇩🇪',
  FR: '🇫🇷',
  IT: '🇮🇹',
  CA: '🇨🇦',
  AU: '🇦🇺',
  Desconhecido: '🌍'
}

const topCountries = computed(() => props.distribution.slice(0, props.limit))

const chartData = computed(() => ({
  labels: topCountries.value.map(item => `${countryFlags[item.value] ?? '🌍'} ${item.value}`),
  datasets: [
    {
      label: 'Cliques',
      data: topCountries.value.map(item => item.total),
      backgroundColor: 'rgba(192, 132, 252, 0.8)',
      borderColor: '#c084fc',
      borderWidth: 1,
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
        label: (context) => `${context.raw} cliques`
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
</script>

<template>
  <div class="h-full">
    <Bar v-if="distribution.length" :data="chartData" :options="options" />
    <div v-else class="h-full flex items-center justify-center text-slate-500">
      Sem dados de países
    </div>
  </div>
</template>

