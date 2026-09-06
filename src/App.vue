<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore, todayStr, MIGRATED_KEY, MIGRATE_SNOOZE_KEY, migrationGate, planMigration, applyMigration } from './composables/useStore'
import { loadJobData } from './lib/jobData'

const route = useRoute()
const store = useStore()

const menus = [
  { path: '/', title: '作战仪表盘', icon: 'Odometer' },
  { path: '/enterprise', title: '企业赛道', icon: 'OfficeBuilding' },
  { path: '/jobs', title: '岗位雷达', icon: 'Aim' },
  { path: '/civil-service', title: '公务员赛道', icon: 'Medal' },
  { path: '/xuandiao', title: '选调赛道', icon: 'Promotion' },
  { path: '/tracker', title: '投递进度看板', icon: 'DataBoard' },
  { path: '/calendar', title: '秋招日历', icon: 'Calendar' },
  { path: '/interview', title: '面试笔试准备', icon: 'EditPen' },
  { path: '/resume', title: '简历与材料', icon: 'Document' },
  { path: '/profile', title: '个人档案', icon: 'User' }
]

const pageTitle = computed(() => route.meta.title || '')
const dateText = computed(() => {
  const d = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${todayStr()} 星期${week}`
})

// —— 旧雷达（find_job）数据一次性迁移（P2-2：先查 key，再按需动态加载，禁静态 import） ——
onMounted(async () => {
  const gate = migrationGate()
  if (!gate.show) return
  try {
    const [{ default: jobsDoc }, { default: companiesDoc }] = await Promise.all([
      import('./data/jobs.json'),
      import('./data/jobCompanies.json')
    ])
    const { jobs, companyMap } = loadJobData(jobsDoc, companiesDoc)
    const plan = planMigration(jobs, companyMap)
    if (!plan.imports.length && !plan.merges.length) {
      localStorage.setItem(MIGRATED_KEY, 'nothing-to-migrate')
      return
    }
    const preview = plan.imports.slice(0, 5)
      .map(it => `　${it.company} · ${it.job.title} → 「${it.status}」`)
      .join('\n')
    const summary = [
      `检测到旧「AI 校招雷达」数据：将导入 ${plan.imports.length} 条、合并 ${plan.merges.length} 条、跳过 ${plan.skipped.length} 条。`,
      preview,
      plan.imports.length > 5 ? `　…以及另外 ${plan.imports.length - 5} 条` : ''
    ].filter(Boolean).join('\n')

    // 三按钮：确认=立即迁移；取消=稍后提醒（7 天）；右上角关闭=不再迁移（P2-3）
    const action = await ElMessageBox.confirm(summary, '迁移旧雷达数据', {
      distinguishCancelAndClose: true,
      confirmButtonText: '立即迁移',
      cancelButtonText: '稍后提醒（7 天）',
      type: 'info'
    }).then(() => 'migrate').catch((e) => (e === 'cancel' ? 'snooze' : 'dismiss'))

    if (action === 'migrate') {
      applyMigration(plan)
      localStorage.setItem(MIGRATED_KEY, '1')
      ElMessage.success(`迁移完成：导入 ${plan.imports.length} 条、合并 ${plan.merges.length} 条，可在「个人档案」撤销`)
    } else if (action === 'snooze') {
      localStorage.setItem(MIGRATE_SNOOZE_KEY, new Date(Date.now() + 7 * 86400000).toISOString())
    } else {
      localStorage.setItem(MIGRATED_KEY, 'dismissed')
    }
  } catch (e) {
    console.warn('迁移预检失败（不影响正常使用）', e)
  }
})
</script>

<template>
  <el-container class="qz-layout">
    <el-aside class="qz-aside" width="232px">
      <div class="qz-logo">
        🎯 秋招作战室
        <span class="sub">2027届 · AI方向博士专属</span>
      </div>
      <el-menu
        class="qz-menu"
        background-color="#001529"
        text-color="rgba(255,255,255,0.66)"
        active-text-color="#ffffff"
        :default-active="route.path"
        router
      >
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
          <el-icon><component :is="m.icon" /></el-icon>
          <span>{{ m.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="qz-header" height="56px">
        <div class="title">{{ pageTitle }}</div>
        <div class="date-info">
          今天是 {{ dateText }}
          <el-tag v-if="store.profile.name" size="small" type="primary" effect="plain" style="margin-left: 10px">
            {{ store.profile.name }} · 加油
          </el-tag>
        </div>
      </el-header>
      <el-main class="qz-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>
