<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'

const props = defineProps({
  utmSourceDistribution: {
    type: Array,
    default: () => []
  },
  utmMediumDistribution: {
    type: Array,
    default: () => []
  },
  utmCampaignDistribution: {
    type: Array,
    default: () => []
  }
})

const colors = [
  '#c084fc', '#38bdf8', '#f472b6', '#34d399', 
  '#fbbf24', '#fb923c', '#a78bfa', '#f87171'
]

const sourceChartData = computed(() => ({
  labels: props.utmSourceDistribution.slice(0, 6).map(item => item.value),
  datasets: [{
    data: props.utmSourceDistribution.slice(0, 6).map(item => item.total),
    backgroundColor: colors,
    borderWidth: 0
  }]
}))

const mediumChartData = computed(() => ({
  labels: props.utmMediumDistribution.slice(0, 6).map(item => item.value),
  datasets: [{
    data: props.utmMediumDistribution.slice(0, 6).map(item => item.total),
    backgroundColor: colors,
    borderWidth: 0
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 12,
        usePointStyle: true,
        font: { size: 10 }
      }
    }
  }
}

const topCampaigns = computed(() => props.utmCampaignDistribution.slice(0, 5))
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- UTM Source -->
      <div class="flex flex-col">
        <h4 class="text-sm font-medium text-slate-300 mb-3">UTM Source</h4>
        <div class="h-48">
          <Doughnut 
            v-if="utmSourceDistribution.length" 
            :data="sourceChartData" 
            :options="chartOptions" 
          />
          <div v-else class="h-full flex items-center justify-center text-slate-500 text-sm">
            Sem dados de UTM Source
          </div>
        </div>
      </div>

      <!-- UTM Medium -->
      <div class="flex flex-col">
        <h4 class="text-sm font-medium text-slate-300 mb-3">UTM Medium</h4>
        <div class="h-48">
          <Doughnut 
            v-if="utmMediumDistribution.length" 
            :data="mediumChartData" 
            :options="chartOptions" 
          />
          <div v-else class="h-full flex items-center justify-center text-slate-500 text-sm">
            Sem dados de UTM Medium
          </div>
        </div>
      </div>
    </div>

    <!-- Top Campaigns -->
    <div>
      <h4 class="text-sm font-medium text-slate-300 mb-3">Top Campanhas</h4>
      <div class="space-y-2">
        <div
          v-for="(campaign, index) in topCampaigns"
          :key="campaign.value"
          class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
        >
          <span 
            class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            :style="{ backgroundColor: colors[index] + '30', color: colors[index] }"
          >
            {{ index + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-white truncate">{{ campaign.value }}</p>
          </div>
          <span class="text-lg font-semibold text-purple-300">{{ campaign.total }}</span>
        </div>
        <div v-if="!topCampaigns.length" class="py-4 text-center text-slate-500 text-sm">
          Nenhuma campanha UTM encontrada
        </div>
      </div>
    </div>
  </div>
</template>

