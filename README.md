# 🎯 秋招作战室 · 岗位雷达（JobSummary）

2027 届 AI 方向博士专属的一站式求职系统，由「秋招作战室」（Autumn_recruitment）与「AI 校招雷达」（find_job）合并而成。

覆盖 **企业 / 公务员 / 选调三赛道 + 岗位雷达 + 投递看板 + 秋招日历 + 面试笔试准备（含 59 题八股题库）+ 简历材料指南**。

技术栈：**Vue 3 + Vite + Element Plus**，部署在 **GitHub Pages**（免费，GitHub Actions 自动化）。

## 在线访问

<https://tanvish-chen.github.io/JobSummary/>

## 功能总览

| 页面 | 功能 |
|---|---|
| 作战仪表盘 | 阶段建议、求职倒计时、截止提醒 |
| 企业赛道 | 公司库（匹配度/博士专项/城市筛选），一键跳转岗位雷达查看在招岗位 |
| 岗位雷达 | AI 岗位聚合：方向/类别/公司/城市/状态六维筛选 + 关键词搜索 + 截止排序 + 临近截止高亮 + 数据老化标记 + 收藏与状态跟踪 |
| 公务员赛道 / 选调赛道 | 零基础入门、资格自查（由个人档案驱动）、京沪苏浙政策对比 |
| 投递进度看板 | 看板/表格双视图；与岗位雷达的状态实时同步，标注「雷达」来源 |
| 秋招日历 | 时间线 + 自定义事件 |
| 面试笔试准备 | 企业算法岗叙事模板、**八股题库（59 题）**、真题面经入口、行测申论 |
| 简历与材料 | 材料清单勾选 |
| 个人档案 | 驱动全站个性化；导出/导入备份；旧雷达迁移管理与撤销 |

## 本地运行

要求 Node.js ≥ 22.12，然后：

```bash
npm install
npm run validate   # 数据校验
npm run dev        # 访问 http://localhost:5173
```

## 数据维护手册（岗位更新流程）

岗位数据集中在 `src/data/jobs.json`，**支持在 GitHub 网页端直接编辑**：编辑 → 提交到 main → CI 自动校验并重新发布。

### 岗位字段规范

| 字段 | 必填 | 说明 |
|---|---|---|
| id | ✅ | 格式如 `deepseek-llm-01`，全表唯一 |
| company_id | ✅ | 必须是 `src/data/jobCompanies.json` 中已有的公司 id |
| title / direction / apply_url | ✅ | direction ∈ `llm / multimodal / infra / app / research / other`；apply_url 为官方投递直链 |
| deadline | – | `YYYY-MM-DD` 或 `null`（滚动招聘） |
| difficulty | ✅ | `{ "level": "高|中|低", "note": "…" }` |
| skills / cities / degree / status / source / fetched_at / headcount / note | – | status ∈ `open / closed` |
| last_verified_at | ✅ | 最近一次人工核实日期（`YYYY-MM-DD` 且 ≤ 今天）。deadline 岗 14 天、滚动岗 30 天未核实会标记「可能已过期」 |
| phd_preferred | ✅ | 明确优先博士 / 博士专项的岗位填 `true`（默认 `false`） |

### 提交前自查清单

1. `npm run validate` 通过（CI 也会再跑一遍，不过会直接拦下部署）；
2. 顶层 `updated_at` 改为本次更新日期；
3. 新增岗位的 `apply_url` 在浏览器里点开能直达岗位页；
4. 已关闭的岗位把 `status` 改为 `"closed"`（不要直接删除，保留历史）。

### 数据校验

`npm run validate` 会校验三份数据文件（`jobs.json` / `jobCompanies.json` / `questionBank.json`），并作为 GitHub Actions 部署的**前置步骤**——校验不过，部署不会执行，线上保持旧版。

## 数据隐私

投递记录、个人档案等个人数据仅存于浏览器 localStorage，不上传服务器。原「AI 校招雷达」的收藏与投递状态会在首次打开本站时提示自动迁移（可撤销、可稍后、可跳过），详见「个人档案 → 旧雷达迁移」。

## 部署

GitHub Actions 自动部署：push 到 main 即触发「数据校验 → 构建 → 发布」，见 `.github/workflows/deploy.yml`。

## 数据时效说明

时间节点核实于 2026-09-06（分档复核）；投递前务必以各公司官网为准。
