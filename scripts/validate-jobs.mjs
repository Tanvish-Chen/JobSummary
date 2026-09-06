#!/usr/bin/env node
/**
 * 数据校验（合并方案 P1-6）：三份 JSON 的上线前拦截
 * 由 deploy.yml 在 npm run build 之前调用；本地可随时 npm run validate
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const load = (f) => JSON.parse(readFileSync(join(root, 'src', 'data', f), 'utf8'))

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const DIRECTIONS = new Set(['llm', 'multimodal', 'infra', 'app', 'research', 'other'])
const GROUPS = new Set(['ai_native', 'big_tech', 'foreign_lab'])
const DIFFS = new Set(['高', '中', '低'])
const FREQS = new Set(['高频', '中频'])

const errors = []
const add = (msg) => errors.push(msg)
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// —— jobCompanies.json ——
const compDoc = load('jobCompanies.json')
const compIds = new Set()
if (!Array.isArray(compDoc.companies)) {
  add('jobCompanies.json: 缺 companies 数组')
} else {
  compDoc.companies.forEach((c, i) => {
    if (!c || typeof c.id !== 'string' || !c.id.trim()) return add(`companies[${i}]: 缺 id`)
    if (compIds.has(c.id)) return add(`companies[${i}]: id 重复 ${c.id}`)
    compIds.add(c.id)
    if (typeof c.name !== 'string' || !c.name.trim()) add(`companies[${c.id}]: 缺 name`)
    if (!GROUPS.has(c.group)) add(`companies[${c.id}]: group 无效（${c.group}）`)
  })
}

// —— jobs.json ——
const jobsDoc = load('jobs.json')
const jobIds = new Set()
if (!Array.isArray(jobsDoc.jobs)) {
  add('jobs.json: 缺 jobs 数组')
} else {
  jobsDoc.jobs.forEach((j, i) => {
    const at = `jobs[${i}]`
    if (!j || typeof j.id !== 'string' || !j.id.trim()) return add(`${at}: 缺 id`)
    if (jobIds.has(j.id)) return add(`${at}: id 重复（${j.id}）`)
    jobIds.add(j.id)
    if (!compIds.has(j.company_id)) add(`${at}(${j.id}): company_id 无效（${j.company_id}）`)
    if (typeof j.title !== 'string' || !j.title.trim()) add(`${at}(${j.id}): 缺 title`)
    if (!DIRECTIONS.has(j.direction)) add(`${at}(${j.id}): direction 无效（${j.direction}）`)
    if (typeof j.apply_url !== 'string' || !j.apply_url.trim()) add(`${at}(${j.id}): 缺 apply_url`)
    if (j.deadline != null && j.deadline !== '' && !DATE_RE.test(j.deadline)) add(`${at}(${j.id}): deadline 格式错误（${j.deadline}）`)
    if (!j.difficulty || !DIFFS.has(j.difficulty.level)) add(`${at}(${j.id}): difficulty.level 无效`)
    if (typeof j.phd_preferred !== 'boolean') add(`${at}(${j.id}): phd_preferred 必须为布尔`)
    if (!DATE_RE.test(j.last_verified_at || '')) add(`${at}(${j.id}): last_verified_at 缺失或格式错误`)
    else if (j.last_verified_at > todayStr()) add(`${at}(${j.id}): last_verified_at 晚于今天`)
  })
  if (typeof jobsDoc.updated_at !== 'string' || !DATE_RE.test(jobsDoc.updated_at)) add('jobs.json: updated_at 缺失或格式错误')
}

// —— questionBank.json ——
const qb = load('questionBank.json')
if (!Array.isArray(qb.categories)) add('questionBank.json: 缺 categories')
if (!Array.isArray(qb.items)) add('questionBank.json: 缺 items')
if (Array.isArray(qb.categories) && Array.isArray(qb.items)) {
  const catIds = new Set(qb.categories.map(c => c && c.id).filter(Boolean))
  const itemIds = new Set()
  qb.categories.forEach((c, i) => {
    if (!c || typeof c.id !== 'string' || !c.id.trim() || typeof c.name !== 'string') add(`categories[${i}]: 缺 id/name`)
  })
  qb.items.forEach((q, i) => {
    const at = `items[${i}]`
    if (!q || typeof q.id !== 'string' || !q.id.trim()) return add(`${at}: 缺 id`)
    if (itemIds.has(q.id)) return add(`${at}: id 重复（${q.id}）`)
    itemIds.add(q.id)
    if (!catIds.has(q.category)) add(`${at}(${q.id}): category 无效（${q.category}）`)
    if (typeof q.q !== 'string' || !q.q.trim()) add(`${at}(${q.id}): 缺 q`)
    if (typeof q.a !== 'string' || !q.a.trim()) add(`${at}(${q.id}): 缺 a`)
    if (!FREQS.has(q.freq)) add(`${at}(${q.id}): freq 无效（${q.freq}）`)
  })
  ;(qb.resources || []).forEach((r, i) => {
    if (!r || typeof r.url !== 'string' || !r.url.trim()) add(`resources[${i}]: 缺 url`)
  })
}

if (errors.length) {
  console.error(`❌ 数据校验未通过（${errors.length} 个问题）：`)
  errors.forEach(e => console.error('  - ' + e))
  process.exit(1)
}
console.log(`✅ 数据校验通过：${compIds.size} 家公司 / ${jobIds.size} 条岗位 / ${(qb.items || []).length} 道题目`)
