import { Router } from 'express'
import { 
  getAnalyticsDashboard, 
  getClicksList, 
  getFilterOptions 
} from '../controllers/analyticsController.js'

const router = Router()

// Dashboard principal
router.get('/', getAnalyticsDashboard)

// Lista de cliques detalhada
router.get('/clicks', getClicksList)

// Opções de filtros
router.get('/filters', getFilterOptions)

export default router

