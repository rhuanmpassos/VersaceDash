import { defineStore } from 'pinia'
import {
  fetchLeads,
  fetchStats,
  createLead as apiCreateLead,
  updateLeadStage as apiUpdateLeadStage,
} from '../services/api'

export const LEAD_STAGES = [
  { id: 'NA_BASE', label: 'Na Base' },
  { id: 'EM_CONTATO', label: 'Em Contato' },
  { id: 'COMPRADO', label: 'Comprado' },
  { id: 'REJEITADO', label: 'Rejeitado' },
]

const normalizeLead = (lead) => ({
  ...lead,
  stage: lead.stage ?? 'NA_BASE',
})

export const useLeadStore = defineStore('lead', {
  state: () => ({
    leads: [],
    stats: null,
    loadingLeads: false,
    loadingStats: false,
    submitting: false,
    error: null,
  }),
  getters: {
    leadsByStage(state) {
      return state.leads.reduce((acc, lead) => {
        const stage = lead.stage ?? 'NA_BASE'
        if (!acc[stage]) acc[stage] = []
        acc[stage].push(lead)
        return acc
      }, {})
    },
  },
  actions: {
    async ensureLeads() {
      if (this.leads.length) return
      await this.loadLeads()
    },
    async loadLeads() {
      this.loadingLeads = true
      this.error = null
      try {
        const { data } = await fetchLeads()
        const payload = data.leads ?? data
        this.leads = Array.isArray(payload) ? payload.map(normalizeLead) : []
      } catch (error) {
        this.error = 'Não foi possível carregar os leads.'
        console.error(error)
      } finally {
        this.loadingLeads = false
      }
    },
    async loadStats(force = false) {
      if (this.stats && !force) return
      this.loadingStats = true
      try {
        const { data } = await fetchStats()
        this.stats = data
      } catch (error) {
        this.error = 'Erro ao carregar métricas.'
        console.error(error)
      } finally {
        this.loadingStats = false
      }
    },
    async createLead(payload) {
      this.submitting = true
      try {
        const { data } = await apiCreateLead(payload)
        const lead = normalizeLead(data.lead ?? data)
        this.leads = [lead, ...this.leads]
        await this.loadStats(true)
        return lead
      } finally {
        this.submitting = false
      }
    },
    async updateLeadStage(id, stage) {
      const current = this.leads.find((lead) => lead.id === id)
      if (!current || current.stage === stage) return current
      const previousStage = current.stage ?? 'NA_BASE'
      current.stage = stage

      try {
        const response = await apiUpdateLeadStage(id, stage)
        // Aceitar diferentes formatos de resposta
        const data = response?.data ?? response
        const updated = normalizeLead(data?.lead ?? data ?? { id, stage, ...current })
        this.leads = this.leads.map((lead) => (lead.id === id ? updated : lead))
        await this.loadStats(true)
        return updated
      } catch (error) {
        // Se o erro não é crítico (ex: problema de rede mas operação pode ter sido bem-sucedida)
        // Verificar se podemos continuar
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          // Erro do cliente - reverter
          current.stage = previousStage
          console.error('Falha ao atualizar estágio', error)
          throw error
        } else {
          // Erro de rede ou servidor - pode ter funcionado, manter atualização
          console.warn('Aviso ao atualizar estágio (pode ter funcionado):', error)
          const updated = normalizeLead({ id, stage, ...current })
          this.leads = this.leads.map((lead) => (lead.id === id ? updated : lead))
          return updated
        }
      }
    },
  },
})

