import dayjs from 'dayjs'
import { prisma } from '../services/prisma.js'

// Helper para parsear período
const parsePeriod = (period, startDate, endDate) => {
  let start, end
  
  switch (period) {
    case 'today':
      start = dayjs().startOf('day').toDate()
      end = dayjs().endOf('day').toDate()
      break
    case '7days':
      start = dayjs().subtract(7, 'day').startOf('day').toDate()
      end = dayjs().endOf('day').toDate()
      break
    case '30days':
      start = dayjs().subtract(30, 'day').startOf('day').toDate()
      end = dayjs().endOf('day').toDate()
      break
    case '90days':
      start = dayjs().subtract(90, 'day').startOf('day').toDate()
      end = dayjs().endOf('day').toDate()
      break
    case 'custom':
      start = startDate ? dayjs(startDate).startOf('day').toDate() : dayjs().subtract(30, 'day').startOf('day').toDate()
      end = endDate ? dayjs(endDate).endOf('day').toDate() : dayjs().endOf('day').toDate()
      break
    default:
      start = dayjs().subtract(30, 'day').startOf('day').toDate()
      end = dayjs().endOf('day').toDate()
  }
  
  return { start, end }
}

// Dashboard principal de analytics
export async function getAnalyticsDashboard(req, res, next) {
  try {
    const { 
      period = '30days', 
      startDate, 
      endDate, 
      referralCode,
      country,
      deviceType,
      browser,
      os
    } = req.query

    const { start, end } = parsePeriod(period, startDate, endDate)

    // Build where clause
    const where = {
      createdAt: { gte: start, lte: end }
    }
    
    if (referralCode) where.referralCode = referralCode
    if (country) where.country = country
    if (deviceType) where.deviceType = deviceType
    if (browser) where.browser = browser
    if (os) where.os = os

    // Fetch all data in parallel
    const [
      hits,
      leads,
      referrers,
      previousPeriodHits
    ] = await Promise.all([
      prisma.referralHit.findMany({
        where,
        orderBy: { createdAt: 'asc' }
      }),
      prisma.lead.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          ...(referralCode ? { referralCode } : {})
        }
      }),
      prisma.referrer.findMany(),
      // Previous period for comparison
      prisma.referralHit.count({
        where: {
          createdAt: {
            gte: dayjs(start).subtract(dayjs(end).diff(start, 'day'), 'day').toDate(),
            lt: start
          },
          ...(referralCode ? { referralCode } : {})
        }
      })
    ])

    const totalClicks = hits.length
    const uniqueIps = new Set(hits.map(h => h.ip)).size
    const totalLeads = leads.length
    const convertedLeads = leads.filter(l => l.stage === 'COMPRADO').length
    const clickToLeadRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : 0
    const leadToConversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0
    const earnings = convertedLeads * 60

    // Growth calculation
    const clicksGrowth = previousPeriodHits > 0 
      ? (((totalClicks - previousPeriodHits) / previousPeriodHits) * 100).toFixed(1)
      : totalClicks > 0 ? 100 : 0

    // Timeline (clicks per day)
    const timelineMap = new Map()
    hits.forEach(hit => {
      const key = dayjs(hit.createdAt).format('YYYY-MM-DD')
      timelineMap.set(key, (timelineMap.get(key) ?? 0) + 1)
    })

    const timeline = Array.from(timelineMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, total]) => ({
        date,
        dateLabel: dayjs(date).format('DD/MM'),
        total
      }))

    // Device distribution
    const deviceDistribution = groupBy(hits, 'deviceType')
    const osDistribution = groupBy(hits, 'os')
    const browserDistribution = groupBy(hits, 'browser')
    const countryDistribution = groupBy(hits, 'country')
    const referrerDistribution = groupBy(hits, 'referrer')

    // UTM Analysis
    const utmSourceDistribution = groupBy(hits, 'utmSource')
    const utmMediumDistribution = groupBy(hits, 'utmMedium')
    const utmCampaignDistribution = groupBy(hits, 'utmCampaign')

    // Top referrers (people who refer)
    const refMap = new Map(referrers.map(ref => [ref.referralCode, ref]))
    const referralCodeCounts = groupBy(hits, 'referralCode')
    const topReferrers = referralCodeCounts
      .slice(0, 10)
      .map(item => {
        const ref = refMap.get(item.value)
        const referrerLeads = leads.filter(l => l.referralCode === item.value)
        const referrerConversions = referrerLeads.filter(l => l.stage === 'COMPRADO').length
        return {
          referralCode: item.value,
          name: ref?.nome ?? item.value,
          whatsapp: ref?.whatsapp,
          clicks: item.total,
          leads: referrerLeads.length,
          conversions: referrerConversions,
          conversionRate: referrerLeads.length > 0 
            ? ((referrerConversions / referrerLeads.length) * 100).toFixed(1) 
            : 0
        }
      })

    // Funnel data
    const funnel = [
      { stage: 'Cliques', value: totalClicks, color: '#c084fc' },
      { stage: 'Leads', value: totalLeads, color: '#a855f7' },
      { stage: 'Em Contato', value: leads.filter(l => l.stage === 'EM_CONTATO').length, color: '#38bdf8' },
      { stage: 'Convertidos', value: convertedLeads, color: '#34d399' }
    ]

    // Hourly heatmap (hour of day)
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      total: 0
    }))
    hits.forEach(hit => {
      const hour = dayjs(hit.createdAt).hour()
      hourlyDistribution[hour].total++
    })

    // Day of week distribution
    const dayOfWeekLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const dayOfWeekDistribution = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      label: dayOfWeekLabels[i],
      total: 0
    }))
    hits.forEach(hit => {
      const day = dayjs(hit.createdAt).day()
      dayOfWeekDistribution[day].total++
    })

    res.json({
      summary: {
        totalClicks,
        uniqueClicks: uniqueIps,
        totalLeads,
        convertedLeads,
        clickToLeadRate: Number(clickToLeadRate),
        leadToConversionRate: Number(leadToConversionRate),
        earnings,
        clicksGrowth: Number(clicksGrowth)
      },
      timeline,
      deviceDistribution,
      osDistribution,
      browserDistribution,
      countryDistribution,
      referrerDistribution,
      utmSourceDistribution,
      utmMediumDistribution,
      utmCampaignDistribution,
      topReferrers,
      funnel,
      hourlyDistribution,
      dayOfWeekDistribution,
      period: { start, end },
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    next(error)
  }
}

