<script setup>
import { ref, computed } from 'vue'
import { techInterview, civilExam, crossTrack } from '../data/interview'
import { companies } from '../data/companies'
import {
  githubResources, platformResources, civilExamResources,
  companyExtras, companyResourceLinks, usageTips
} from '../data/examResources'
import questionBank from '../data/questionBank.json'
import { RESOURCE_DEDUP_BLOCKLIST } from '../data/jobConfig'

const tab = ref('tech')

// —— 八股题库 tab（P4-3 / P4-5：resources 与「真题与面经」去重，只展示净增条目） ——
const qbCat = ref('')
const qbKeyword = ref('')
const bankResources = (questionBank.resources || [])
  .filter(r => !RESOURCE_DEDUP_BLOCKLIST.some(b => (r.url || '').includes(b)))
const qbVisible = computed(() => {
  const kw = qbKeyword.value.trim().toLowerCase()
  return questionBank.items.filter(it =>
    (!qbCat.value || it.category === qbCat.value) &&
    (!kw || (it.q + ' ' + it.a).toLowerCase().includes(kw))
  )
})
const catName = (id) => questionBank.categories.find(c => c.id === id)?.name || id
const catCount = (id) => questionBank.items.filter(it => it.category === id).length

// —— 公司真题速查工具 ——
const companyNames = companies.map(c => c.name)
const query = ref('字节跳动')
const suggestions = computed(() =>
  query.value
    ? companyNames.filter(n => n.includes(query.value.trim())).slice(0, 8)
    : []
)

// 公司名 → id 反查（用于命中公司专项资源）
const nameToId = Object.fromEntries(companies.map(c => [c.name, c.id]))
const queryLinks = computed(() => {
  const q = query.value.trim()
  if (!q) return []
  return companyResourceLinks(nameToId[q] || q, q)
})
const queryExtras = computed(() => companyExtras[nameToId[query.value.trim()] || ''] || [])
</script>

