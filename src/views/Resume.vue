<script setup>
import { ref, computed } from 'vue'
import { resumeGuide, materialChecklist, cityPolicies } from '../data/resume'
import { useStore } from '../composables/useStore'

const store = useStore()
const activeTab = ref('通用')

const tabs = ['通用', '企业', '公务员', '选调']

const checklistProgress = computed(() => {
  const all = Object.values(materialChecklist).flat()
  const done = all.filter(m => store.checklistDone[m.id]).length
  return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 }
})

function toggle(id) {
  if (store.checklistDone[id]) delete store.checklistDone[id]
  else store.checklistDone[id] = true
}
</script>

<template>
  <div>
    <div class="qz-card">
      <h3>📄 博士简历核心原则</h3>
      <el-row :gutter="14">
        <el-col v-for="p in resumeGuide.principles" :key="p.t" :xs="24" :sm="12" :lg="8">
          <div class="pr-box">
            <div class="pr-title">{{ p.t }}</div>
            <div class="pr-desc">{{ p.d }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <div class="qz-card">
          <h3>🧱 三版本结构模板</h3>
          <el-collapse>
            <el-collapse-item v-for="t in resumeGuide.templates" :key="t.name" :name="t.name">
              <template #title><b>{{ t.name }}</b></template>
              <div style="line-height: 2">{{ t.content }}</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-col>
      <el-col :xs="24" :md="12">
        <div class="qz-card">
          <h3>⚠️ 常见错误（博士尤其容易踩）</h3>
          <ul style="line-height: 2.1; padding-left: 20px; margin: 0">
            <li v-for="(m, i) in resumeGuide.commonMistakes" :key="i">{{ m }}</li>
          </ul>
        </div>
      </el-col>
    </el-row>

    <!-- 材料清单 -->
    <div class="qz-card">
      <h3>
        ✅ 材料准备清单
        <el-progress type="circle" :percentage="checklistProgress.pct" :width="44" :stroke-width="6" style="margin-left: auto" />
        <span class="qz-muted" style="margin-left: 8px">{{ checklistProgress.done }}/{{ checklistProgress.total }}</span>
      </h3>
      <el-tabs v-model="activeTab">
        <el-tab-pane v-for="t in tabs" :key="t" :label="t === '通用' ? '通用材料' : `${t}赛道`" :name="t" />
      </el-tabs>
      <div v-for="m in materialChecklist[activeTab]" :key="m.id" class="mat-row" @click="toggle(m.id)">
        <el-checkbox :model-value="!!store.checklistDone[m.id]" @click.stop="toggle(m.id)" />
        <div class="mat-main">
          <div class="mat-name" :class="{ done: store.checklistDone[m.id] }">{{ m.name }}</div>
          <div class="mat-why">{{ m.why }}</div>
        </div>
      </div>
      <div class="qz-muted" style="margin-top: 8px">勾选状态自动保存在本机浏览器。★ 为关键路径材料，缺了会直接卡住报名。</div>
    </div>

    <!-- 城市政策 -->
    <div class="qz-card">
      <h3>🏙️ 目标城市落户与人才补贴速查（2026-08核实）</h3>
      <el-table :data="cityPolicies" size="small">
        <el-table-column prop="city" label="城市" width="70" />
        <el-table-column prop="hukou" label="落户" min-width="220" />
        <el-table-column prop="subsidy" label="补贴" min-width="240" />
        <el-table-column prop="note" label="点评" min-width="180" />
        <el-table-column width="80">
          <template #default="{ row }">
            <a v-if="row.url" :href="row.url" target="_blank" style="color: var(--qz-primary)">来源 →</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="qz-warning-box">
        各地补贴政策变动频繁且常有「申领窗口期」（如南京需参保满6个月后申领、苏州园区需参保满12个月），入职后第一件事就是查当地人社局最新细则，错过窗口=放弃钱。
      </div>
    </div>
  </div>
</template>

<style scoped>
.pr-box { border: 1px solid var(--qz-card-border); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; height: calc(100% - 12px); }
.pr-title { font-weight: 700; color: var(--qz-primary); margin-bottom: 6px; }
.pr-desc { font-size: 13px; color: #444; line-height: 1.8; }
.mat-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 9px 10px; border-radius: 8px; cursor: pointer;
}
.mat-row:hover { background: var(--qz-primary-light); }
.mat-main { flex: 1; }
.mat-name { font-size: 13.5px; font-weight: 600; }
.mat-name.done { text-decoration: line-through; color: var(--qz-text-sub); }
.mat-why { font-size: 12px; color: var(--qz-text-sub); margin-top: 2px; }
</style>
