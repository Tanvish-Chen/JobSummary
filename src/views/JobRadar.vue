<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore, getJobStatus, setJobApplication, daysUntil } from '../composables/useStore'
import { URGENT_DAYS, DIRECTIONS, GROUPS, companyId, labelCity } from '../data/jobConfig'
import { loadJobData } from '../lib/jobData'
import { isStale, staleDays } from '../lib/jobFreshness'
import jobsDoc from '../data/jobs.json'
import companiesDoc from '../data/jobCompanies.json'

const route = useRoute()
const store = useStore()

// —— 数据（静态导入，随本路由懒加载；校验容错移植自 find_job/js/data.js） ——
const { jobs, companies, companyMap, skipped } = loadJobData(jobsDoc, companiesDoc)
const updatedAt = jobsDoc.updated_at || ''
const companyName = (job) => companyMap[job.company_id]?.name || job.company_id

// 数据整体老化（页头提醒，P3-6）：取最早的 last_verified_at
const oldestVerified = jobs.reduce(
  (min, j) => (j.last_verified_at && j.last_verified_at < min ? j.last_verified_at : min),
  '9999-12-31'
)
const dataStaleDays = oldestVerified === '9999-12-31'
  ? 0
  : Math.max(0, Math.floor((Date.now() - new Date(oldestVerified + 'T00:00:00')) / 86400000))

// —— 筛选选项 ——
const STATUSES = ['想投', '已网申', '笔试', '面试', 'Offer', '已拒', '暂缓']
const statusFilterOptions = [
  { value: '', label: '全部状态' },
  { value: '__none', label: '未投' },
  ...STATUSES.map(s => ({ value: s, label: s }))
]
const statusOptions = [{ value: '', label: '未投（清除记录）' }, ...STATUSES.map(s => ({ value: s, label: s }))]
const cityOptions = [...new Set(jobs.flatMap(j => j.cities))].sort((a, b) => a.localeCompare(b, 'zh'))
const companyOptions = [...companies].sort((a, b) => a.name.localeCompare(b.name, 'zh'))
const targetCities = computed(() => store.profile.targetCities || [])

const filters = reactive({
  direction: '', group: '', company: '', cities: [], status: '', keyword: '',
  onlyUrgent: false, onlyFav: false, hideStale: true, onlyTarget: false, phdOnly: false,
  sort: 'deadline'
})
const page = ref(1)
const PAGE_SIZE = 30

onMounted(() => {
  // URL 预置筛选（企业赛道跳转 / 仪表盘提醒）
  if (route.query.company) filters.company = String(route.query.company)
  if (route.query.urgent === '1') filters.onlyUrgent = true
  // 目标城市默认预选（P3-8：交集为空则不加默认筛选）
  if (!route.query.company && filters.cities.length === 0) {
    const hit = targetCities.value.filter(c => cityOptions.includes(c))
    if (hit.length) filters.cities = hit
  }
})

watch(filters, () => { page.value = 1 })

// —— 过滤 + 排序 ——
function daysLeftOf(job) {
  return job.deadline ? daysUntil(job.deadline) : null
}

