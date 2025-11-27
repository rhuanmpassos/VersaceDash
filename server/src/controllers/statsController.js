import dayjs from 'dayjs'
import { prisma } from '../services/prisma.js'
import { LEAD_STAGES, STAGE_LABELS } from '../constants/stages.js'

export async function getStats(req, res, next) {
  try {
    const [leads, referrers] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.referrer.findMany(),
    ])

    const totalLeads = leads.length
    const wonLeads = leads.filter((lead) => lead.stage === 'COMPRADO').length
    const fromReferral = leads.filter((lead) => !!lead.referralCode).length
    const lastSevenDays = leads.filter((lead) => dayjs().diff(dayjs(lead.createdAt), 'day') <= 7).length

    const stageDistribution = LEAD_STAGES.map((stage) => ({
      stage,
      label: STAGE_LABELS[stage],
      total: leads.filter((lead) => lead.stage === stage).length,
    }))

    const refMap = new Map(referrers.map((ref) => [ref.referralCode, ref]))
    const referralCounts = leads.reduce((acc, lead) => {
      if (!lead.referralCode) return acc
      acc[lead.referralCode] = (acc[lead.referralCode] ?? 0) + 1
      return acc
    }, {})

    const topReferrers = Object.entries(referralCounts)
      .map(([referralCode, total]) => {
        const ref = refMap.get(referralCode)
        return {
          referralCode,
          name: ref?.nome ?? referralCode,
          whatsapp: ref?.whatsapp,
          total,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    const timelineThreshold = dayjs().subtract(30, 'day')
    const timelineMap = new Map()
    leads.forEach((lead) => {
      if (dayjs(lead.createdAt).isBefore(timelineThreshold)) return
      const key = dayjs(lead.createdAt).format('YYYY-MM-DD')
      timelineMap.set(key, (timelineMap.get(key) ?? 0) + 1)
    })

    const timeline = Array.from(timelineMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, total]) => ({
        date,
        dateLabel: dayjs(date).format('DD/MM'),
        total,
      }))

    res.json({
      summary: {
        totalLeads,
        fromReferral,
        wonLeads,
        recentLeads: lastSevenDays,
        conversionRate: totalLeads ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0,
        topReferrer: topReferrers[0]?.name ?? null,
      },
      stageDistribution,
      topReferrers,
      timeline,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
}

