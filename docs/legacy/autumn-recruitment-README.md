# 🎯 秋招作战室（2027届 AI 博士专属求职网站）

个人定制秋招求职平台：企业 / 公务员 / 选调三赛道 + 投递看板 + 秋招日历 + 面试笔试准备 + 简历材料指南。

技术栈：**Vite + Vue 3 + Element Plus**，部署在 **GitHub Pages**（免费）。

---

## 一、本地运行

需要先安装 [Node.js](https://nodejs.org/)（LTS 版本，安装时一路下一步即可）。

```bash
npm install     # 第一次运行前安装依赖
npm run dev     # 启动开发服务器，按提示打开 http://localhost:5173
```

## 二、发布到 GitHub Pages（已完成配置）

仓库地址：https://github.com/Tanvish-Chen/Autumn_recruitment
上线地址（Pages 开启后自动生成）：**https://tanvish-chen.github.io/Autumn_recruitment/**

首次设置（只需一次）：

1. 打开仓库页面 → **Settings → Pages → Build and deployment → Source 选择 `GitHub Actions`**。
2. 等 Actions 跑完（约1分钟），访问上面的上线地址。

之后每次改动 push 到 main，网站会**自动重新发布**。

> 手机也能用：网站是响应式的，浏览器收藏网站地址即可随时查看。

## 三、日常怎么用

| 页面 | 用途 |
|------|------|
| 作战仪表盘 | 每天打开先看：阶段行动建议、关键倒计时、临近截止事项 |
| 企业赛道 | 研究方向→岗位映射、公司库筛选、博士专项计划、秋招流程 |
| 公务员赛道 | 零基础入门：是什么/怎么报/全流程/官方渠道 |
| 选调赛道 | 零基础入门 + 结合个人档案的**资格自查** + 京沪苏浙政策对比 |
| 投递进度看板 | 记录每条投递的状态流转，防止漏投漏跟进 |
| 秋招日历 | 2027届关键节点（带来源），可加自定义事件 |
| 面试笔试准备 | 算法岗叙事模板/八股清单/手撕题单 + 行测申论 + 选调面谈 + 外企 |
| 简历与材料 | 博士简历原则、三版本模板、材料清单（可勾选）、落户补贴速查 |
| 个人档案 | 填一次，驱动选调资格自查；数据导出/导入备份 |

**个人数据**（投递记录、档案、清单勾选）保存在浏览器 localStorage，不上传任何服务器。
换电脑或清缓存前，在「个人档案」页点 **导出备份**；新设备点 **导入备份**。

## 四、怎么更新招聘信息（重要）

所有内容数据都在 `src/data/` 目录，用任意编辑器（如 VS Code）打开就能改：

| 文件 | 内容 |
|------|------|
| `companies.js` | 公司库：加公司就是往 `companies` 数组里加一个对象；`match` 字段是对你背景的匹配度 1-3 |
| `timeline.js` | 秋招时间线：官方公告发布后，把 `status: 'estimated'` 改成 `'confirmed'` 并更新日期；`stageAdvice` 是仪表盘的阶段建议 |
| `civilService.js` / `xuandiao.js` | 公务员/选调知识库 |
| `interview.js` | 面试题库与攻略 |
| `resume.js` | 简历指南、材料清单、城市补贴政策 |

改完提交：

```bash
git add . && git commit -m "更新：XX公司网申时间" && git push
```

## 五、快速更新速查

| 要做什么 | 怎么做 |
|----------|--------|
| 加一家公司 | `src/data/companies.js` 的 `companies` 数组里加一个对象（照抄格式即可） |
| 官方公告出了、时间确定了 | `src/data/timeline.js` 找到对应事件，改 `date` 并把 `status` 改成 `confirmed` |
| 加自定义提醒 | 直接在网站「秋招日历」页点「自定义事件」，无需改代码 |
| 改完发布 | `git add . && git commit -m "说明" && git push`，1分钟后生效 |
| 换电脑迁移 | 装 Node.js → clone 本仓库 → `npm install` → 浏览器数据用「个人档案」页导出/导入 |

## 五、信息时效性说明

站内时间节点最后核实于 **2026-08-29**（联网检索官方来源），标注「预计」的条目是按往年规律推测。
**报名/考试时间一律以官方公告为准**，重点官方入口：

- 国考：[国家公务员局](http://www.scs.gov.cn)
- 北京选调：[北京组工网](https://www.bjdj.gov.cn) ｜ 上海：[学生就业创业服务网](https://www.firstjob.shec.edu.cn)
- 江苏选调：[江苏先锋网](https://www.jszzb.gov.cn) ｜ 浙江选调：[浙江组织工作网](https://www.zjzzb.gov.cn)
- **学校就业信息网：定向选调与中央选调的第一信息源，每周必刷**