// Get detailed clicks list with pagination
export async function getClicksList(req, res, next) {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      period = '30days',
      startDate,
      endDate,
      referralCode,
      country,
      deviceType,
      browser,
      os,
      search
    } = req.query

    const { start, end } = parsePeriod(period, startDate, endDate)
    const skip = (Number(page) - 1) * Number(limit)

    // Build where clause
    const where = {
      createdAt: { gte: start, lte: end }
    }
    
    if (referralCode) where.referralCode = referralCode
    if (country) where.country = country
    if (deviceType) where.deviceType = deviceType
    if (browser) where.browser = browser
    if (os) where.os = os
    if (search) {
      where.OR = [
        { ip: { contains: search } },
        { city: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { referralCode: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [hits, total, referrers] = await Promise.all([
      prisma.referralHit.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: Number(limit)
      }),
      prisma.referralHit.count({ where }),
      prisma.referrer.findMany()
    ])

    const refMap = new Map(referrers.map(ref => [ref.referralCode, ref]))

    const data = hits.map(hit => ({
      ...hit,
      referrerName: refMap.get(hit.referralCode)?.nome ?? hit.referralCode,
      // Mask IP for privacy
      maskedIp: hit.ip ? hit.ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.xxx.xxx') : null
    }))

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

// Get filter options (for dropdowns)
export async function getFilterOptions(req, res, next) {
  try {
    const [referrers, countries, devices, browsers, oses] = await Promise.all([
      prisma.referrer.findMany({
        select: { referralCode: true, nome: true }
      }),
      prisma.referralHit.groupBy({
        by: ['country'],
        where: { country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } }
      }),
      prisma.referralHit.groupBy({
        by: ['deviceType'],
        where: { deviceType: { not: null } },
        _count: { deviceType: true }
      }),
      prisma.referralHit.groupBy({
        by: ['browser'],
        where: { browser: { not: null } },
        _count: { browser: true },
        orderBy: { _count: { browser: 'desc' } }
      }),
      prisma.referralHit.groupBy({
        by: ['os'],
        where: { os: { not: null } },
        _count: { os: true },
        orderBy: { _count: { os: 'desc' } }
      })
    ])

    res.json({
      referrers: referrers.map(r => ({ value: r.referralCode, label: r.nome })),
      countries: countries.map(c => ({ value: c.country, label: c.country, count: c._count.country })),
      devices: devices.map(d => ({ value: d.deviceType, label: d.deviceType, count: d._count.deviceType })),
      browsers: browsers.map(b => ({ value: b.browser, label: b.browser, count: b._count.browser })),
      oses: oses.map(o => ({ value: o.os, label: o.os, count: o._count.os }))
    })
  } catch (error) {
    next(error)
  }
}

// Helper function to group by field
function groupBy(items, field) {
  const map = new Map()
  items.forEach(item => {
    const value = item[field] ?? 'Desconhecido'
    map.set(value, (map.get(value) ?? 0) + 1)
  })
  
  return Array.from(map.entries())
    .map(([value, total]) => ({ value, total }))
    .sort((a, b) => b.total - a.total)
}

