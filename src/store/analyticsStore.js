import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  fetchAnalyticsDashboard, 
  fetchAnalyticsClicks, 
  fetchAnalyticsFilters 
} from '../services/api'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const dashboard = ref(null)
  const clicks = ref([])
  const pagination = ref({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const filters = ref(null)
  const loading = ref(false)
  const loadingClicks = ref(false)
  const error = ref(null)

  // Current filters state
  const currentFilters = ref({
    period: '30days',
    startDate: null,
    endDate: null,
    referralCode: null,
    country: null,
    deviceType: null,
    browser: null,
    os: null
  })

  // Getters
  const summary = computed(() => dashboard.value?.summary ?? null)
  const timeline = computed(() => dashboard.value?.timeline ?? [])
  const deviceDistribution = computed(() => dashboard.value?.deviceDistribution ?? [])
  const osDistribution = computed(() => dashboard.value?.osDistribution ?? [])
  const browserDistribution = computed(() => dashboard.value?.browserDistribution ?? [])
  const countryDistribution = computed(() => dashboard.value?.countryDistribution ?? [])
  const referrerDistribution = computed(() => dashboard.value?.referrerDistribution ?? [])
  const topReferrers = computed(() => dashboard.value?.topReferrers ?? [])
  const funnel = computed(() => dashboard.value?.funnel ?? [])
  const hourlyDistribution = computed(() => dashboard.value?.hourlyDistribution ?? [])
  const dayOfWeekDistribution = computed(() => dashboard.value?.dayOfWeekDistribution ?? [])
  const utmSourceDistribution = computed(() => dashboard.value?.utmSourceDistribution ?? [])
  const utmMediumDistribution = computed(() => dashboard.value?.utmMediumDistribution ?? [])
  const utmCampaignDistribution = computed(() => dashboard.value?.utmCampaignDistribution ?? [])

  // Actions
  async function loadDashboard(customFilters = {}) {
    loading.value = true
    error.value = null
    
    try {
      const params = {
        ...currentFilters.value,
        ...customFilters
      }
      
      // Remove null/undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key]
        }
      })
      
      const response = await fetchAnalyticsDashboard(params)
      dashboard.value = response.data
      
      // Update current filters
      Object.assign(currentFilters.value, customFilters)
    } catch (err) {
      error.value = err.response?.data?.message ?? 'Erro ao carregar analytics'
      console.error('Erro ao carregar analytics:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadClicks(params = {}) {
    loadingClicks.value = true
    
    try {
      const queryParams = {
        ...currentFilters.value,
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      }
      
      // Remove null/undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key]
        }
      })
      
      const response = await fetchAnalyticsClicks(queryParams)
      clicks.value = response.data.data
      pagination.value = response.data.pagination
    } catch (err) {
      console.error('Erro ao carregar cliques:', err)
    } finally {
      loadingClicks.value = false
    }
  }

  async function loadFilters() {
    try {
      const response = await fetchAnalyticsFilters()
      filters.value = response.data
    } catch (err) {
      console.error('Erro ao carregar filtros:', err)
    }
  }

  function setFilters(newFilters) {
    Object.assign(currentFilters.value, newFilters)
  }

  function resetFilters() {
    currentFilters.value = {
      period: '30days',
      startDate: null,
      endDate: null,
      referralCode: null,
      country: null,
      deviceType: null,
      browser: null,
      os: null
    }
  }

  function setPage(page) {
    pagination.value.page = page
    loadClicks()
  }

  return {
    // State
    dashboard,
    clicks,
    pagination,
    filters,
    loading,
    loadingClicks,
    error,
    currentFilters,
    
    // Getters
    summary,
    timeline,
    deviceDistribution,
    osDistribution,
    browserDistribution,
    countryDistribution,
    referrerDistribution,
    topReferrers,
    funnel,
    hourlyDistribution,
    dayOfWeekDistribution,
    utmSourceDistribution,
    utmMediumDistribution,
    utmCampaignDistribution,
    
    // Actions
    loadDashboard,
    loadClicks,
    loadFilters,
    setFilters,
    resetFilters,
    setPage
  }
})

