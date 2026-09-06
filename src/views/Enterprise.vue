<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { companies, phdPrograms, directionMap, enterpriseFlow } from '../data/companies'
import { useStore } from '../composables/useStore'
import { nowcoderSearch, githubSearch, webSearch, codetopHome } from '../data/examResources'
import { loadJobData } from '../lib/jobData'
import { companyId } from '../data/jobConfig'
import jobsDoc from '../data/jobs.json'
import jobCompaniesDoc from '../data/jobCompanies.json'

const store = useStore()
const router = useRouter()

// —— 岗位雷达联动（P4-1）：映射方向是把岗位的 company_id 映射到作战室 id，别写反 ——
const { jobs: radarJobs } = loadJobData(jobsDoc, jobCompaniesDoc)
const jobCountById = {}
const findJobIdOf = {}
radarJobs.forEach(j => {
  const cid = companyId(j.company_id)
  jobCountById[cid] = (jobCountById[cid] || 0) + 1
})
jobCompaniesDoc.companies.forEach(jc => {
  const cid = companyId(jc.id)
  if (!findJobIdOf[cid]) findJobIdOf[cid] = jc.id
})
function openRadar(c) {
  if (!jobCountById[c.id]) return
  router.push({ path: '/jobs', query: { company: findJobIdOf[c.id] || '' } })
}

const filterNature = ref('全部')
const filterCity = ref('全部')
const filterMatch = ref(0)

const natures = ['全部', '私企大厂', 'AI创企', '智能驾驶/车企', '游戏公司', '国企央企', '科研机构', '外企', '制造/家电']
const cities = ['全部', '北京', '上海', '杭州', '苏州', '南京', '多地', '其他城市']
const TARGET_CITIES = ['北京', '上海', '杭州', '苏州', '南京']
const matchLabel = { 3: '★★★ 高度对口', 2: '★★☆ 方向相关', 1: '★☆☆ 备选' }

function cityMatch(companyCity, filter) {
  if (filter === '全部') return true
  const c = companyCity || ''
  const isMulti = c.includes('多地') || c.includes('均有') || c.includes('/')
  if (filter === '多地') return isMulti
  if (filter === '其他城市') return !isMulti && !TARGET_CITIES.some(t => c.includes(t))
  return c.includes(filter)
}

const filtered = computed(() =>
  companies
    .filter(c => filterNature.value === '全部' || c.nature === filterNature.value)
    .filter(c => cityMatch(c.city, filterCity.value))
    .filter(c => c.match >= filterMatch.value)
    .sort((a, b) => b.match - a.match)
)

const matchType = { 3: 'danger', 2: 'warning', 1: 'info' }

function quickAdd(c) {
  store.applications.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    company: c.name,
    position: '待填岗位名',
    track: '企业',
    status: '想投',
    deadline: '',
    url: c.url || '',
    note: c.phdProgram ? `博士专项：${c.phdProgram}` : '',
    createdAt: new Date().toISOString()
  })
}
</script>

