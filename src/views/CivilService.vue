<script setup>
import { civilIntro } from '../data/civilService'
</script>

<template>
  <div class="qz-prose">
    <el-alert type="info" :closable="false" style="margin-bottom: 16px">
      本页是零基础入门指南：从「公务员是什么」到「怎么报名考上」的完整流程。所有时间节点最后核实于 2026-08-29，2027国考公告未发布前均为规律预测，最终以
      <a href="http://www.scs.gov.cn" target="_blank">国家公务员局官网</a> 为准。
    </el-alert>

    <!-- 是什么 -->
    <div class="qz-card">
      <h3>📖 {{ civilIntro.what.title }}</h3>
      <p v-for="(b, i) in civilIntro.what.blocks" :key="i" :style="{ marginTop: i ? '8px' : 0 }">{{ b }}</p>
    </div>

    <!-- 部门映射 -->
    <div class="qz-card">
      <h3>🎯 {{ civilIntro.deptMatch.title }}</h3>
      <el-table :data="civilIntro.deptMatch.rows" size="small">
        <el-table-column prop="dir" label="你的方向" width="220" />
        <el-table-column prop="depts" label="对口部门" />
      </el-table>
      <div class="qz-warning-box">{{ civilIntro.deptMatch.note }}</div>
    </div>

    <!-- 路径 -->
    <div class="qz-card">
      <h3>🛤️ 两条主路径 + 补充渠道</h3>
      <el-collapse accordion>
        <el-collapse-item v-for="p in civilIntro.paths" :key="p.name" :name="p.name">
          <template #title>
            <b>{{ p.name }}</b>
            <el-tag size="small" type="warning" effect="plain" style="margin-left: 10px">{{ p.time }}</el-tag>
          </template>
          <p><b>适合谁：</b>{{ p.target }}</p>
          <ul>
            <li v-for="(d, i) in p.detail" :key="i">{{ d }}</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 报名条件 -->
    <div class="qz-card">
      <h3>✅ {{ civilIntro.conditions.title }}</h3>
      <el-table :data="civilIntro.conditions.rows" size="small">
        <el-table-column prop="item" label="条件" width="110" />
        <el-table-column prop="detail" label="说明" />
      </el-table>
    </div>

    <!-- 全流程 -->
    <div class="qz-card">
      <h3>🧾 报考全流程十步走</h3>
      <el-timeline>
        <el-timeline-item v-for="f in civilIntro.flow" :key="f.step" :timestamp="`第${f.step}步`" placement="top" type="primary">
          <b>{{ f.name }}</b>
          <div class="qz-muted" style="margin-top: 3px">{{ f.detail }}</div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- 博士提示 -->
    <div class="qz-card">
      <h3>💡 博士考公提示</h3>
      <div class="qz-highlight-box">
        <ul style="margin: 0; padding-left: 18px">
          <li v-for="(t, i) in civilIntro.phdTips" :key="i">{{ t }}</li>
        </ul>
      </div>
    </div>

    <!-- 渠道 -->
    <div class="qz-card">
      <h3>🔗 官方信息渠道（全部收藏）</h3>
      <el-table :data="civilIntro.channels" size="small">
        <el-table-column prop="name" label="渠道" width="300" />
        <el-table-column prop="note" label="用途" />
        <el-table-column width="100">
          <template #default="{ row }">
            <a v-if="row.url" :href="row.url" target="_blank" style="color: var(--qz-primary)">打开 →</a>
            <span v-else class="qz-muted">见本校</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
