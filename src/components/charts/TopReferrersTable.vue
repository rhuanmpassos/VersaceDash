<script setup>
defineProps({
  referrers: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-white/10">
          <th class="pb-3 pr-4">Referrer</th>
          <th class="pb-3 px-2 text-center">Cliques</th>
          <th class="pb-3 px-2 text-center">Leads</th>
          <th class="pb-3 px-2 text-center">Conversões</th>
          <th class="pb-3 pl-2 text-right">Taxa</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(ref, index) in referrers"
          :key="ref.referralCode"
          class="border-b border-white/5 hover:bg-white/5 transition-colors"
        >
          <td class="py-3 pr-4">
            <div class="flex items-center gap-3">
              <span 
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                :class="{
                  'bg-gradient-to-br from-yellow-400 to-orange-500 text-black': index === 0,
                  'bg-gradient-to-br from-slate-300 to-slate-400 text-black': index === 1,
                  'bg-gradient-to-br from-amber-600 to-amber-700 text-white': index === 2,
                  'bg-white/10 text-slate-400': index > 2
                }"
              >
                {{ index + 1 }}
              </span>
              <div>
                <p class="font-medium text-white">{{ ref.name }}</p>
                <p class="text-xs text-slate-500 font-mono">{{ ref.referralCode }}</p>
              </div>
            </div>
          </td>
          <td class="py-3 px-2 text-center">
            <span class="text-purple-300 font-medium">{{ ref.clicks }}</span>
          </td>
          <td class="py-3 px-2 text-center">
            <span class="text-sky-300 font-medium">{{ ref.leads }}</span>
          </td>
          <td class="py-3 px-2 text-center">
            <span class="text-emerald-300 font-medium">{{ ref.conversions }}</span>
          </td>
          <td class="py-3 pl-2 text-right">
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              :class="{
                'bg-emerald-500/20 text-emerald-300': Number(ref.conversionRate) >= 20,
                'bg-yellow-500/20 text-yellow-300': Number(ref.conversionRate) >= 10 && Number(ref.conversionRate) < 20,
                'bg-slate-500/20 text-slate-300': Number(ref.conversionRate) < 10
              }"
            >
              {{ ref.conversionRate }}%
            </span>
          </td>
        </tr>
        <tr v-if="!referrers.length">
          <td colspan="5" class="py-8 text-center text-slate-500">
            Nenhum referrer encontrado
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

