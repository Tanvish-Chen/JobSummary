<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore, genId, todayStr } from '../composables/useStore'
import { builtinEvents } from '../data/timeline'

const store = useStore()

const current = ref(new Date())
const year = computed(() => current.value.getFullYear())
const month = computed(() => current.value.getMonth())

const TRACK_COLORS = {
  企业: { bg: '#e8f1ff', color: '#1d4ed8' },
  公务员: { bg: '#fff4e0', color: '#b45309' },
  选调: { bg: '#ffe8e8', color: '#c0392b' },
  材料: { bg: '#e8f8ef', color: '#1a7f4b' },
  个人: { bg: '#f0e8ff', color: '#6d28d9' }
}

const allEvents = computed(() => {
  const custom = store.customEvents.map(e => ({ ...e, track: e.track || '个人', status: 'custom' }))
  return [...builtinEvents, ...custom]
})

// 日历网格：当月按周排布
const calendarCells = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const startWeekday = first.getDay() // 0=周日
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push({ empty: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const evs = allEvents.value.filter(e => {
      if (e.date === dateStr) return true
      if (e.end && e.date <= dateStr && dateStr <= e.end) return true
      return false
    })
    cells.push({ day: d, dateStr, events: evs, isToday: dateStr === todayStr() })
  }
  return cells
})

const monthEvents = computed(() =>
  allEvents.value
    .filter(e => e.date.startsWith(`${year.value}-${String(month.value + 1).padStart(2, '0')}`))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
)

function prevMonth() { current.value = new Date(year.value, month.value - 1, 1) }
function nextMonth() { current.value = new Date(year.value, month.value + 1, 1) }

// 自定义事件
const dialogVisible = ref(false)
const form = ref({ title: '', date: '', end: '', track: '个人', note: '' })
function openCreate() {
  form.value = { title: '', date: todayStr(), end: '', track: '个人', note: '' }
  dialogVisible.value = true
}
function save() {
  if (!form.value.title || !form.value.date) {
    ElMessage.warning('标题和日期必填')
    return
  }
  store.customEvents.push({ id: genId(), ...form.value })
  ElMessage.success('已添加')
  dialogVisible.value = false
}
function removeCustom(ev) {
  const idx = store.customEvents.findIndex(e => e.id === ev.id)
  if (idx > -1) store.customEvents.splice(idx, 1)
  ElMessage.success('已删除')
}
function statusTag(s) {
  return s === 'confirmed' ? 'success' : 'info'
}
</script>

<template>
  <div>
    <div class="qz-card">
      <div class="cal-toolbar">
        <div>
          <el-button size="small" @click="prevMonth">← 上月</el-button>
          <b style="font-size: 17px; margin: 0 14px">{{ year }} 年 {{ month + 1 }} 月</b>
          <el-button size="small" @click="nextMonth">下月 →</el-button>
          <el-button size="small" text type="primary" @click="current = new Date()">回到今天</el-button>
        </div>
        <el-button type="primary" size="small" @click="openCreate">＋ 自定义事件</el-button>
      </div>

      <div class="cal-grid">
        <div v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w" style="text-align:center; font-weight: 700; color: var(--qz-text-sub); font-size: 12px">{{ w }}</div>
        <div v-for="(c, i) in calendarCells" :key="i" class="cal-cell" :class="{ today: c.isToday }">
          <template v-if="!c.empty">
            <div class="cal-day">{{ c.day }}</div>
            <div
              v-for="ev in c.events.slice(0, 3)"
              :key="ev.id"
              class="cal-ev"
              :style="{ background: (TRACK_COLORS[ev.track] || TRACK_COLORS['个人']).bg, color: (TRACK_COLORS[ev.track] || TRACK_COLORS['个人']).color }"
              :title="ev.title"
            >
              {{ ev.title }}
            </div>
            <div v-if="c.events.length > 3" class="qz-muted" style="font-size: 11px">+{{ c.events.length - 3 }}条</div>
          </template>
        </div>
      </div>

      <div class="legend">
        <span v-for="(v, k) in TRACK_COLORS" :key="k" class="legend-item">
          <i :style="{ background: v.bg, border: `1px solid ${v.color}` }" />{{ k }}
        </span>
        <el-tag size="small" type="info" effect="plain">浅灰=按往年规律推测（estimated）</el-tag>
      </div>
    </div>

    <div class="qz-card">
      <h3>📋 本月节点清单</h3>
      <el-table :data="monthEvents" size="small">
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="title" label="事件" min-width="260" show-overflow-tooltip />
        <el-table-column prop="track" label="赛道" width="90">
          <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.track }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column width="130">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTag(row.status)">{{ row.status === 'confirmed' ? '已确认' : row.status === 'custom' ? '自定义' : '预计' }}</el-tag>
            <a v-if="row.url && row.url.startsWith('http')" :href="row.url" target="_blank" style="margin-left: 6px; color: var(--qz-primary)">源</a>
          </template>
        </el-table-column>
        <el-table-column width="70">
          <template #default="{ row }">
            <el-button v-if="row.status === 'custom'" size="small" text type="danger" @click="removeCustom(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!monthEvents.length" class="qz-muted">本月暂无节点</div>
    </div>

    <el-dialog v-model="dialogVisible" title="添加自定义事件" width="440px">
      <el-form :model="form" label-width="70px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="如：XX公司笔试" />
        </el-form-item>
        <el-form-item label="日期" required>
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="form.end" type="date" value-format="YYYY-MM-DD" style="width: 100%" placeholder="区间事件可填" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="form.track" style="width: 100%">
            <el-option value="个人" label="个人" />
            <el-option value="企业" label="企业" />
            <el-option value="公务员" label="公务员" />
            <el-option value="选调" label="选调" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.cal-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.legend { margin-top: 12px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.legend-item { font-size: 12px; color: var(--qz-text-sub); display: inline-flex; align-items: center; gap: 5px; }
.legend-item i { width: 14px; height: 14px; border-radius: 3px; display: inline-block; }
</style>
