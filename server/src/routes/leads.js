import { Router } from 'express'
import { createLead, listLeads, updateLeadStage } from '../controllers/leadController.js'

const router = Router()

router.get('/', listLeads)
router.post('/', createLead)
router.patch('/:id/stage', updateLeadStage)

export default router

