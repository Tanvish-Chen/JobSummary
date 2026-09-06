/**
 * 岗位数据加载与容错（自 find_job/js/data.js 移植为 ES module）
 * 坏记录跳过并计数，页面顶部展示横幅；CI 侧由 scripts/validate-jobs.mjs 拦截。
 */
import { DIRECTIONS, GROUPS } from '../data/jobConfig'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const DIFF_LEVELS = ['高', '中', '低']

function toStringArray(v) {
  if (!Array.isArray(v)) return []
  return v.filter(x => typeof x === 'string' && x.trim() !== '')
}

export function loadJobData(jobsDoc, companiesDoc) {
  const companies = []
  const companyMap = {}
  let skipped = 0

  ;(Array.isArray(companiesDoc && companiesDoc.companies) ? companiesDoc.companies : []).forEach((c, i) => {
    if (!c || typeof c.id !== 'string' || !c.id.trim() || typeof c.name !== 'string' || !c.name.trim()) {
      console.warn(`companies 第 ${i + 1} 条缺 id/name，已跳过`); skipped++; return
    }
    if (companyMap[c.id]) { console.warn(`companies id 重复：${c.id}，后一条已跳过`); skipped++; return }
    const item = {
      id: c.id,
      name: c.name,
      group: GROUPS[c.group] ? c.group : 'other',
      career_url: typeof c.career_url === 'string' ? c.career_url : '',
      ats: typeof c.ats === 'string' ? c.ats : 'unknown',
      note: typeof c.note === 'string' ? c.note : ''
    }
    companies.push(item)
    companyMap[item.id] = item
  })

  const jobs = []
  const seen = new Set()
  ;(Array.isArray(jobsDoc && jobsDoc.jobs) ? jobsDoc.jobs : []).forEach((j, i) => {
    const fail = (msg) => { console.warn(`jobs.json 第 ${i + 1} 条：${msg}，已跳过`); skipped++ }
    if (!j || typeof j.id !== 'string' || !j.id.trim()) return fail('缺 id')
    if (seen.has(j.id)) return fail(`id 重复（${j.id}）`)
    if (!companyMap[j.company_id]) return fail(`company_id 无效（${j.company_id}）`)
    if (typeof j.title !== 'string' || !j.title.trim()) return fail('缺 title')
    if (!DIRECTIONS[j.direction]) return fail(`direction 无效（${j.direction}）`)
    if (typeof j.apply_url !== 'string' || !j.apply_url.trim()) return fail('缺 apply_url')
    let deadline = null
    if (j.deadline !== null && j.deadline !== undefined && j.deadline !== '') {
      if (!DATE_RE.test(j.deadline)) return fail(`deadline 格式错误（${j.deadline}）`)
      deadline = j.deadline
    }
    const level = j.difficulty && j.difficulty.level
    if (!DIFF_LEVELS.includes(level)) return fail('difficulty.level 无效')
    seen.add(j.id)
    jobs.push({
      id: j.id,
      company_id: j.company_id,
      title: j.title.trim(),
      direction: j.direction,
      skills: toStringArray(j.skills),
      degree: typeof j.degree === 'string' ? j.degree : '不限',
      cities: toStringArray(j.cities),
      apply_url: j.apply_url.trim(),
      deadline,
      difficulty: { level, note: j.difficulty && typeof j.difficulty.note === 'string' ? j.difficulty.note : '' },
      status: j.status === 'closed' ? 'closed' : 'open',
      source: j.source === 'official' ? 'official' : 'manual',
      fetched_at: DATE_RE.test(j.fetched_at || '') ? j.fetched_at : null,
      last_verified_at: DATE_RE.test(j.last_verified_at || '') ? j.last_verified_at : null,
      phd_preferred: j.phd_preferred === true,
      headcount: typeof j.headcount === 'number' ? j.headcount : null,
      note: typeof j.note === 'string' ? j.note : ''
    })
  })

  return { jobs, companies, companyMap, skipped }
}
