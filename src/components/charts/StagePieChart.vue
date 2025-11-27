<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'

const props = defineProps({
  distribution: {
    type: Array,
    default: () => [],
  },
})

const colors = ['#c084fc', '#a855f7', '#6366f1', '#f472b6']

const chartData = computed(() => ({
  labels: props.distribution.map((item) => item.label),
  datasets: [
    {
      label: 'Leads',
      backgroundColor: colors,
      data: props.distribution.map((item) => item.total),
      borderWidth: 0,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 12,
        font: {
          size: 12,
        },
      },
    },
  },
}
</script>

<template>
  <div class="h-full">
    <Pie :data="chartData" :options="options" />
  </div>
</template>

