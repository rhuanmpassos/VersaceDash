import { z } from 'zod'
import { prisma } from '../services/prisma.js'
import { buildReferrerMap, enrichLead } from '../utils/leadSerializer.js'

const stageSchema = z.enum(['NA_BASE', 'EM_CONTATO', 'COMPRADO', 'REJEITADO'])

const createLeadSchema = z.object({
  nome: z.string().min(2, 'Informe o nome do lead.'),
  whatsapp: z.string().min(8, 'Informe um WhatsApp válido.'),
  referralCode: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  stage: stageSchema.default('NA_BASE'),
})

const updateStageSchema = z.object({
  stage: stageSchema,
})

export async function listLeads(req, res, next) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const codes = [
      ...new Set(leads.map((lead) => lead.referralCode).filter(Boolean)),
    ]
    const referrers = codes.length
      ? await prisma.referrer.findMany({
          where: { referralCode: { in: codes } },
        })
      : []

    const refMap = buildReferrerMap(referrers)
    const payload = leads.map((lead) => enrichLead(lead, refMap))

    res.json({ leads: payload })
  } catch (error) {
    next(error)
  }
}

export async function createLead(req, res, next) {
  try {
    const payload = createLeadSchema.parse(req.body)
    const lead = await prisma.lead.create({
      data: {
        nome: payload.nome,
        whatsapp: payload.whatsapp,
        referralCode: payload.referralCode,
        stage: payload.stage,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    })

    const referrer = payload.referralCode
      ? await prisma.referrer.findFirst({
          where: { referralCode: payload.referralCode },
        })
      : null

    const serialized = enrichLead(lead, buildReferrerMap(referrer ? [referrer] : []))

    res.status(201).json({ lead: serialized })
  } catch (error) {
    next(error)
  }
}

export async function updateLeadStage(req, res, next) {
  try {
    const { stage } = updateStageSchema.parse(req.body)
    const { id } = req.params

    const lead = await prisma.lead.update({
      where: { id },
      data: { stage },
    })

    const referrer = lead.referralCode
      ? await prisma.referrer.findFirst({ where: { referralCode: lead.referralCode } })
      : null

    const serialized = enrichLead(lead, buildReferrerMap(referrer ? [referrer] : []))

    res.json({ lead: serialized })
  } catch (error) {
    next(error)
  }
}

