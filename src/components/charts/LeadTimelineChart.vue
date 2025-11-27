<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

const props = defineProps({
  timeline: {
    type: Array,
    default: () => [],
  },
})

const chartData = computed(() => ({
  labels: props.timeline.map((item) => item.dateLabel ?? item.date),
  datasets: [
    {
      label: 'Novos leads',
      fill: true,
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
      borderColor: '#c084fc',
      tension: 0.4,
      data: props.timeline.map((item) => item.total),
    },
  ],
}))

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      ticks: { precision: 0 },
      grid: { color: 'rgba(255,255,255,0.08)' },
    },
  },
}
</script>

<template>
  <Line :data="chartData" :options="options" />
</template>

