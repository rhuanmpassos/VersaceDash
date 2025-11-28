<script setup>
import { computed } from 'vue'

const props = defineProps({
  hourlyDistribution: {
    type: Array,
    default: () => []
  },
  dayOfWeekDistribution: {
    type: Array,
    default: () => []
  }
})

const maxHourly = computed(() => Math.max(...props.hourlyDistribution.map(h => h.total), 1))
const maxDaily = computed(() => Math.max(...props.dayOfWeekDistribution.map(d => d.total), 1))

const getHourlyIntensity = (total) => {
  const ratio = total / maxHourly.value
  if (ratio === 0) return 'bg-white/5'
  if (ratio < 0.25) return 'bg-purple-900/50'
  if (ratio < 0.5) return 'bg-purple-700/60'
  if (ratio < 0.75) return 'bg-purple-500/70'
  return 'bg-purple-400/80'
}

const getDailyIntensity = (total) => {
  const ratio = total / maxDaily.value
  if (ratio === 0) return 'bg-white/5'
  if (ratio < 0.25) return 'bg-fuchsia-900/50'
  if (ratio < 0.5) return 'bg-fuchsia-700/60'
  if (ratio < 0.75) return 'bg-fuchsia-500/70'
  return 'bg-fuchsia-400/80'
}

const peakHour = computed(() => {
  if (!props.hourlyDistribution.length) return null
  return props.hourlyDistribution.reduce((max, h) => h.total > max.total ? h : max)
})

const peakDay = computed(() => {
  if (!props.dayOfWeekDistribution.length) return null
  return props.dayOfWeekDistribution.reduce((max, d) => d.total > max.total ? d : max)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Hourly Heatmap -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-slate-300">Por Hora do Dia</h4>
        <span v-if="peakHour" class="text-xs text-purple-300">
          Pico: {{ peakHour.label }} ({{ peakHour.total }} cliques)
        </span>
      </div>
      <div class="flex gap-1 flex-wrap">
        <div
          v-for="hour in hourlyDistribution"
          :key="hour.hour"
          class="w-8 h-10 rounded flex flex-col items-center justify-center transition-all hover:scale-110 cursor-default"
          :class="getHourlyIntensity(hour.total)"
          :title="`${hour.label}: ${hour.total} cliques`"
        >
          <span class="text-[10px] text-slate-300">{{ hour.hour }}</span>
          <span class="text-[9px] text-slate-400">{{ hour.total }}</span>
        </div>
      </div>
    </div>

    <!-- Day of Week -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-slate-300">Por Dia da Semana</h4>
        <span v-if="peakDay" class="text-xs text-fuchsia-300">
          Pico: {{ peakDay.label }} ({{ peakDay.total }} cliques)
        </span>
      </div>
      <div class="grid grid-cols-7 gap-2">
        <div
          v-for="day in dayOfWeekDistribution"
          :key="day.day"
          class="h-16 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 cursor-default"
          :class="getDailyIntensity(day.total)"
          :title="`${day.label}: ${day.total} cliques`"
        >
          <span class="text-sm font-medium text-slate-200">{{ day.label }}</span>
          <span class="text-xs text-slate-400">{{ day.total }}</span>
        </div>
      </div>
    </div>

    <div v-if="!hourlyDistribution.length && !dayOfWeekDistribution.length" 
         class="h-full flex items-center justify-center text-slate-500 py-8">
      Sem dados de distribuição temporal
    </div>
  </div>
</template>