<template>
  <div>
    <el-tabs v-model="tab">
      <el-tab-pane label="🤖 企业算法岗" name="tech" />
      <el-tab-pane label="📖 八股题库" name="bank" />
      <el-tab-pane label="📚 真题与面经" name="papers" />
      <el-tab-pane label="📝 公务员行测申论" name="civil" />
      <el-tab-pane label="🎓 选调面试" name="xd" />
      <el-tab-pane label="🌍 外企英文面" name="foreign" />
    </el-tabs>

    <!-- 八股题库（自 find_job interview.json 迁入） -->
    <div v-if="tab === 'bank'">
      <div class="qz-card">
        <h3>📖 大模型八股题库（{{ questionBank.items.length }} 题 · 更新于 {{ questionBank.updated_at }}）</h3>
        <div class="search-row" style="margin-bottom: 12px">
          <el-radio-group v-model="qbCat" size="small">
            <el-radio-button value="">全部（{{ questionBank.items.length }}）</el-radio-button>
            <el-radio-button v-for="c in questionBank.categories" :key="c.id" :value="c.id">{{ c.name }}（{{ catCount(c.id) }}）</el-radio-button>
          </el-radio-group>
          <el-input v-model="qbKeyword" placeholder="搜索题目/答案关键词" clearable style="width: 240px" />
        </div>
        <el-collapse>
          <el-collapse-item v-for="it in qbVisible" :key="it.id" :name="it.id">
            <template #title>
              <el-tag size="small" effect="plain" style="margin-right: 8px; flex-shrink: 0">{{ catName(it.category) }}</el-tag>
              <b style="margin-right: 8px; font-weight: 600; white-space: normal">{{ it.q }}</b>
              <el-tag size="small" :type="it.freq === '高频' ? 'danger' : 'info'" effect="plain">{{ it.freq }}</el-tag>
            </template>
            <div style="line-height: 1.9; white-space: pre-wrap; padding: 4px 2px">{{ it.a }}</div>
          </el-collapse-item>
        </el-collapse>
        <div v-if="!qbVisible.length" class="qz-muted" style="text-align: center; padding: 20px 0">没有匹配的题目</div>
      </div>
      <div class="qz-card">
        <h3>🐙 配套开源学习资源（{{ bankResources.length }} 条 · 已与「真题与面经」去重）</h3>
        <el-row :gutter="12">
          <el-col v-for="r in bankResources" :key="r.url" :xs="24" :sm="12">
            <a :href="r.url" target="_blank" rel="noopener" class="res-card">
              <b>{{ r.name }}</b>
              <div class="qz-muted">{{ r.lang }} · {{ r.stars }}★ · {{ r.license }}</div>
              <div class="qz-muted">{{ r.desc }}</div>
            </a>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 真题与面经 -->
    <div v-if="tab === 'papers'">
      <div class="qz-card">
        <h3>🔍 公司真题速查（输入公司名，一键直达真题/面经入口）</h3>
        <div class="search-row">
          <el-input
            v-model="query"
            placeholder="输入公司名，如：字节跳动 / 米哈游 / 中国移动研究院"
            clearable
            style="max-width: 420px"
          />
        </div>
        <div v-if="suggestions.length && !companyNames.includes(query.trim())" class="sug-box">
          <el-tag
            v-for="s in suggestions"
            :key="s"
            size="small"
            style="cursor: pointer; margin: 0 6px 6px 0"
            @click="query = s"
          >{{ s }}</el-tag>
        </div>
        <template v-if="queryLinks.length">
          <div v-if="queryExtras.length" class="qz-highlight-box">
            <b>专项资源</b>
            <div v-for="e in queryExtras" :key="e.url" style="margin-top: 4px">
              <a :href="e.url" target="_blank" style="color: var(--qz-primary)">{{ e.name }} →</a>
            </div>
          </div>
          <el-row :gutter="12" style="margin-top: 10px">
            <el-col v-for="l in queryLinks" :key="l.name" :xs="12" :sm="6">
              <a :href="l.url" target="_blank" class="quick-link">{{ l.name }} →</a>
            </el-col>
          </el-row>
          <div class="qz-muted" style="margin-top: 8px">
            建议：先在牛客读面经（了解题型与流程），再去 CodeTop 按该公司频率榜刷题
          </div>
        </template>
      </div>

      <div class="qz-card">
        <h3>🐙 GitHub 真题与面经集锦（全部为公开仓库，已核实有效）</h3>
        <el-table :data="githubResources" size="small">
          <el-table-column prop="name" label="仓库" width="300" />
          <el-table-column prop="stars" label="推荐度" width="100" />
          <el-table-column prop="desc" label="内容" />
          <el-table-column width="90">
            <template #default="{ row }">
              <a :href="row.url" target="_blank" style="color: var(--qz-primary)">打开 →</a>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="qz-card">
        <h3>🌐 刷题与面经平台</h3>
        <el-table :data="platformResources" size="small">
          <el-table-column prop="name" label="平台" width="200" />
          <el-table-column prop="desc" label="用途" />
          <el-table-column width="90">
            <template #default="{ row }">
              <a :href="row.url" target="_blank" style="color: var(--qz-primary)">打开 →</a>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="qz-card">
        <h3>📝 考公真题资源（行测/申论）</h3>
        <el-table :data="civilExamResources" size="small">
          <el-table-column prop="name" label="资源" width="260" />
          <el-table-column prop="desc" label="说明" />
          <el-table-column width="90">
            <template #default="{ row }">
              <a :href="row.url" target="_blank" style="color: var(--qz-primary)">打开 →</a>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="qz-card">
        <h3>💡 真题使用策略</h3>
        <ul style="line-height: 2.1; padding-left: 20px; margin: 0">
          <li v-for="(t, i) in usageTips" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>

    <!-- 企业算法岗 -->
    <div v-if="tab === 'tech'">
      <div class="qz-card">
        <h3>🧱 技术面通用结构</h3>
        <el-steps direction="vertical" :active="techInterview.structure[0].items.length">
          <el-step v-for="(s, i) in techInterview.structure[0].items" :key="i" :title="`第${i + 1}环节`" :description="s" status="process" />
        </el-steps>
      </div>

      <div class="qz-card">
        <h3>🎤 你的三大方向「讲给面试官」叙事模板</h3>
        <el-collapse>
          <el-collapse-item v-for="n in techInterview.narratives" :key="n.dir" :name="n.dir">
            <template #title><b>{{ n.dir }}</b></template>
            <div class="qz-highlight-box">{{ n.story }}</div>
            <ol style="padding-left: 20px; line-height: 2">
              <li v-for="(p, i) in n.points" :key="i">{{ p }}</li>
            </ol>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="qz-card">
        <h3>📚 基础八股考点清单（按主题自测打勾）</h3>
        <el-row :gutter="16">
          <el-col v-for="b in techInterview.basics" :key="b.topic" :xs="24" :sm="12">
            <div class="topic-box">
              <div class="topic-title">{{ b.topic }}</div>
              <el-checkbox v-for="item in b.items" :key="item" :label="item" style="display: flex; margin-bottom: 4px; white-space: normal">{{ item }}</el-checkbox>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="qz-card">
        <h3>💻 手撕代码与笔试</h3>
        <ul style="line-height: 2.2; padding-left: 20px">
          <li v-for="(c, i) in techInterview.coding" :key="i">{{ c }}</li>
        </ul>
      </div>

      <div class="qz-card">
        <h3>🗣️ HR面高频问题</h3>
        <el-table :data="techInterview.hrInterview" size="small">
          <el-table-column prop="q" label="问题" width="280" />
          <el-table-column prop="a" label="回答思路" />
        </el-table>
      </div>

      <div class="qz-card">
        <h3>🧭 跨界赛道准备（车企/游戏/具身智能/科研机构）</h3>
        <el-collapse>
          <el-collapse-item v-for="c in crossTrack" :key="c.track" :name="c.track">
            <template #title><b>{{ c.track }}</b></template>
            <ul style="line-height: 2; padding-left: 20px; margin: 0">
              <li v-for="(p, i) in c.points" :key="i">{{ p }}</li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 公务员 -->
    <div v-if="tab === 'civil'">
      <div class="qz-card">
        <h3>📐 行测备考策略（博士版）</h3>
        <ul style="line-height: 2.2; padding-left: 20px">
          <li v-for="(x, i) in civilExam.xingce" :key="i">{{ x }}</li>
        </ul>
      </div>
      <div class="qz-card">
        <h3>✍️ 申论备考策略</h3>
        <ul style="line-height: 2.2; padding-left: 20px">
          <li v-for="(x, i) in civilExam.shenlun" :key="i">{{ x }}</li>
        </ul>
      </div>
      <div class="qz-highlight-box">
        备考资源建议：粉笔APP（行测刷题+模考）、华图/中公模块宝典、人民日报评论版APP（申论素材）。
        从现在到国考约3个月：第1个月分模块学方法，第2个月套题限时训练，第3个月模考+申论批改。
      </div>
    </div>

    <!-- 选调面试 -->
    <div v-if="tab === 'xd'">
      <div class="qz-card">
        <h3>🎓 选调面谈/面试要点</h3>
        <ul style="line-height: 2.2; padding-left: 20px">
          <li v-for="(x, i) in civilExam.xuandiaoMianshi" :key="i">{{ x }}</li>
        </ul>
      </div>
      <div class="qz-warning-box">
        提醒：选调面试时间经常在国考笔试前后交错进行，11-12月会出现「一周三考」的极端日程——提前在日历页把各场考试标出来，别撞车。
      </div>
    </div>

    <!-- 外企 -->
    <div v-if="tab === 'foreign'">
      <div class="qz-card">
        <h3>🌍 外企面试攻略</h3>
        <ul style="line-height: 2.2; padding-left: 20px">
          <li v-for="(x, i) in techInterview.foreignCompany" :key="i">{{ x }}</li>
        </ul>
      </div>
      <div class="qz-card">
        <h3>🔤 英文自我介绍骨架（1分钟版）</h3>
        <div class="qz-highlight-box" style="font-family: Consolas, monospace">
          I'm [name], a Ph.D. candidate in [major] at [university], expecting to graduate in [2027].<br />
          My research focuses on trustworthy AI — including [LLM watermarking], [adversarial robustness], and [semantic communication] — which addresses "how to make AI systems reliable in the real world."<br />
          I have published [N] first-author papers at [venues].<br />
          I'm excited about this role because [specific team/product reason], where I can bring both research depth and engineering delivery.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topic-box {
  border: 1px solid var(--qz-card-border);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.topic-title { font-weight: 700; margin-bottom: 8px; color: var(--qz-primary); }
.search-row { display: flex; gap: 10px; align-items: center; }
.sug-box { margin-top: 10px; padding: 8px 10px; background: #fafbfc; border: 1px dashed var(--qz-card-border); border-radius: 8px; }
.quick-link {
  display: block;
  text-align: center;
  padding: 12px 8px;
  margin-bottom: 10px;
  background: var(--qz-primary-light);
  border: 1px solid #dbe4ff;
  border-radius: 8px;
  color: var(--qz-primary);
  font-weight: 600;
  font-size: 13.5px;
  text-decoration: none;
}
.quick-link:hover { background: #e3eaff; border-color: var(--qz-primary); }
.res-card {
  display: block; border: 1px solid var(--qz-card-border); border-radius: 8px;
  padding: 10px 12px; margin-bottom: 10px; text-decoration: none; color: inherit;
  line-height: 1.7;
}
.res-card b { color: var(--qz-primary); }
.res-card:hover { border-color: var(--qz-primary); box-shadow: 0 2px 8px rgba(47, 84, 235, 0.08); }
</style>