<template>
  <div>
    <!-- 研究方向映射 -->
    <div class="qz-card">
      <h3>🧩 研究方向 → 岗位映射（投什么岗）</h3>
      <el-collapse>
        <el-collapse-item v-for="d in directionMap" :key="d.dir" :name="d.dir">
          <template #title>
            <b style="font-size: 14px">{{ d.dir }}</b>
          </template>
          <el-table :data="d.positions" size="small" class="qz-table-full">
            <el-table-column prop="name" label="可投岗位" width="300" />
            <el-table-column prop="why" label="为什么对口" />
          </el-table>
          <div class="qz-highlight-box" style="margin-top: 8px">
            重点公司：{{ d.companies }}
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 公司库 -->
    <div class="qz-card">
      <h3>🏢 公司库（{{ filtered.length }} 家 · 按匹配度排序）</h3>
      <div class="filter-bar">
        <el-radio-group v-model="filterNature" size="small">
          <el-radio-button v-for="n in natures" :key="n" :value="n">{{ n }}</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="filterCity" size="small" style="margin-left: 12px">
          <el-radio-button v-for="c in cities" :key="c" :value="c">{{ c }}</el-radio-button>
        </el-radio-group>
        <el-select v-model="filterMatch" size="small" style="margin-left: 12px; width: 160px">
          <el-option :value="0" label="全部匹配度" />
          <el-option :value="2" label="★★☆ 以上" />
          <el-option :value="3" label="★★★ 仅高度对口" />
        </el-select>
      </div>

      <el-row :gutter="12">
        <el-col v-for="c in filtered" :key="c.id" :xs="24" :sm="12" :lg="8">
          <div class="co-card">
            <div class="co-head">
              <span class="co-name">{{ c.name }}</span>
              <el-tag :type="matchType[c.match]" size="small" effect="dark">{{ matchLabel[c.match] }}</el-tag>
            </div>
            <div class="co-meta">
              <el-tag size="small" effect="plain">{{ c.nature }}</el-tag>
              <span class="co-city">📍 {{ c.city }}</span>
            </div>
            <div class="co-tags">
              <el-tag v-for="t in c.matchTags" :key="t" size="small" type="success" effect="plain">{{ t }}</el-tag>
            </div>
            <div class="co-dept">{{ c.dept }}</div>
            <div class="co-note">{{ c.note }}</div>
            <div v-if="c.phdProgram" class="co-phd">🎓 博士专项：{{ c.phdProgram }}</div>
            <div class="co-radar">
              <a v-if="jobCountById[c.id]" class="co-link" href="javascript:;" @click.prevent="openRadar(c)">🎯 在招 {{ jobCountById[c.id] }} 岗 → 进入岗位雷达</a>
              <span v-else class="co-link qz-muted">岗位雷达暂未收录该公司岗位</span>
            </div>
            <div class="co-actions">
              <a v-if="c.url && c.url.startsWith('http')" :href="c.url" target="_blank" class="co-link">官网投递 →</a>
              <span v-else class="co-link qz-muted">{{ c.url }}</span>
              <span class="co-exam">
                <a :href="nowcoderSearch(c.name)" target="_blank" class="co-link" title="牛客面经搜索">📚真题</a>
                <a :href="codetopHome" target="_blank" class="co-link" title="CodeTop高频题频率榜">高频题</a>
              </span>
              <el-button size="small" text type="primary" @click="quickAdd(c)">加入看板</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 博士专项 -->
    <div class="qz-card">
      <h3>🎓 博士专项人才计划汇总</h3>
      <el-table :data="phdPrograms" size="small">
        <el-table-column prop="name" label="计划" width="220" />
        <el-table-column prop="salary" label="待遇参考" width="220" />
        <el-table-column prop="note" label="说明" />
        <el-table-column width="90">
          <template #default="{ row }">
            <a v-if="row.url.startsWith('http')" :href="row.url" target="_blank" style="color: var(--qz-primary)">官网</a>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 秋招流程 -->
    <div class="qz-card">
      <h3>🗓️ 企业秋招全流程（2027届节奏）</h3>
      <el-steps direction="vertical" :active="enterpriseFlow.phases.length">
        <el-step v-for="p in enterpriseFlow.phases" :key="p.name" :title="`${p.name}（${p.time}）`" :description="p.detail" :status="p.name.includes('提前批') ? 'process' : 'wait'" />
      </el-steps>
      <div class="qz-highlight-box">
        <b>过来人提示</b>
        <ul style="margin: 6px 0 0; padding-left: 18px">
          <li v-for="(t, i) in enterpriseFlow.tips" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar { margin-bottom: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
.co-radar { margin-top: 8px; }
.co-card {
  border: 1px solid var(--qz-card-border);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  height: calc(100% - 12px);
  display: flex;
  flex-direction: column;
}
.co-card:hover { border-color: var(--qz-primary); box-shadow: 0 2px 10px rgba(47, 84, 235, 0.08); }
.co-head { display: flex; justify-content: space-between; align-items: center; }
.co-name { font-size: 15px; font-weight: 700; }
.co-meta { margin-top: 6px; display: flex; align-items: center; gap: 8px; }
.co-city { font-size: 12px; color: var(--qz-text-sub); }
.co-tags { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; }
.co-dept { font-size: 12.5px; color: #444; margin-top: 8px; font-weight: 600; }
.co-note { font-size: 12.5px; color: var(--qz-text-sub); margin-top: 6px; line-height: 1.7; flex: 1; }
.co-phd { margin-top: 8px; font-size: 12.5px; color: #b45309; background: #fffbeb; border-radius: 6px; padding: 5px 8px; }
.co-actions { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.co-link { font-size: 12.5px; color: var(--qz-primary); text-decoration: none; }
.co-exam { display: inline-flex; gap: 8px; flex-shrink: 0; }
</style>
