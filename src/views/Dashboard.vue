<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore, daysUntil, todayStr } from '../composables/useStore'
import { builtinEvents, stageAdvice } from '../data/timeline'

const store = useStore()
const router = useRouter()

const allEvents = computed(() => {
  const custom = store.customEvents.map(e => ({ ...e, status: 'custom' }))
  return [...builtinEvents, ...custom]
    .filter(e => e.date)
    .sort((a, b) => (a.date > b.date ? 1 : -1))
})

const upcoming = computed(() =>
  allEvents.value
    .map(e => ({ ...e, days: daysUntil(e.date) }))
    .filter(e => e.days !== null && e.days >= -3 && e.days <= 60)
    .slice(0, 10)
)

// 关键倒计时：取未来最近的几个重要节点
const keyEvents = [
  { title: '大厂提前批冲刺截止', match: e => e.id === 'ev-qqb' },
  { title: '上海定向选调报名', match: e => e.id === 'ev-sh-xd' },
  { title: '北京定向选调公告', match: e => e.id === 'ev-bj-xd' },
  { title: '国考公告发布', match: e => e.id === 'ev-gk-gg' },
  { title: '国考笔试', match: e => e.id === 'ev-gk-bs' }
]
const countdowns = computed(() => {
  return keyEvents
    .map(k => {
      const ev = allEvents.value.find(e => k.match(e))
      if (!ev) return null
      let target = ev.date
      let suffix = ''
      // 区间事件：开始日已过但窗口未关 → 倒计时到截止日
      if (ev.end && daysUntil(ev.date) < 0 && daysUntil(ev.end) >= 0) {
        target = ev.end
        suffix = '（截止）'
      }
      return { ...ev, label: k.title + suffix, date: target, days: daysUntil(target) }
    })
    .filter(Boolean)
})

const currentStage = computed(() => {
  const today = todayStr()
  return stageAdvice.find(s => today <= s.until) || stageAdvice[stageAdvice.length - 1]
})

// 投递统计
const trackStats = computed(() => {
  const tracks = ['企业', '公务员', '选调']
  return tracks.map(t => {
    const apps = store.applications.filter(a => a.track === t)
    return {
      track: t,
      total: apps.length,
      done: apps.filter(a => a.status === 'Offer').length,
      active: apps.filter(a => ['已网申', '笔试', '面试'].includes(a.status)).length
    }
  })
})

const overdueApps = computed(() =>
  store.applications
    .filter(a => a.deadline && daysUntil(a.deadline) !== null && daysUntil(a.deadline) < 0 && !['Offer', '已拒', '暂缓'].includes(a.status))
)

function trackType(t) {
  return { 企业: 'primary', 公务员: 'warning', 选调: 'danger', 材料: 'info' }[t] || 'info'
}
function dayTag(d) {
  if (d < 0) return { text: `已过${-d}天`, type: 'info' }
  if (d === 0) return { text: '就是今天', type: 'danger' }
  if (d <= 7) return { text: `仅剩${d}天`, type: 'danger' }
  return { text: `还有${d}天`, type: 'warning' }
}
</script>

