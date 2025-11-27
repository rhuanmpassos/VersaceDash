import { STAGE_LABELS } from '../constants/stages.js'

export const enrichLead = (lead, referrerMap) => ({
  ...lead,
  stageLabel: STAGE_LABELS[lead.stage] ?? lead.stage,
  referrer: lead.referralCode ? referrerMap?.get(lead.referralCode) ?? null : null,
})

export const buildReferrerMap = (referrers) => {
  const map = new Map()
  referrers.forEach((ref) => {
    map.set(ref.referralCode, ref)
  })
  return map
}

