import { reactive, watch } from 'vue'
import { AIRADAR_STATUS_MAP } from '../data/jobConfig'

/**
 * 个人数据统一存储：全部保存在浏览器 localStorage。
 * 招聘内容类数据在 src/data/ 下（随代码更新），个人数据只在本机浏览器里。
 * 换电脑/清缓存前，请在「个人档案」页导出 JSON 备份。
 */

const STORAGE_KEY = 'qiuzhao2027_store_v1'
export const MIGRATED_KEY = 'qiuzhao2027_migrated_airadar_v1'
export const MIGRATE_SNOOZE_KEY = 'qiuzhao2027_migrated_airadar_snooze'

function defaultState() {
  return {
    profile: {
      name: '',
      school: '',
      college: '',
      major: '',
      // 政治面貌：中共党员 / 中共预备党员 / 共青团员 / 群众
      political: '',
      // 双一流建设高校（定向选调主要面向范围）
      isDoubleFirstClass: null, // true / false / null(未填写)
      originProvince: '',
      targetCities: ['北京', '上海', '杭州', '苏州', '南京'],
      hasCadreExp: null,      // 学生干部经历
      hasAwards: null,        // 校级以上奖项/奖学金
      thesisCount: 0,         // 已发表/在投论文数
      notes: ''
    },
    applications: [], // 投递记录，见 Tracker.vue
    customEvents: [], // 自定义日历事件 {id,title,date,track,note}
    checklistDone: {}, // 材料清单勾选 { '材料id': true }
    migration: { skipped: [] } // 旧雷达迁移的跳过清单（P2-5：浅合并下老用户也必须有默认值）
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const saved = JSON.parse(raw)
    // 简单合并，防止旧版本缺字段
    const base = defaultState()
    return { ...base, ...saved, profile: { ...base.profile, ...(saved.profile || {}) } }
  } catch (e) {
    console.warn('本地数据读取失败，使用默认值', e)
    return defaultState()
  }
}

const state = reactive(load())

watch(state, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch (e) {
    console.warn('本地数据保存失败', e)
  }
}, { deep: true })

export function useStore() {
  return state
}

