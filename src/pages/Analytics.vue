<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import StatsCard from '../components/StatsCard.vue'
import ClicksTimelineChart from '../components/charts/ClicksTimelineChart.vue'
import DevicePieChart from '../components/charts/DevicePieChart.vue'
import CountryBarChart from '../components/charts/CountryBarChart.vue'
import OsBrowserChart from '../components/charts/OsBrowserChart.vue'
import FunnelChart from '../components/charts/FunnelChart.vue'
import HourlyHeatmap from '../components/charts/HourlyHeatmap.vue'
import ReferrerOriginChart from '../components/charts/ReferrerOriginChart.vue'
import TopReferrersTable from '../components/charts/TopReferrersTable.vue'
import UtmAnalysisChart from '../components/charts/UtmAnalysisChart.vue'
import { useAnalyticsStore } from '../store/analyticsStore'

const store = useAnalyticsStore()

// Local state
const activeTab = ref('overview')
const showFilters = ref(false)
const conversionValue = ref(60) // Valor por conversão em R$
const localFilters = ref({
  period: '30days',
  startDate: '',
  endDate: '',
  referralCode: '',
  country: '',
  deviceType: '',
  browser: '',
  os: ''
})

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: '90days', label: 'Últimos 90 dias' },
  { value: 'custom', label: 'Personalizado' }
]

const tabs = [
  { id: 'overview', label: 'Visão Geral', icon: '📊' },
  { id: 'referrers', label: 'Referrers', icon: '👥' },
  { id: 'campaigns', label: 'Campanhas', icon: '📣' },
  { id: 'clicks', label: 'Cliques', icon: '🖱️' }
]

onMounted(async () => {
  await Promise.all([
    store.loadDashboard(),
    store.loadFilters()
  ])
})

// Apply filters
const applyFilters = () => {
  store.loadDashboard(localFilters.value)
  showFilters.value = false
}

// Reset filters
const resetFilters = () => {
  localFilters.value = {
    period: '30days',
    startDate: '',
    endDate: '',
    referralCode: '',
    country: '',
    deviceType: '',
    browser: '',
    os: ''
  }
  store.resetFilters()
  store.loadDashboard()
}

// Computed
const summary = computed(() => store.summary)

const calculatedEarnings = computed(() => {
  const conversions = summary.value?.convertedLeads ?? 0
  return conversions * conversionValue.value
})

const cardData = computed(() => {
  const s = summary.value
  if (!s) return []
  return [
    {
      title: 'TOTAL DE CLIQUES',
      value: s.totalClicks ?? 0,
      helper: `${s.uniqueClicks ?? 0} únicos`,
      trend: Number(s.clicksGrowth) || null,
      accent: 'from-purple-500 to-fuchsia-500'
    },
    {
      title: 'LEADS GERADOS',
      value: s.totalLeads ?? 0,
      helper: `Taxa: ${s.clickToLeadRate ?? 0}%`,
      accent: 'from-sky-400 to-blue-500'
    },
    {
      title: 'CONVERSÕES',
      value: s.convertedLeads ?? 0,
      helper: `Taxa: ${s.leadToConversionRate ?? 0}%`,
      accent: 'from-emerald-400 to-teal-500'
    },
    {
      title: 'GANHOS',
      value: `R$ ${calculatedEarnings.value.toLocaleString('pt-BR')}`,
      helper: `${s.convertedLeads ?? 0} × R$ ${conversionValue.value}`,
      accent: 'from-amber-400 to-orange-500'
    }
  ]
})

const updatedAt = computed(() =>
  store.dashboard?.generatedAt 
    ? dayjs(store.dashboard.generatedAt).format('DD/MM HH:mm') 
    : '—'
)

// Clicks table
const clicksPage = ref(1)
const clicksSearch = ref('')
const clicksSortBy = ref('createdAt')
const clicksSortOrder = ref('desc')

const loadClicks = () => {
  store.loadClicks({
    page: clicksPage.value,
    search: clicksSearch.value,
    sortBy: clicksSortBy.value,
    sortOrder: clicksSortOrder.value
  })
}

