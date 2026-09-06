<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  useStore, exportData, importData, resetData,
  undoMigration, MIGRATED_KEY, MIGRATE_SNOOZE_KEY
} from '../composables/useStore'

const store = useStore()

// —— 旧雷达迁移管理（P2-4） ——
const migratedCount = computed(() => store.applications.filter(a => a.migrationBatch === 'airadar-v1' && !a.mergeBackup).length)
const mergedCount = computed(() => store.applications.filter(a => a.mergeBackup).length)
const skippedList = computed(() => store.migration?.skipped || [])

async function onUndoMigration() {
  await ElMessageBox.confirm(
    `将删除迁移导入的 ${migratedCount.value} 条记录，并把 ${mergedCount.value} 条合并记录恢复原状。确定？`,
    '撤销迁移', { type: 'warning', confirmButtonText: '撤销', cancelButtonText: '取消' }
  )
  undoMigration()
  ElMessage.success('已撤销迁移，下次打开首页将重新弹出迁移向导')
}

function resetMigrationWizard() {
  localStorage.removeItem(MIGRATED_KEY)
  localStorage.removeItem(MIGRATE_SNOOZE_KEY)
  ElMessage.success('迁移向导已重置，下次打开首页将重新询问')
}

const cities = ['北京', '上海', '杭州', '苏州', '南京']
const politicalOptions = ['中共党员', '中共预备党员', '共青团员', '群众']

const fileInput = ref(null)

function triggerImport() {
  fileInput.value.click()
}

async function onImportFile(ev) {
  const file = ev.target.files[0]
  if (!file) return
  try {
    const text = await file.text()
    await ElMessageBox.confirm('导入会覆盖当前本地数据（投递记录/档案/清单），确定继续？', '导入备份', { type: 'warning' })
    importData(text)
    ElMessage.success('导入成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('导入失败：' + (e.message || '文件格式不正确'))
  }
  ev.target.value = ''
}

async function onReset() {
  await ElMessageBox.confirm('将清空所有本地数据（投递记录、档案、清单勾选、自定义事件），此操作不可恢复！', '危险操作', { type: 'error', confirmButtonText: '确认清空', cancelButtonText: '取消' })
  resetData()
  ElMessage.success('已重置')
}
</script>

<template>
  <div>
    <div class="qz-card">
      <h3>👤 个人档案（驱动全站个性化：选调资格自查、城市默认筛选等）</h3>
      <el-form :model="store.profile" label-width="110px" style="max-width: 720px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="store.profile.name" placeholder="选填，用于页头显示" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业届别">
              <el-input value="2027届" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学校">
              <el-input v-model="store.profile.school" placeholder="全称，用于核对选调名单" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学院">
              <el-input v-model="store.profile.college" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="专业">
              <el-input v-model="store.profile.major" placeholder="如：信息与通信工程" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生源省份">
              <el-input v-model="store.profile.originProvince" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="政治面貌">
          <el-radio-group v-model="store.profile.political">
            <el-radio-button v-for="p in politicalOptions" :key="p" :value="p">{{ p }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="双一流高校?">
          <el-radio-group v-model="store.profile.isDoubleFirstClass">
            <el-radio-button :value="true">是（高校/学科）</el-radio-button>
            <el-radio-button :value="false">否</el-radio-button>
            <el-radio-button :value="null">未确认</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="学生干部经历">
          <el-radio-group v-model="store.profile.hasCadreExp">
            <el-radio-button :value="true">有</el-radio-button>
            <el-radio-button :value="false">无</el-radio-button>
            <el-radio-button :value="null">未确认</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="校级以上奖励">
          <el-radio-group v-model="store.profile.hasAwards">
            <el-radio-button :value="true">有</el-radio-button>
            <el-radio-button :value="false">无</el-radio-button>
            <el-radio-button :value="null">未确认</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标城市">
          <el-checkbox-group v-model="store.profile.targetCities">
            <el-checkbox v-for="c in cities" :key="c" :value="c">{{ c }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="store.profile.notes" type="textarea" :rows="2" placeholder="导师要求、可到岗时间等自由记录" />
        </el-form-item>
      </el-form>
    </div>

    <div class="qz-card">
      <h3>💾 数据管理</h3>
      <div class="qz-muted" style="margin-bottom: 12px; line-height: 1.9">
        个人数据（投递记录、档案、材料清单、自定义事件）只保存在当前浏览器里，不会上传。
        换电脑、重装系统或清理浏览器缓存前，请先导出备份文件。
      </div>
      <el-space wrap>
        <el-button type="primary" @click="exportData">导出备份（JSON）</el-button>
        <el-button @click="triggerImport">导入备份</el-button>
        <input ref="fileInput" type="file" accept=".json" style="display: none" @change="onImportFile" />
        <el-button type="danger" plain @click="onReset">清空全部数据</el-button>
      </el-space>
    </div>

    <div class="qz-card">
      <h3>🧭 旧雷达迁移（AI 校招雷达 → 本站）</h3>
      <div class="qz-muted" style="margin-bottom: 10px; line-height: 1.9">
        已迁移导入 <b>{{ migratedCount }}</b> 条投递记录，合并 <b>{{ mergedCount }}</b> 条既有记录。
        <template v-if="skippedList.length">另有 {{ skippedList.length }} 条自动跳过：</template>
      </div>
      <ul v-if="skippedList.length" style="margin: 0 0 10px; padding-left: 18px; line-height: 1.8">
        <li v-for="s in skippedList" :key="s.jobId" class="qz-muted">{{ s.company }} · {{ s.title }}（{{ s.reason }}）</li>
      </ul>
      <el-space wrap>
        <el-button v-if="migratedCount || mergedCount" type="warning" plain @click="onUndoMigration">撤销上次迁移</el-button>
        <el-button @click="resetMigrationWizard">重置迁移向导</el-button>
      </el-space>
    </div>

    <div class="qz-card">
      <h3>ℹ️ 本站使用说明</h3>
      <ul style="line-height: 2.1; padding-left: 20px; margin: 0" class="qz-prose">
        <li><b>内容数据</b>（公司库、考公考选知识、时间线）在项目 <code>src/data/</code> 目录下，打开对应 .js 文件即可增改；改完 git push 后 GitHub Pages 会自动重新发布。</li>
        <li><b>时间线</b>里「预计」标签 = 按往年规律推测；官方公告发布后请把日期改成实际值并把状态改为 confirmed。</li>
        <li><b>仪表盘</b>的阶段建议按今天日期自动切换，越临近截止的事项显示越红。</li>
        <li>建议每周固定刷一次三件事：学校就业网 → 各省组织部官网 → 本站日历核对。</li>
      </ul>
    </div>
  </div>
</template>