<template>
  <div>
    <!-- 阶段行动建议 -->
    <div class="qz-card">
      <h3>🧭 当前阶段 · {{ currentStage.stage }}</h3>
      <div class="qz-highlight-box">
        <ul style="margin:0; padding-left: 18px; line-height: 2">
          <li v-for="(a, i) in currentStage.actions" :key="i">{{ a }}</li>
        </ul>
      </div>
      <el-button size="small" text type="primary" @click="router.push('/calendar')">查看完整日历 →</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="16">
        <!-- 倒计时 -->
        <div class="qz-card">
          <h3>⏱️ 关键倒计时</h3>
          <el-row :gutter="12">
            <el-col v-for="c in countdowns" :key="c.id" :xs="12" :sm="8">
              <div class="cd-card" :class="{ urgent: c.days !== null && c.days <= 14 }">
                <div class="cd-days">{{ c.days < 0 ? '已过' : c.days }}<span v-if="c.days >= 0" class="unit">天</span></div>
                <div class="cd-label">{{ c.label }}</div>
                <div class="cd-date">{{ c.date }}<el-tag v-if="c.status === 'estimated'" size="small" type="info" effect="plain" style="margin-left:4px">预计</el-tag></div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 临近事项 -->
        <div class="qz-card">
          <h3>📌 未来60天节点（临近自动标红）</h3>
          <el-table :data="upcoming" size="small" :show-header="false">
            <el-table-column width="150" prop="date" />
            <el-table-column>
              <template #default="{ row }">
                <span :style="{ fontWeight: 600 }">{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column width="110" align="right">
              <template #default="{ row }">
                <el-tag size="small" :type="trackType(row.track)" effect="plain">{{ row.track }}</el-tag>
                <el-tag v-if="row.days !== null" size="small" :type="dayTag(row.days).type" style="margin-left:4px">
                  {{ dayTag(row.days).text }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!upcoming.length" class="qz-muted">暂无未来60天内节点</div>
        </div>
      </el-col>

      <el-col :xs="24" :md="8">
        <!-- 三赛道进度 -->
        <div class="qz-card">
          <h3>📊 三赛道投递概览</h3>
          <div v-for="t in trackStats" :key="t.track" class="track-stat" @click="router.push('/tracker')">
            <div class="ts-head">
              <el-tag :type="trackType(t.track)" size="small">{{ t.track }}</el-tag>
              <span class="ts-num">共 {{ t.total }} 条</span>
            </div>
            <div class="ts-bar">
              <div class="ts-bar-active" :style="{ width: (t.total ? (t.active / t.total) * 100 : 0) + '%' }" />
              <div class="ts-bar-done" :style="{ width: (t.total ? (t.done / t.total) * 100 : 0) + '%' }" />
            </div>
            <div class="ts-sub">
              进行中 {{ t.active }} · 已拿Offer {{ t.done }}
            </div>
          </div>
          <div v-if="!store.applications.length" class="qz-muted">
            还没有投递记录，去<a @click="router.push('/tracker')" style="color: var(--qz-primary); cursor: pointer"> 投递看板 </a>添加第一条
          </div>
        </div>

        <!-- 风险提醒 -->
        <div class="qz-card">
          <h3>🚨 需要注意</h3>
          <div class="qz-warning-box" v-if="overdueApps.length">
            有 {{ overdueApps.length }} 条投递已过截止日仍未有结果，去投递看板检查状态
          </div>
          <div class="qz-highlight-box" v-if="!store.profile.political">
            「个人档案」还没填政治面貌——它决定你能不能报定向选调（多数省要求党员），先去填一下
          </div>
          <div class="qz-highlight-box" v-if="store.profile.political && !['中共党员', '中共预备党员'].includes(store.profile.political)">
            你的政治面貌是「{{ store.profile.political }}」：定向选调多数省份要求党员，请把精力重点放在国考/省考和企业赛道
          </div>
          <div class="qz-muted" style="line-height: 1.8">
            本站时间节点最后核实于 2026-08-29，均为公开信息整理；「预计」类条目待官方公告后请到
            <a href="https://github.com/" target="_blank" style="color: var(--qz-primary)">数据文件</a>
            或个人档案页自行更新。
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.cd-card {
  background: linear-gradient(135deg, #f6f8ff, #eef2ff);
  border: 1px solid #dbe4ff;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
  text-align: center;
}
.cd-card.urgent { background: linear-gradient(135deg, #fff4f0, #ffe8e0); border-color: #ffcabb; }
.cd-days { font-size: 30px; font-weight: 800; color: var(--qz-primary); line-height: 1.1; }
.cd-card.urgent .cd-days { color: #e03e3e; }
.cd-days .unit { font-size: 13px; font-weight: 400; margin-left: 2px; }
.cd-label { font-size: 12.5px; margin-top: 4px; font-weight: 600; }
.cd-date { font-size: 11.5px; color: var(--qz-text-sub); margin-top: 2px; }

.track-stat { padding: 10px 8px; border-radius: 8px; cursor: pointer; }
.track-stat:hover { background: var(--qz-primary-light); }
.ts-head { display: flex; justify-content: space-between; align-items: center; }
.ts-num { font-size: 12.5px; color: var(--qz-text-sub); }
.ts-bar { height: 8px; background: #edf0f5; border-radius: 4px; margin: 8px 0 6px; overflow: hidden; position: relative; }
.ts-bar-active { position: absolute; left: 0; top: 0; height: 100%; background: #8ba3ff; }
.ts-bar-done { position: absolute; top: 0; height: 100%; right: 0; background: #22a35c; }
.ts-sub { font-size: 12px; color: var(--qz-text-sub); }
</style>