watch(activeTab, (tab) => {
  if (tab === 'clicks' && !store.clicks.length) {
    loadClicks()
  }
})

const handleSort = (column) => {
  if (clicksSortBy.value === column) {
    clicksSortOrder.value = clicksSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    clicksSortBy.value = column
    clicksSortOrder.value = 'desc'
  }
  loadClicks()
}

const handlePageChange = (page) => {
  clicksPage.value = page
  loadClicks()
}

// Export functionality placeholder
const exportData = (format) => {
  alert(`Exportação em ${format} será implementada em breve!`)
}
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="uppercase tracking-[0.4em] text-slate-500 text-xs">Analytics</p>
        <p class="text-base text-slate-300">Análise detalhada de cliques e conversões</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Valor por conversão -->
        <div class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
          <label class="text-xs text-slate-400 whitespace-nowrap">R$ por conversão:</label>
          <input
            v-model.number="conversionValue"
            type="number"
            min="0"
            step="1"
            class="w-20 bg-transparent border-none text-sm text-white font-medium focus:outline-none text-right no-spinner"
          />
        </div>
        <button
          @click="showFilters = !showFilters"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:border-purple-400 transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          Filtros
        </button>
        <p class="text-sm text-slate-400">Atualizado: {{ updatedAt }}</p>
      </div>
    </div>

    <!-- Filters Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="glass-panel p-6 space-y-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Filtros</h3>
          <button 
            @click="resetFilters"
            class="text-sm text-purple-300 hover:text-purple-200"
          >
            Limpar filtros
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Period -->
          <div>
            <label class="text-xs uppercase tracking-wider text-slate-500">Período</label>
            <select
              v-model="localFilters.period"
              class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            >
              <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Custom dates -->
          <template v-if="localFilters.period === 'custom'">
            <div>
              <label class="text-xs uppercase tracking-wider text-slate-500">Data Inicial</label>
              <input
                v-model="localFilters.startDate"
                type="date"
                class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label class="text-xs uppercase tracking-wider text-slate-500">Data Final</label>
              <input
                v-model="localFilters.endDate"
                type="date"
                class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>
          </template>

          <!-- Referrer -->
          <div>
            <label class="text-xs uppercase tracking-wider text-slate-500">Referrer</label>
            <select
              v-model="localFilters.referralCode"
              class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            >
              <option value="">Todos</option>
              <option v-for="ref in store.filters?.referrers" :key="ref.value" :value="ref.value">
                {{ ref.label }}
              </option>
            </select>
          </div>

          <!-- Country -->
          <div>
            <label class="text-xs uppercase tracking-wider text-slate-500">País</label>
            <select
              v-model="localFilters.country"
              class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            >
              <option value="">Todos</option>
              <option v-for="c in store.filters?.countries" :key="c.value" :value="c.value">
                {{ c.label }} ({{ c.count }})
              </option>
            </select>
          </div>

          <!-- Device -->
          <div>
            <label class="text-xs uppercase tracking-wider text-slate-500">Dispositivo</label>
            <select
              v-model="localFilters.deviceType"
              class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            >
              <option value="">Todos</option>
              <option v-for="d in store.filters?.devices" :key="d.value" :value="d.value">
                {{ d.label }} ({{ d.count }})
              </option>
            </select>
          </div>

          <!-- Browser -->
          <div>
            <label class="text-xs uppercase tracking-wider text-slate-500">Navegador</label>
            <select
              v-model="localFilters.browser"
              class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            >
              <option value="">Todos</option>
              <option v-for="b in store.filters?.browsers" :key="b.value" :value="b.value">
                {{ b.label }} ({{ b.count }})
              </option>
            </select>
          </div>

          <!-- OS -->
          <div>
            <label class="text-xs uppercase tracking-wider text-slate-500">Sistema</label>
            <select
              v-model="localFilters.os"
              class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            >
              <option value="">Todos</option>
              <option v-for="o in store.filters?.oses" :key="o.value" :value="o.value">
                {{ o.label }} ({{ o.count }})
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            @click="showFilters = false"
            class="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-slate-300 hover:border-white/20"
          >
            Cancelar
          </button>
          <button
            @click="applyFilters"
            class="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-2 text-sm font-semibold text-white shadow-neon"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </transition>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        v-for="card in cardData"
        :key="card.title"
        v-bind="card"
        :value="card.value"
      />
      <div
        v-if="!store.dashboard && store.loading"
        class="glass-panel animate-pulse p-5 text-slate-500 col-span-full"
      >
        Carregando métricas...
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition whitespace-nowrap"
        :class="activeTab === tab.id 
          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-neon' 
          : 'bg-white/5 text-slate-400 hover:bg-white/10'"
      >
        <span>{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="store.loading" class="glass-panel p-8 text-center text-slate-400">
      <div class="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      Carregando dados...
    </div>

    <!-- Overview Tab -->
    <template v-else-if="activeTab === 'overview'">
      <!-- Timeline Chart -->
      <article class="glass-panel p-6">
        <header class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Timeline</p>
            <h3 class="text-xl font-semibold text-white">Cliques ao longo do tempo</h3>
          </div>
        </header>
        <div class="h-72">
          <ClicksTimelineChart :timeline="store.timeline" />
        </div>
      </article>

      <!-- Grid: Device + Country -->
      <div class="grid gap-6 lg:grid-cols-2">
        <article class="glass-panel p-6">
          <header class="mb-4">
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Dispositivos</p>
            <h3 class="text-xl font-semibold text-white">Cliques por tipo</h3>
          </header>
          <div class="h-64">
            <DevicePieChart :distribution="store.deviceDistribution" />
          </div>
        </article>

        <article class="glass-panel p-6">
          <header class="mb-4">
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Países</p>
            <h3 class="text-xl font-semibold text-white">Top 10 países</h3>
          </header>
          <div class="h-64">
            <CountryBarChart :distribution="store.countryDistribution" />
          </div>
        </article>
      </div>

      <!-- OS & Browser -->
      <article class="glass-panel p-6">
        <header class="mb-4">
          <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Tecnologia</p>
          <h3 class="text-xl font-semibold text-white">Sistema Operacional & Navegador</h3>
        </header>
        <OsBrowserChart 
          :os-distribution="store.osDistribution" 
          :browser-distribution="store.browserDistribution" 
        />
      </article>

      <!-- Grid: Funnel + Traffic Source -->
      <div class="grid gap-6 lg:grid-cols-2">
        <article class="glass-panel p-6">
          <header class="mb-4">
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Funil</p>
            <h3 class="text-xl font-semibold text-white">Conversão por etapa</h3>
          </header>
          <div class="h-72">
            <FunnelChart :funnel="store.funnel" />
          </div>
        </article>

        <article class="glass-panel p-6">
          <header class="mb-4">
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Origem</p>
            <h3 class="text-xl font-semibold text-white">Fontes de tráfego</h3>
          </header>
          <div class="h-72">
            <ReferrerOriginChart :distribution="store.referrerDistribution" />
          </div>
        </article>
      </div>

      <!-- Hourly Heatmap -->
      <article class="glass-panel p-6">
        <header class="mb-4">
          <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Distribuição</p>
          <h3 class="text-xl font-semibold text-white">Horários de pico</h3>
        </header>
        <HourlyHeatmap 
          :hourly-distribution="store.hourlyDistribution"
          :day-of-week-distribution="store.dayOfWeekDistribution"
        />
      </article>
    </template>

    <!-- Referrers Tab -->
    <template v-else-if="activeTab === 'referrers'">
      <article class="glass-panel p-6">
        <header class="flex items-center justify-between mb-6">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Ranking</p>
            <h3 class="text-xl font-semibold text-white">Performance dos Referrers</h3>
          </div>
          <button
            @click="exportData('csv')"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:border-purple-400"
          >
            Exportar CSV
          </button>
        </header>
        <TopReferrersTable :referrers="store.topReferrers" />
      </article>
    </template>

    <!-- Campaigns Tab -->
    <template v-else-if="activeTab === 'campaigns'">
      <article class="glass-panel p-6">
        <header class="mb-6">
          <p class="text-sm uppercase tracking-[0.3em] text-slate-500">UTM</p>
          <h3 class="text-xl font-semibold text-white">Análise de Campanhas</h3>
        </header>
        <UtmAnalysisChart
          :utm-source-distribution="store.utmSourceDistribution"
          :utm-medium-distribution="store.utmMediumDistribution"
          :utm-campaign-distribution="store.utmCampaignDistribution"
        />
      </article>
    </template>

    <!-- Clicks Tab -->
    <template v-else-if="activeTab === 'clicks'">
      <article class="glass-panel p-6">
        <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Detalhes</p>
            <h3 class="text-xl font-semibold text-white">Lista de Cliques</h3>
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="clicksSearch"
              type="text"
              placeholder="Buscar por IP, cidade..."
              class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none w-64"
              @keyup.enter="loadClicks"
            />
            <button
              @click="loadClicks"
              class="rounded-xl bg-purple-600/50 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600/70"
            >
              Buscar
            </button>
          </div>
        </header>

        <div v-if="store.loadingClicks" class="py-8 text-center text-slate-400">
          <div class="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Carregando cliques...
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-white/10">
                <th 
                  class="pb-3 pr-4 cursor-pointer hover:text-purple-300"
                  @click="handleSort('createdAt')"
                >
                  Data/Hora
                  <span v-if="clicksSortBy === 'createdAt'">{{ clicksSortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="pb-3 px-2">Referrer</th>
                <th class="pb-3 px-2">IP</th>
                <th class="pb-3 px-2">País</th>
                <th class="pb-3 px-2">Cidade</th>
                <th class="pb-3 px-2">Dispositivo</th>
                <th class="pb-3 px-2">OS</th>
                <th class="pb-3 px-2">Navegador</th>
                <th class="pb-3 px-2">Origem</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="click in store.clicks"
                :key="click.id"
                class="border-b border-white/5 hover:bg-white/5"
              >
                <td class="py-3 pr-4 whitespace-nowrap">
                  {{ dayjs(click.createdAt).format('DD/MM/YY HH:mm') }}
                </td>
                <td class="py-3 px-2">
                  <span class="text-purple-300">{{ click.referrerName }}</span>
                </td>
                <td class="py-3 px-2 font-mono text-xs text-slate-400">
                  {{ click.maskedIp }}
                </td>
                <td class="py-3 px-2">{{ click.country ?? '—' }}</td>
                <td class="py-3 px-2">{{ click.city ?? '—' }}</td>
                <td class="py-3 px-2">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs"
                    :class="{
                      'bg-sky-500/20 text-sky-300': click.deviceType === 'mobile',
                      'bg-purple-500/20 text-purple-300': click.deviceType === 'desktop',
                      'bg-fuchsia-500/20 text-fuchsia-300': click.deviceType === 'tablet'
                    }"
                  >
                    {{ click.deviceType ?? '—' }}
                  </span>
                </td>
                <td class="py-3 px-2">{{ click.os ?? '—' }}</td>
                <td class="py-3 px-2">{{ click.browser ?? '—' }}</td>
                <td class="py-3 px-2 text-xs text-slate-400 max-w-[150px] truncate" :title="click.referrer">
                  {{ click.referrer ?? 'Direto' }}
                </td>
              </tr>
              <tr v-if="!store.clicks.length">
                <td colspan="9" class="py-8 text-center text-slate-500">
                  Nenhum clique encontrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="store.pagination.totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <p class="text-sm text-slate-400">
            Mostrando {{ ((store.pagination.page - 1) * store.pagination.limit) + 1 }} - 
            {{ Math.min(store.pagination.page * store.pagination.limit, store.pagination.total) }} 
            de {{ store.pagination.total }}
          </p>
          <div class="flex gap-2">
            <button
              v-for="page in Math.min(store.pagination.totalPages, 5)"
              :key="page"
              @click="handlePageChange(page)"
              class="w-8 h-8 rounded-lg text-sm font-medium transition"
              :class="store.pagination.page === page 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </article>
    </template>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Remove setas do input number */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
}
</style>

