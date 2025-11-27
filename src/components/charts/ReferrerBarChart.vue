<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'

const props = defineProps({
  referrers: {
    type: Array,
    default: () => [],
  },
})

const chartData = computed(() => ({
  labels: props.referrers.map((item) => item.name ?? item.referralCode),
  datasets: [
    {
      label: 'Leads indicados',
      backgroundColor: '#a855f7',
      borderRadius: 8,
      data: props.referrers.map((item) => item.total),
    },
  ],
}))

const options = {
  responsive: true,
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
  <Bar :data="chartData" :options="options" />
</template>