export function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `秋招数据备份_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(jsonText) {
  const data = JSON.parse(jsonText)
  const base = defaultState()
  const merged = { ...base, ...data, profile: { ...base.profile, ...(data.profile || {}) } }
  Object.assign(state, merged)
}

export function resetData() {
  Object.assign(state, defaultState())
}

// —— 通用工具 ——
export function todayStr() {
  // 本地时区日期。原实现 toISOString().slice(0, 10) 取的是 UTC，
  // 东八区 00:00-08:00 之间会返回前一天（P0-2 修复）
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / 86400000)
}

let uid = Date.now()
export function genId() {
  return `${Date.now()}_${uid++}`
}

// —— 岗位雷达 ↔ 投递看板 统一状态（合并方案 Phase 2） ——
export function getJobApplication(jobId) {
  return state.applications.find(a => a.jobId === jobId) || null
}

export function getJobStatus(jobId) {
  return getJobApplication(jobId)?.status || ''
}

/** 雷达卡片状态变更：status 为空 = 未投（删除记录），否则创建/更新看板记录 */
export function setJobApplication(job, companyName, status) {
  const existing = getJobApplication(job.id)
  if (!status) {
    if (existing) state.applications.splice(state.applications.indexOf(existing), 1)
    return
  }
  if (existing) {
    existing.status = status
    return
  }
  state.applications.push({
    id: genId(),
    jobId: job.id,
    company: companyName,
    position: job.title,
    track: '企业',
    status,
    deadline: job.deadline || '',
    url: job.apply_url,
    note: '',
    createdAt: new Date().toISOString()
  })
}

// —— 旧雷达（find_job）数据迁移（合并方案 P2-3 / P2-4） ——
function normPos(s) {
  return (s || '').replace(/\s+/g, '').toLowerCase()
}

function commonSubLen(a, b) {
  let best = 0
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let k = 0
      while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++
      if (k > best) best = k
    }
  }
  return best
}

function readAiradar() {
  let status = {}
  let favorites = []
  try { status = JSON.parse(localStorage.getItem('airadar:v1:status') || '{}') || {} } catch (e) { status = {} }
  try { favorites = JSON.parse(localStorage.getItem('airadar:v1:favorites') || '[]') || [] } catch (e) { favorites = [] }
  return { status, favorites }
}

/**
 * 生成迁移计划（只读，不写任何数据），供确认弹窗展示。
 * 去重规则（P2-3 分档表）：
 *  - 占位记录 + 想投        → 跳过（占位已覆盖收藏意图）
 *  - 占位记录 + 真实状态    → 合并（占位不含状态信息，不得遮蔽真实数据）
 *  - position/title 相等或公共子串 ≥4 字 → 合并；状态相同才跳过
 *  - 其余 → 正常导入
 */
export function planMigration(jobs, companyMap) {
  const { status, favorites } = readAiradar()
  const plan = { imports: [], merges: [], skipped: [] }
  const seen = new Set()

  const handle = (job, airadarStatus, favoritesOnly) => {
    if (!job || seen.has(job.id)) return
    seen.add(job.id)
    const name = companyMap[job.company_id]?.name || job.company_id
    const newStatus = favoritesOnly ? '想投' : (AIRADAR_STATUS_MAP[airadarStatus] || '想投')

    if (state.applications.some(a => a.jobId === job.id)) {
      plan.skipped.push({ jobId: job.id, title: job.title, company: name, reason: '看板已有该岗位记录' })
      return
    }
    // 二次去重：与既有「加入看板」记录（无 jobId）比对
    const dup = state.applications.find(a => !a.jobId && a.track === '企业' && a.company === name &&
      (a.position === '待填岗位名' || commonSubLen(normPos(a.position), normPos(job.title)) >= 4))
    if (dup) {
      if (dup.position === '待填岗位名') {
        if (newStatus === '想投') {
          plan.skipped.push({ jobId: job.id, title: job.title, company: name, reason: '既有占位记录已覆盖收藏意图' })
        } else {
          plan.merges.push({ record: dup, job, status: newStatus })
        }
      } else if (dup.status === newStatus) {
        plan.skipped.push({ jobId: job.id, title: job.title, company: name, reason: '与既有记录状态相同' })
      } else {
        plan.merges.push({ record: dup, job, status: newStatus })
      }
      return
    }
    plan.imports.push({ job, status: newStatus, company: name })
  }

  Object.entries(status).forEach(([jobId, st]) => handle(jobs.find(j => j.id === jobId), st, false))
  favorites.forEach(jobId => handle(jobs.find(j => j.id === jobId), '', true))
  return plan
}

/** 执行迁移计划（仅在用户确认后调用）。imports 打 batch 标记；merges 备份原字段以便撤销 */
export function applyMigration(plan) {
  plan.imports.forEach(({ job, status, company }) => {
    state.applications.push({
      id: genId(),
      jobId: job.id,
      company,
      position: job.title,
      track: '企业',
      status,
      deadline: job.deadline || '',
      url: job.apply_url,
      note: '岗位雷达迁移',
      migrationBatch: 'airadar-v1',
      createdAt: new Date().toISOString()
    })
  })
  plan.merges.forEach(({ record, job, status }) => {
    record.mergeBackup = { position: record.position, status: record.status, deadline: record.deadline, url: record.url }
    record.migrationBatch = 'airadar-v1'
    if (record.position === '待填岗位名') record.position = job.title
    record.status = status
    if (job.deadline) record.deadline = job.deadline
    record.url = job.apply_url
    record.jobId = job.id
  })
  state.migration.skipped = plan.skipped
}

/** 撤销迁移：删除导入记录；合并记录恢复备份（P2-4，撤销后清除标记 key 以便重新迁移） */
export function undoMigration() {
  const keep = []
  state.applications.forEach(a => {
    if (a.migrationBatch === 'airadar-v1') {
      if (a.mergeBackup) {
        Object.assign(a, a.mergeBackup)
        delete a.migrationBatch
        delete a.mergeBackup
        delete a.jobId
        keep.push(a)
      }
      // else：迁移导入的记录 → 丢弃
    } else {
      keep.push(a)
    }
  })
  state.applications = keep
  state.migration.skipped = []
  localStorage.removeItem(MIGRATED_KEY)
}

/** 迁移向导闸门：App.vue 挂载时决定是否弹窗（P2-2：先查 key，再拉数据） */
export function migrationGate() {
  const migrated = localStorage.getItem(MIGRATED_KEY)
  if (migrated) return { show: false, reason: migrated }
  const snooze = localStorage.getItem(MIGRATE_SNOOZE_KEY)
  if (snooze && new Date(snooze) > new Date()) return { show: false, reason: 'snoozed' }
  const statusRaw = localStorage.getItem('airadar:v1:status')
  const favRaw = localStorage.getItem('airadar:v1:favorites')
  if ((!statusRaw || statusRaw === '{}') && (!favRaw || favRaw === '[]')) return { show: false, reason: 'no-data' }
  return { show: true }
}
