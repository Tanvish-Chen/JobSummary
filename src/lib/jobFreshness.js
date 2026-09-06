/**
 * 岗位老化判定（合并方案 P3-6）
 * - deadline 岗：超过 14 天未核实即视为可能过期
 * - 滚动招聘岗：超过 30 天未核实即视为可能过期
 * - 已截止 / status=closed 的岗位已有终态展示，isStale 返回 false（避免双标签）
 */

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysSince(dateStr, today = new Date()) {
  if (!dateStr) return Infinity
  const past = new Date(dateStr + 'T00:00:00')
  return Math.floor((startOfDay(today) - past) / 86400000)
}

export function isStale(job, today = new Date()) {
  if (job.status !== 'open') return false
  if (job.deadline && job.deadline < todayStrLocal(today)) return false
  if (!job.last_verified_at) return true
  const days = daysSince(job.last_verified_at, today)
  if (job.deadline) return days > 14
  return days > 30
}

export function staleDays(job, today = new Date()) {
  if (job.status !== 'open' || !job.last_verified_at) return null
  if (job.deadline && job.deadline < todayStrLocal(today)) return null
  const days = daysSince(job.last_verified_at, today)
  return days >= 14 ? days : null
}

function todayStrLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
