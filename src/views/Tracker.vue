<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore, genId, daysUntil } from '../composables/useStore'

const store = useStore()

const STATUSES = ['想投', '已网申', '笔试', '面试', 'Offer', '已拒', '暂缓']
const TRACKS = ['企业', '公务员', '选调']

const viewMode = ref('board') // board | table
const filterTrack = ref('全部')

const dialogVisible = ref(false)
const editing = ref(null)
const form = ref({})

const filteredApps = computed(() =>
  store.applications.filter(a => filterTrack.value === '全部' || a.track === filterTrack.value)
)

const boardData = computed(() =>
  STATUSES.map(s => ({
    status: s,
    items: filteredApps.value.filter(a => a.status === s)
  }))
)

function openCreate() {
  editing.value = null
  form.value = { company: '', position: '', track: '企业', status: '想投', deadline: '', url: '', note: '' }
  dialogVisible.value = true
}

function openEdit(app) {
  editing.value = app
  form.value = { ...app }
  dialogVisible.value = true
}

function save() {
  if (!form.value.company || !form.value.company.trim()) {
    ElMessage.warning('单位名称不能为空')
    return
  }
  if (editing.value) {
    Object.assign(editing.value, form.value)
    ElMessage.success('已更新')
  } else {
    store.applications.push({ id: genId(), createdAt: new Date().toISOString(), ...form.value })
    ElMessage.success('已添加投递记录')
  }
  dialogVisible.value = false
}

async function remove(app) {
  await ElMessageBox.confirm(`确定删除「${app.company} - ${app.position}」？`, '删除', { type: 'warning' })
  const idx = store.applications.findIndex(a => a.id === app.id)
  if (idx > -1) store.applications.splice(idx, 1)
  ElMessage.success('已删除')
}

const statusTagType = s => ({
  想投: 'info', 已网申: 'primary', 笔试: 'warning', 面试: 'warning', Offer: 'success', 已拒: 'danger', 暂缓: 'info'
}[s] || 'info')

const statusColor = s => ({
  想投: '#909399', 已网申: '#2f54eb', 笔试: '#e6a23c', 面试: '#e6a23c', Offer: '#22a35c', 已拒: '#e03e3e', 暂缓: '#909399'
}[s] || '#909399')

function deadlineTag(a) {
  const d = daysUntil(a.deadline)
  if (d === null) return null
  if (d < 0) return { text: `已过${-d}天`, type: 'info' }
  if (d === 0) return { text: '今天截止', type: 'danger' }
  if (d <= 7) return { text: `剩${d}天`, type: 'danger' }
  return { text: `剩${d}天`, type: 'warning' }
}
</script>

<template>
  <div>
    <div class="qz-card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="board">看板视图</el-radio-button>
          <el-radio-button value="table">表格视图</el-radio-button>
        </el-radio-group>
        <el-select v-model="filterTrack" size="small" style="width: 110px">
          <el-option value="全部" label="全部赛道" />
          <el-option v-for="t in TRACKS" :key="t" :value="t" :label="t" />
        </el-select>
        <span class="qz-muted">共 {{ filteredApps.length }} 条</span>
      </div>
      <el-button type="primary" @click="openCreate">＋ 添加投递</el-button>
    </div>

    <!-- 看板 -->
    <div v-if="viewMode === 'board'" class="kanban-board">
      <div v-for="col in boardData" :key="col.status" class="kanban-col">
        <div class="col-title">
          <span :style="{ color: statusColor(col.status) }">{{ col.status }}</span>
          <el-tag size="small" effect="plain">{{ col.items.length }}</el-tag>
        </div>
        <div v-for="a in col.items" :key="a.id" class="kanban-card" @click="openEdit(a)">
          <div class="kc-title">{{ a.company }}</div>
          <div class="kc-pos">{{ a.position }}</div>
          <div class="kc-meta">
            <el-tag size="small" effect="plain">{{ a.track }}</el-tag>
            <el-tag v-if="deadlineTag(a)" size="small" :type="deadlineTag(a).type">{{ deadlineTag(a).text }}</el-tag>
          </div>
        </div>
        <div v-if="!col.items.length" class="qz-muted" style="text-align: center; padding: 14px 0">空</div>
      </div>
    </div>

    <!-- 表格 -->
    <div v-else class="qz-card">
      <el-table :data="filteredApps" size="small">
        <el-table-column prop="company" label="单位" width="180" />
        <el-table-column prop="position" label="岗位" width="180" />
        <el-table-column prop="track" label="赛道" width="90">
          <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.track }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-select v-model="row.status" size="small">
              <el-option v-for="s in STATUSES" :key="s" :value="s" :label="s" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止" width="110">
          <template #default="{ row }">{{ row.deadline || '—' }}</template>
        </el-table-column>
        <el-table-column prop="note" label="备注" show-overflow-tooltip />
        <el-table-column label="来源" width="70">
          <template #default="{ row }">
            <el-tag v-if="row.jobId" size="small" type="success" effect="plain">雷达</el-tag>
            <span v-else class="qz-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column width="80" label="操作">
          <template #default="{ row }">
            <el-button size="small" text type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-empty v-if="!store.applications.length" description="还没有投递记录——从企业赛道页点「加入看板」快速添加，或点右上角手动添加" />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑投递' : '添加投递'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="单位" required>
          <el-input v-model="form.company" placeholder="如：字节跳动 / 国家公务员局（国考）" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input v-model="form.position" placeholder="如：大模型算法工程师 / 网信办某岗" />
        </el-form-item>
        <el-form-item label="赛道">
          <el-radio-group v-model="form.track">
            <el-radio-button v-for="t in TRACKS" :key="t" :value="t">{{ t }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="s in STATUSES" :key="s" :value="s" :label="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="form.url" placeholder="网申/公告链接" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="2" placeholder="薪资、内推人、材料要求等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
