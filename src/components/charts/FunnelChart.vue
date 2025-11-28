<script setup>
import { computed } from 'vue'

const props = defineProps({
  funnel: {
    type: Array,
    default: () => []
  }
})

const funnelWithRates = computed(() => {
  if (!props.funnel.length) return []
  
  const first = props.funnel[0]?.value ?? 0
  
  return props.funnel.map((item, index) => {
    const prevValue = index > 0 ? props.funnel[index - 1].value : item.value
    const dropRate = prevValue > 0 ? ((item.value / prevValue) * 100).toFixed(1) : 100
    const totalRate = first > 0 ? ((item.value / first) * 100).toFixed(1) : 0
    const width = first > 0 ? Math.max((item.value / first) * 100, 20) : 100
    
    return {
      ...item,
      dropRate: Number(dropRate),
      totalRate: Number(totalRate),
      width
    }
  })
})
</script>

<template>
  <div class="h-full flex flex-col justify-center space-y-3">
    <div
      v-for="(item, index) in funnelWithRates"
      :key="item.stage"
      class="relative"
    >
      <div
        class="h-14 rounded-xl flex items-center justify-center gap-3 px-4 transition-all duration-500 mx-auto"
        :style="{
          width: `${item.width}%`,
          backgroundColor: item.color
        }"
      >
        <span class="font-semibold text-white text-sm">{{ item.stage }}</span>
        <span class="font-bold text-white text-lg">{{ item.value }}</span>
      </div>
      
      <!-- Connector arrow -->
      <div 
        v-if="index < funnelWithRates.length - 1"
        class="flex items-center justify-center py-1"
      >
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
          <span>{{ funnelWithRates[index + 1]?.dropRate }}%</span>
        </div>
      </div>
    </div>
    
    <div v-if="!funnel.length" class="h-full flex items-center justify-center text-slate-500">
      Sem dados de funil
    </div>
  </div>
</template>

