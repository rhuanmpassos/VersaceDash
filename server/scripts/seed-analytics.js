/**
 * Script para popular dados de teste para Analytics
 * Execute: node scripts/seed-analytics.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const devices = ['mobile', 'desktop', 'tablet']
const oses = ['Windows', 'macOS', 'Android', 'iOS', 'Linux']
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
const countries = ['BR', 'US', 'PT', 'AR', 'MX', 'CO', 'CL', 'PE']
const cities = {
  BR: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Curitiba'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
  PT: ['Lisboa', 'Porto', 'Coimbra', 'Braga'],
  AR: ['Buenos Aires', 'Córdoba', 'Rosario'],
  MX: ['Ciudad de México', 'Guadalajara', 'Monterrey'],
  CO: ['Bogotá', 'Medellín', 'Cali'],
  CL: ['Santiago', 'Valparaíso'],
  PE: ['Lima', 'Arequipa']
}
const referrers = ['google.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com', null]
const utmSources = ['google', 'facebook', 'instagram', 'email', 'organic', null]
const utmMediums = ['cpc', 'social', 'email', 'referral', null]
const utmCampaigns = ['black_friday', 'lancamento_2025', 'remarketing', 'influencer_joao', null]

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  return date
}

function generateIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

async function seed() {
  console.log('🌱 Iniciando seed de analytics...')

  // Buscar referrers existentes
  const existingReferrers = await prisma.referrer.findMany()
  
  if (!existingReferrers.length) {
    console.log('⚠️  Nenhum referrer encontrado. Criando alguns de teste...')
    
    const testReferrers = [
      { nome: 'João Silva', whatsapp: '11999999999', referralCode: 'joao-silva' },
      { nome: 'Maria Santos', whatsapp: '11888888888', referralCode: 'maria-santos' },
      { nome: 'Pedro Costa', whatsapp: '11777777777', referralCode: 'pedro-costa' },
      { nome: 'Ana Oliveira', whatsapp: '11666666666', referralCode: 'ana-oliveira' },
      { nome: 'Carlos Ferreira', whatsapp: '11555555555', referralCode: 'carlos-ferreira' }
    ]
    
    for (const ref of testReferrers) {
      await prisma.referrer.create({ data: ref })
    }
    
    existingReferrers.push(...testReferrers)
  }

  const referralCodes = existingReferrers.map(r => r.referralCode)
  
  // Gerar cliques
  const clicksToCreate = 500
  console.log(`📊 Gerando ${clicksToCreate} cliques de teste...`)

  const hits = []
  for (let i = 0; i < clicksToCreate; i++) {
    const country = randomElement(countries)
    const cityList = cities[country] || ['Unknown']
    
    hits.push({
      referralCode: randomElement(referralCodes),
      ip: generateIP(),
      userAgent: `Mozilla/5.0 (${randomElement(oses)}) AppleWebKit/537.36`,
      createdAt: randomDate(90),
      referrer: randomElement(referrers),
      utmSource: randomElement(utmSources),
      utmMedium: randomElement(utmMediums),
      utmCampaign: randomElement(utmCampaigns),
      deviceType: randomElement(devices),
      os: randomElement(oses),
      browser: randomElement(browsers),
      screenWidth: randomElement([1920, 1366, 1440, 375, 414, 768]),
      screenHeight: randomElement([1080, 768, 900, 812, 896, 1024]),
      country,
      city: randomElement(cityList),
      region: country,
      language: country === 'BR' ? 'pt-BR' : country === 'US' ? 'en-US' : 'es',
      timezone: country === 'BR' ? 'America/Sao_Paulo' : country === 'US' ? 'America/New_York' : 'Europe/Lisbon'
    })
  }

  await prisma.referralHit.createMany({ data: hits })
  console.log(`✅ ${clicksToCreate} cliques criados!`)

  // Gerar alguns leads
  const leadsToCreate = 50
  console.log(`👥 Gerando ${leadsToCreate} leads de teste...`)

  const leads = []
  const stages = ['NA_BASE', 'EM_CONTATO', 'COMPRADO', 'REJEITADO']
  const stageWeights = [0.4, 0.3, 0.2, 0.1]

  for (let i = 0; i < leadsToCreate; i++) {
    const random = Math.random()
    let stage = 'NA_BASE'
    let cumulative = 0
    for (let j = 0; j < stageWeights.length; j++) {
      cumulative += stageWeights[j]
      if (random <= cumulative) {
        stage = stages[j]
        break
      }
    }

    leads.push({
      nome: `Lead Teste ${i + 1}`,
      whatsapp: `119${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      referralCode: randomElement([...referralCodes, null]),
      ip: generateIP(),
      userAgent: `Mozilla/5.0 (${randomElement(oses)}) AppleWebKit/537.36`,
      stage,
      createdAt: randomDate(60)
    })
  }

  await prisma.lead.createMany({ data: leads })
  console.log(`✅ ${leadsToCreate} leads criados!`)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('📈 Acesse /analytics para visualizar os dados.')

  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error('❌ Erro no seed:', e)
  prisma.$disconnect()
  process.exit(1)
})

