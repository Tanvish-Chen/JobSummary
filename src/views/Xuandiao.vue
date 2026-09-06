<script setup>
import { computed } from 'vue'
import { xdIntro } from '../data/xuandiao'
import { useStore } from '../composables/useStore'

const store = useStore()

// 结合个人档案的资格自查
const eligibility = computed(() => {
  const p = store.profile
  return [
    {
      item: '政治面貌（党员/预备党员）',
      pass: ['中共党员', '中共预备党员'].includes(p.political),
      unknown: !p.political,
      must: true,
      tip: '多数省份定向选调硬性要求党员（预备可报）。群众/团员基本无缘定向选调，但国考省考不受限。'
    },
    {
      item: '学校在定向选调名单内',
      pass: p.isDoubleFirstClass === true,
      unknown: p.isDoubleFirstClass === null,
      must: true,
      tip: '定向选调面向「双一流」高校/学科名单（北京43+25所、浙江58所、江苏全国部分双一流）。到各省组织部官网附件核对学校全称。'
    },
    {
      item: '学生干部经历 或 校级以上奖励',
      pass: p.hasCadreExp === true || p.hasAwards === true,
      unknown: p.hasCadreExp === null && p.hasAwards === null,
      must: false,
      tip: '多数省份要求「党员+（学干/奖学金/优秀学生其一）」组合，具体以各省公告为准。'
    },
    {
      item: '2027届应届毕业',
      pass: true,
      unknown: false,
      must: true,
      tip: '博士年龄普遍放宽到40周岁以下，部分省对博士另有免笔试通道。'
    }
  ]
})

const hardBlocked = computed(() =>
  eligibility.value.some(e => e.must && e.pass === false && !e.unknown)
)
const hasUnknown = computed(() => eligibility.value.some(e => e.unknown))
const allPass = computed(() => !hardBlocked.value)
</script>

<template>
  <div class="qz-prose">
    <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
      选调公告窗口极短（上海2026年度只有两周）、且必须经学校推荐——这两个特点决定了选调是「信息战」。最后核实：2026-08-29。
    </el-alert>

    <!-- 是什么 -->
    <div class="qz-card">
      <h3>📖 选调生是什么</h3>
      <p v-for="(b, i) in xdIntro.what" :key="i" :style="{ marginTop: i ? '8px' : 0 }">{{ b }}</p>
    </div>

    <!-- 资格自查 -->
    <div class="qz-card">
      <h3>🪪 我的资格自查（结合个人档案，到「个人档案」页填写后自动判断）</h3>
      <el-alert v-if="hardBlocked" type="error" :closable="false" title="存在硬性条件不满足：定向选调可能受限，建议以国考省考+企业为主、选调为辅" style="margin-bottom: 10px" />
      <el-alert v-else-if="hasUnknown" type="info" :closable="false" title="有条件待确认：去「个人档案」填写后这里会自动给出判断" style="margin-bottom: 10px" />
      <el-alert v-else type="success" :closable="false" title="硬性条件初步满足，可以重点投入定向选调赛道" style="margin-bottom: 10px" />
      <el-table :data="eligibility" size="small">
        <el-table-column width="60">
          <template #default="{ row }">
            <el-tag v-if="row.unknown" type="info" size="small">待填写</el-tag>
            <el-tag v-else-if="row.pass" type="success" size="small">满足</el-tag>
            <el-tag v-else type="danger" size="small">不满足</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="item" label="条件" width="260" />
        <el-table-column prop="tip" label="说明与建议" />
      </el-table>
    </div>

    <!-- 三类对比 -->
    <div class="qz-card">
      <h3>🗂️ {{ xdIntro.types.title }}</h3>
      <el-table :data="xdIntro.types.rows" size="small">
        <el-table-column prop="type" label="类型" width="150" />
        <el-table-column prop="who" label="面向谁" />
        <el-table-column prop="work" label="岗位去向" width="140" />
        <el-table-column prop="key" label="关键点" width="260" />
      </el-table>
    </div>

    <!-- 硬性条件 -->
    <div class="qz-card">
      <h3>✅ {{ xdIntro.conditions.title }}</h3>
      <el-table :data="xdIntro.conditions.rows" size="small">
        <el-table-column prop="item" label="条件" width="130" />
        <el-table-column prop="detail" label="说明" />
      </el-table>
    </div>

    <!-- 全流程 -->
    <div class="qz-card">
      <h3>🧾 选调全流程（注意第1步！）</h3>
      <el-timeline>
        <el-timeline-item v-for="f in xdIntro.flow" :key="f.step" :timestamp="`第${f.step}步`" placement="top" :type="f.step === '1' ? 'danger' : 'primary'">
          <b>{{ f.name }}</b>
          <div class="qz-muted" style="margin-top: 3px">{{ f.detail }}</div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 省份对比 -->
    <div class="qz-card">
      <h3>🗺️ {{ xdIntro.provinces.title }}</h3>
      <el-table :data="xdIntro.provinces.rows" size="small">
        <el-table-column prop="prov" label="省份" width="70" />
        <el-table-column prop="name" label="项目名" width="190" />
        <el-table-column prop="scale" label="规模（2026年度）" width="150" />
        <el-table-column prop="time" label="时间（2026年度实据）" width="210" />
        <el-table-column prop="univ" label="高校范围" />
        <el-table-column prop="phd" label="博士要点" width="220" />
        <el-table-column width="90">
          <template #default="{ row }">
            <a :href="row.url" target="_blank" style="color: var(--qz-primary)">官网 →</a>
          </template>
        </el-table-column>
      </el-table>
      <div class="qz-warning-box">{{ xdIntro.provinces.note }}</div>
    </div>

    <!-- 博士提示 -->
    <div class="qz-card">
      <h3>💡 博士选调实战提示</h3>
      <div class="qz-highlight-box">
        <ul style="margin: 0; padding-left: 18px">
          <li v-for="(t, i) in xdIntro.phdTips" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>

    <!-- 渠道 -->
    <div class="qz-card">
      <h3>🔗 官方信息渠道</h3>
      <el-table :data="xdIntro.channels" size="small">
        <el-table-column prop="name" label="渠道" width="280" />
        <el-table-column prop="note" label="用途" />
        <el-table-column width="90">
          <template #default="{ row }">
            <a v-if="row.url" :href="row.url" target="_blank" style="color: var(--qz-primary)">打开 →</a>
            <span v-else class="qz-muted">见本校</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