const visibleJobs = computed(() => {
  const kw = filters.keyword.trim().toLowerCase()
  const targetSet = new Set(targetCities.value)
  const list = jobs.filter(job => {
    const comp = companyMap[job.company_id]
    if (filters.hideStale && (job.status !== 'open' || isStale(job))) return false
    if (filters.onlyUrgent) {
      if (job.status !== 'open' || !job.deadline) return false
      const d = daysLeftOf(job)
      if (d < 0 || d > URGENT_DAYS) return false
    }
    if (filters.direction && job.direction !== filters.direction) return false
    if (filters.group && comp.group !== filters.group) return false
    if (filters.company && job.company_id !== filters.company) return false
    if (filters.cities.length && !job.cities.some(c => filters.cities.includes(c))) return false
    if (filters.status === '__none') {
      if (getJobStatus(job.id) !== '') return false
    } else if (filters.status && getJobStatus(job.id) !== filters.status) {
      return false
    }
    if (filters.onlyFav && getJobStatus(job.id) !== '想投') return false
    if (filters.phdOnly && !job.phd_preferred) return false
    if (filters.onlyTarget && !job.cities.some(c => targetSet.has(c))) return false
    if (kw) {
      const hay = [job.title, comp.name, DIRECTIONS[job.direction], job.cities.join(' '), job.skills.join(' ')]
        .join(' ').toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })

  // 降权层级：stale=2，非目标城市=1，正常=0（deadline/公司排序时置底）
  const tier = (job) => {
    if (isStale(job)) return 2
    if (filters.onlyTarget) return 0
    return job.cities.some(c => targetSet.has(c)) ? 0 : 1
  }

  list.sort((a, b) => {
    if (filters.sort === 'added') {
      const fa = a.fetched_at || ''
      const fb = b.fetched_at || ''
      if (fa !== fb) return fa < fb ? 1 : -1
      return a.title.localeCompare(b.title, 'zh')
    }
    if (filters.sort === 'company') {
      const c = companyName(a).localeCompare(companyName(b), 'zh')
      return c !== 0 ? c : a.title.localeCompare(b.title, 'zh')
    }
    // deadline（默认）：无 deadline/已截止/已关闭沉底，stale/非目标城市降权
    const key = (job) => {
      if (job.status !== 'open' || !job.deadline) return Infinity
      const d = daysLeftOf(job)
      if (d < 0) return Infinity
      return tier(job) * 1e14 + new Date(job.deadline + 'T00:00:00').getTime()
    }
    const ka = key(a)
    const kb = key(b)
    if (ka !== kb) return ka - kb
    return a.title.localeCompare(b.title, 'zh')
  })
  return list
})

const pagedJobs = computed(() => visibleJobs.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// —— 卡片展示 ——
function deadlineText(job) {
  if (!job.deadline) return '滚动招聘'
  if (job.status !== 'open') return '已关闭'
  const d = daysLeftOf(job)
  if (d < 0) return `已截止 ${job.deadline}`
  if (d === 0) return `今天截止（${job.deadline}）`
  return `截止 ${job.deadline}（剩约 ${d} 天）`
}

function urgentDays(job) {
  const d = daysLeftOf(job)
  return job.status === 'open' && job.deadline && d !== null && d >= 0 && d <= URGENT_DAYS ? d : null
}

function unverifiedDays(job) {
  return staleDays(job)
}

// —— 动作 ——
async function onApply(job) {
  if (getJobStatus(job.id) !== '') return
  try {
    await ElMessageBox.confirm(
      '已在新标签页打开投递链接。要把这条岗位标记为「已网申」吗？',
      '投递状态',
      { confirmButtonText: '标记已网申', cancelButtonText: '暂不', type: 'info' }
    )
    setJobApplication(job, companyName(job), '已网申')
    ElMessage.success('已标记「已网申」，可在投递看板查看')
  } catch (e) { /* 用户取消 */ }
}

function onStatus(job, status) {
  setJobApplication(job, companyName(job), status)
  ElMessage.success(status === '' ? '已清除该岗位的投递记录' : `「${companyName(job)}」已更新为「${status}」`)
}

function onFav(job) {
  const st = getJobStatus(job.id)
  if (st === '') {
    setJobApplication(job, companyName(job), '想投')
    ElMessage.success('已加入「想投」')
  } else if (st === '想投') {
    setJobApplication(job, companyName(job), '')
    ElMessage.success('已取消想投')
  } else {
    ElMessage.info(`该岗位已是「${st}」状态，如需调整请用状态下拉框`)
  }
}

function resetFilters() {
  Object.assign(filters, {
    direction: '', group: '', company: '', cities: [], status: '', keyword: '',
    onlyUrgent: false, onlyFav: false, hideStale: true, onlyTarget: false, phdOnly: false,
    sort: filters.sort
  })
  page.value = 1
}
</script>

<template>
  <div>
    <!-- 数据容错/老化提醒（P3-4 / P3-6） -->
    <el-alert
      v-if="skipped > 0" type="warning" :closable="false" show-icon style="margin-bottom: 12px"
      :title="`有 ${skipped} 条数据存在问题已被跳过，请检查 src/data/jobs.json（详见浏览器控制台）`"
    />
    <el-alert
      v-if="dataStaleDays >= 14" type="warning" :closable="false" show-icon style="margin-bottom: 12px"
      :title="`岗位数据已 ${dataStaleDays} 天未整体更新（最后更新 ${updatedAt}），请前往 GitHub 仓库更新 src/data/jobs.json`"
    />

    <!-- 筛选工具栏 -->
    <div class="qz-card">
      <div class="filter-row">
        <el-select v-model="filters.direction" placeholder="全部方向" clearable style="width: 150px">
          <el-option v-for="(label, key) in DIRECTIONS" :key="key" :value="key" :label="label" />
        </el-select>
        <el-select v-model="filters.group" placeholder="全部类别" clearable style="width: 150px">
          <el-option v-for="(label, key) in GROUPS" :key="key" :value="key" :label="label" />
        </el-select>
        <el-select v-model="filters.company" placeholder="全部公司" clearable filterable style="width: 180px">
          <el-option v-for="c in companyOptions" :key="c.id" :value="c.id" :label="c.name" />
        </el-select>
        <el-select v-model="filters.cities" placeholder="全部城市" clearable multiple collapse-tags style="min-width: 190px">
          <el-option v-for="c in cityOptions" :key="c" :value="c" :label="labelCity(c)" />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" style="width: 110px">
          <el-option v-for="o in statusFilterOptions" :key="o.value" :value="o.value" :label="o.label" />
        </el-select>
        <el-input v-model="filters.keyword" placeholder="搜索岗位/技能/城市" clearable style="width: 190px" />
        <el-select v-model="filters.sort" style="width: 130px">
          <el-option value="deadline" label="按截止日期" />
          <el-option value="added" label="按收录时间" />
          <el-option value="company" label="按公司" />
        </el-select>
      </div>
      <div class="filter-row" style="margin-top: 10px">
        <el-checkbox v-model="filters.onlyUrgent">仅看 {{ URGENT_DAYS }} 天内截止</el-checkbox>
        <el-checkbox v-model="filters.onlyFav">只看收藏（想投）</el-checkbox>
        <el-checkbox v-model="filters.hideStale">隐藏可能过期</el-checkbox>
        <el-checkbox v-model="filters.onlyTarget">只看目标城市</el-checkbox>
        <el-checkbox v-model="filters.phdOnly">博士专项</el-checkbox>
        <el-button text size="small" @click="resetFilters">重置筛选</el-button>
        <span class="qz-muted" style="margin-left: auto">共 {{ visibleJobs.length }} 个岗位 · 数据更新于 {{ updatedAt }}</span>
      </div>
    </div>

    <!-- 分页（顶部） -->
    <el-pagination
      v-if="visibleJobs.length > PAGE_SIZE" v-model:current-page="page"
      :page-size="PAGE_SIZE" :total="visibleJobs.length" layout="prev, pager, next"
      size="small" style="margin: 12px 0; justify-content: center"
    />

    <!-- 岗位卡片 -->
    <el-row :gutter="12">
      <el-col v-for="job in pagedJobs" :key="job.id" :xs="24" :sm="12" :lg="8">
        <div class="job-card" :class="{ stale: isStale(job), urgent: urgentDays(job) !== null }">
          <div class="job-head">
            <span class="badge">{{ companyName(job).slice(0, 1) }}</span>
            <div class="title-line">
              <h3>{{ job.title }}</h3>
              <div class="job-company">
                {{ companyName(job) }} · {{ GROUPS[companyMap[job.company_id].group] || '其他' }}
              </div>
            </div>
            <span v-if="urgentDays(job) !== null" class="urgent-tag">剩 {{ urgentDays(job) }} 天</span>
            <span v-else-if="isStale(job)" class="stale-tag">可能已过期</span>
            <button
              type="button" class="fav-btn" :class="{ active: getJobStatus(job.id) === '想投' }"
              :aria-pressed="getJobStatus(job.id) === '想投'" aria-label="收藏或取消收藏岗位"
              :title="getJobStatus(job.id) === '想投' ? '取消想投' : '加入想投'"
              @click="onFav(job)"
            >{{ getJobStatus(job.id) === '想投' ? '★' : '☆' }}</button>
          </div>
          <div class="job-tags">
            <span class="tag direction">{{ DIRECTIONS[job.direction] }}</span>
            <span v-if="job.phd_preferred" class="tag phd">🎓 博士专项</span>
            <span v-for="s in job.skills" :key="s" class="tag skill">{{ s }}</span>
          </div>
          <div class="job-meta">
            <span>📍 {{ job.cities.length ? job.cities.map(labelCity).join(' · ') : '未注明' }}</span>
            <span>学历：{{ job.degree === '不限' ? '不限' : job.degree + '及以上' }}</span>
          </div>
          <div class="job-meta">
            <span class="deadline-text">{{ deadlineText(job) }}</span>
            <span class="difficulty" :class="'diff-' + job.difficulty.level">难度 {{ job.difficulty.level }}</span>
            <span v-if="job.difficulty.note" class="diff-note">{{ job.difficulty.note }}</span>
          </div>
          <div v-if="job.note" class="job-note">📝 {{ job.note }}</div>
          <div class="job-actions">
            <a class="apply-btn" :href="job.apply_url" target="_blank" rel="noopener" @click="onApply(job)">立即投递 ↗</a>
            <el-dropdown trigger="click" @command="(s) => onStatus(job, s)">
              <span class="status-btn" role="button">
                状态：{{ getJobStatus(job.id) || '未投' }} ▾
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="o in statusOptions" :key="o.value" :command="o.value"
                    :class="{ 'status-active': getJobStatus(job.id) === o.value }"
                  >{{ o.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-if="unverifiedDays(job)" class="stale-foot">⏳ 已 {{ unverifiedDays(job) }} 天未核实，投递前请以官网为准</div>
        </div>
      </el-col>
    </el-row>

    <el-empty v-if="!visibleJobs.length" description="没有符合条件的岗位——试试放宽筛选条件或重置" />

    <!-- 分页（底部） -->
    <el-pagination
      v-if="visibleJobs.length > PAGE_SIZE" v-model:current-page="page"
      :page-size="PAGE_SIZE" :total="visibleJobs.length" layout="prev, pager, next"
      size="small" style="margin: 12px 0; justify-content: center"
    />
  </div>
</template>

<style scoped>
.filter-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

.job-card {
  border: 1px solid var(--qz-card-border);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 12px);
  background: #fff;
}
.job-card:hover { border-color: var(--qz-primary); box-shadow: 0 2px 10px rgba(47, 84, 235, 0.08); }
.job-card.urgent { border-color: #e03e3e; box-shadow: 0 0 0 1px #e03e3e inset; }
.job-card.stale { opacity: 0.62; filter: grayscale(0.4); }

.job-head { display: flex; align-items: flex-start; gap: 8px; }
.badge {
  flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px;
  background: var(--qz-primary); color: #fff; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.title-line { flex: 1; min-width: 0; }
.title-line h3 { margin: 0; font-size: 14.5px; line-height: 1.4; word-break: break-all; }
.job-company { font-size: 12px; color: var(--qz-text-sub); margin-top: 3px; }

.urgent-tag {
  flex-shrink: 0; font-size: 12px; color: #fff; background: #e03e3e;
  border-radius: 4px; padding: 2px 6px;
}
.stale-tag {
  flex-shrink: 0; font-size: 12px; color: #b45309; background: #fffbeb;
  border: 1px solid #fcd34d; border-radius: 4px; padding: 1px 6px;
}
.fav-btn {
  flex-shrink: 0; border: none; background: none; cursor: pointer;
  font-size: 18px; color: #c0c4cc; padding: 0 2px; line-height: 1;
}
.fav-btn.active { color: #f7ba2a; }

.job-tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font-size: 12px; border-radius: 4px; padding: 2px 8px; }
.tag.direction { background: var(--qz-primary-light); color: var(--qz-primary); font-weight: 600; }
.tag.phd { background: #fffbeb; color: #b45309; border: 1px solid #fcd34d; }
.tag.skill { background: #f4f5f7; color: #57606a; }

.job-meta { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 12.5px; color: var(--qz-text-sub); }
.deadline-text { color: var(--qz-primary); font-weight: 600; }
.difficulty { font-weight: 600; }
.diff-high { color: #e03e3e; }
.diff-mid { color: #e6a23c; }
.diff-low { color: #909399; }
.diff-note { color: var(--qz-text-sub); }

.job-note {
  margin-top: 8px; font-size: 12px; color: var(--qz-text-sub);
  background: #f9fafb; border-left: 3px solid var(--qz-card-border);
  padding: 5px 8px; border-radius: 4px; line-height: 1.6;
}

.job-actions {
  margin-top: auto; padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
}
.apply-btn {
  font-size: 13px; font-weight: 600; color: #fff; background: var(--qz-primary);
  text-decoration: none; border-radius: 6px; padding: 6px 12px;
}
.apply-btn:hover { opacity: 0.9; }
.status-btn {
  font-size: 12.5px; color: var(--qz-text-sub); cursor: pointer;
  border: 1px solid var(--qz-card-border); border-radius: 6px; padding: 5px 10px;
}
.status-btn:hover { border-color: var(--qz-primary); color: var(--qz-primary); }
:deep(.status-active) { color: var(--qz-primary); font-weight: 700; }

.stale-foot { margin-top: 8px; font-size: 11.5px; color: #b45309; }
</style>
