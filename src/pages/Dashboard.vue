<script setup>
import { computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import StatsCard from '../components/StatsCard.vue'
import StagePieChart from '../components/charts/StagePieChart.vue'
import ReferrerBarChart from '../components/charts/ReferrerBarChart.vue'
import LeadTimelineChart from '../components/charts/LeadTimelineChart.vue'
import { useLeadStore } from '../store/leadStore'

const store = useLeadStore()

onMounted(() => {
  store.loadStats()
})

const summary = computed(() => store.stats?.summary ?? null)
const stageDistribution = computed(() => store.stats?.stageDistribution ?? [])
const topReferrers = computed(() => store.stats?.topReferrers ?? [])
const timeline = computed(() => store.stats?.timeline ?? [])

const cardData = computed(() => {
  const s = summary.value
  if (!s) return []
  return [
    {
      title: 'LEADS TOTAIS',
      value: s.totalLeads ?? 0,
      helper: 'Em toda a base',
      accent: 'from-purple-500 to-fuchsia-500',
    },
    {
      title: 'DE REFERÊNCIA',
      value: s.fromReferral ?? 0,
      helper: 'Entraram por indicação',
      accent: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'FECHADOS (COMPRADO)',
      value: s.wonLeads ?? 0,
      helper: `Taxa de conversão ${s.conversionRate ?? 0}%`,
      trend: s.conversionRate ?? 0,
      accent: 'from-emerald-400 to-teal-500',
    },
    {
      title: 'ÚLTIMOS 7 DIAS',
      value: s.recentLeads ?? 0,
      helper: 'Cadastros recentes',
      accent: 'from-pink-500 to-orange-400',
    },
  ]
})

const updatedAt = computed(() =>
  store.stats?.generatedAt ? dayjs(store.stats.generatedAt).format('DD/MM HH:mm') : '—',
)
</script>

<template>
  <section class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
      <div>
        <p class="uppercase tracking-[0.4em] text-slate-500">Dashboard</p>
        <p class="text-base text-slate-300">Visão estratégica dos funis e referências</p>
      </div>
      <p>Atualizado em: {{ updatedAt }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        v-for="card in cardData"
        :key="card.title"
        v-bind="card"
        :value="card.value"
      />
      <div
        v-if="!store.stats && store.loadingStats"
        class="glass-panel animate-pulse p-5 text-slate-500"
      >
        Carregando métricas...
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <article class="glass-panel p-6">
        <header class="flex items-center justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Timeline</p>
            <h3 class="text-xl font-semibold text-white">Entrada de leads por dia</h3>
          </div>
        </header>
        <div class="mt-6 h-64">
          <LeadTimelineChart :timeline="timeline" />
        </div>
      </article>

      <article class="glass-panel p-6">
        <header class="flex flex-col gap-2">
          <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Funil</p>
          <h3 class="text-xl font-semibold text-white">Distribuição por estágio</h3>
        </header>
        <div class="mt-6 h-64">
          <StagePieChart :distribution="stageDistribution" />
        </div>
      </article>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <article class="glass-panel p-6">
        <header class="flex items-center justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Referenciadores</p>
            <h3 class="text-xl font-semibold text-white">Ranking de indicações</h3>
          </div>
          <span class="text-sm text-slate-400">{{ topReferrers.length }} ativos</span>
        </header>
        <div class="mt-6 h-72">
          <ReferrerBarChart :referrers="topReferrers" />
        </div>
      </article>

      <article class="glass-panel p-6">
        <header>
          <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Top 5</p>
          <h3 class="text-xl font-semibold text-white">Indicadores que mais convertem</h3>
        </header>
        <div class="mt-6 space-y-4">
          <div
            v-for="ref in topReferrers"
            :key="ref.referralCode"
            class="rounded-2xl border border-white/5 bg-white/5 p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-semibold text-white">{{ ref.name ?? '—' }}</p>
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {{ ref.referralCode }}
                </p>
              </div>
              <span class="text-lg font-semibold text-fuchsia-300">{{ ref.total }}</span>
            </div>
            <p class="mt-2 text-sm text-slate-400">Contato: {{ ref.whatsapp ?? '—' }}</p>
          </div>
          <p v-if="!topReferrers.length" class="text-sm text-slate-500">
            Sem referências cadastradas ainda.
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

