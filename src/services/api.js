import axios from 'axios'

const normalizeBase = (baseUrl) => {
  if (!baseUrl) return '/api'
  const sanitized = baseUrl.replace(/\/$/, '')
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`
}

const api = axios.create({
  baseURL: normalizeBase(import.meta.env.VITE_API_URL),
})

// Interceptor para adicionar token em todas as requisições (exceto login)
api.interceptors.request.use(
  (config) => {
    // Não adicionar token na rota de login
    if (!config.url.includes('/auth/login')) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token inválido ou expirado - limpar autenticação
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Redirecionar para login apenas se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const fetchLeads = () => api.get('/leads')
export const fetchStats = () => api.get('/stats')
export const createLead = (payload) => api.post('/leads', payload)
export const updateLeadStage = (id, stage) =>
  api.patch(`/leads/${id}/stage`, { stage })

export default api

