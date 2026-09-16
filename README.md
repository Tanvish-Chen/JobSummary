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

## 其他数据文件维护

除上一节的岗位数据外，其余内容数据都在 `src/data/` 目录，用任意编辑器（如 VS Code）打开就能改。作战室部分：

| 文件 | 内容 |
|---|---|
| `companies.js` | 公司库：加公司就是往 `companies` 数组里加一个对象；`match` 字段是对你背景的匹配度 1-3 |
| `timeline.js` | 秋招时间线：官方公告发布后，把 `status: 'estimated'` 改成 `'confirmed'` 并更新日期；`stageAdvice` 是仪表盘的阶段建议 |
| `civilService.js` / `xuandiao.js` | 公务员 / 选调知识库 |
| `interview.js` | 面试题库与攻略 |
| `resume.js` | 简历指南、材料清单、城市补贴政策 |

### 岗位雷达的公司清单（jobCompanies.json）

岗位记录里的 `company_id` 必须是 `src/data/jobCompanies.json` 中已有的 id。**新增公司要先在这里加一条，再往 `jobs.json` 加岗位**，否则 `npm run validate` 会拦下部署。字段：`id` / `name` / `group`（`ai_native` AI 原生公司、`big_tech` 大厂 AI 岗、`foreign_lab` 外企·研究机构）/ 官方校招页地址 / 招聘系统类型。

> 注意：这里的 25 家是「有岗位的公司」；作战室企业赛道的完整公司库在 `src/data/companies.js`（77 家），两者通过 `src/data/jobConfig.js` 的 `COMPANY_ALIAS` 做 id 映射。

### 八股题库维护（questionBank.json）

题库在 `src/data/questionBank.json`：`categories`（8 个分类）、`items`（题目：`id / category / q / a / freq`）、`resources`（外链仓库，含 `license` 字段）。**新增题目**直接在 `items` 数组里复制模板加一条即可（`category` 必须是已有分类 id，`id` 不要重复）。

**版权说明**：`items` 为本站依据公开通行知识原创整理；知名中文面试仓库（如 wdndev/llm_interview_note、DeepLearning-500-questions 等）因许可证限制**只外链不搬运内容**，`resources` 中标注了各仓库许可证，浏览 GitHub 原仓库不受限制。

**资源去重**：`resources` 中有 3 条（wdndev/llm_interview_note、adongwanai/AgentGuide、datawhalechina）与作战室「真题与面经」页重复，作战室版本更深，因此八股题库 tab 只展示净增的 7 条——屏蔽表在 `src/data/jobConfig.js` 的 `RESOURCE_DEDUP_BLOCKLIST`，**在渲染层过滤，JSON 数据保持完整**。

### 快速更新速查

| 要做什么 | 怎么做 |
|---|---|
| 加一家公司（作战室企业赛道） | `src/data/companies.js` 的 `companies` 数组里加一个对象（照抄格式即可） |
| 加一个 AI 岗位 | 先确认公司已在 `src/data/jobCompanies.json` 里，再往 `jobs.json` 的 `jobs` 数组加记录（模板见上一节） |
| 加一道八股题 | `src/data/questionBank.json` 的 `items` 数组加一条（`category` 用已有分类 id） |
| 官方公告出了、时间确定了 | `src/data/timeline.js` 找到对应事件，改 `date` 并把 `status` 改成 `confirmed` |
| 加自定义提醒 | 直接在网站「秋招日历」页点「自定义事件」，无需改代码 |
| 改完发布 | 网页端直接编辑提交；或本地克隆后 `git add . && git commit -m "说明" && git push`，1 分钟后生效 |
| 换电脑迁移 | 装 Node.js → clone 本仓库 → `npm install` → 浏览器数据用「个人档案」页导出 / 导入 |

## 官方信息入口

站内时间节点最后核实于 **2026-08-29**（联网检索官方来源），标注「预计」的条目是按往年规律推测。**报名 / 考试时间一律以官方公告为准**：

- 国考：[国家公务员局](http://www.scs.gov.cn)
- 北京选调：[北京组工网](https://www.bjdj.gov.cn) ｜ 上海：[学生就业创业服务网](https://www.firstjob.shec.edu.cn)
- 江苏选调：[江苏先锋网](https://www.jszzb.gov.cn) ｜ 浙江选调：[浙江组织工作网](https://www.zjzzb.gov.cn)
- **学校就业信息网：定向选调与中央选调的第一信息源，每周必刷**

## 岗位数据核实记录

> 本节自原「AI 校招雷达」（find_job）README 迁入，保留首轮实地核实的一手记录：哪些公司的岗位来自哪个校招通道、哪些公司在什么时间点核实过、下一轮该盯谁。

### 覆盖公司与在招岗位数（2026-08-28 首轮核实）

首版数据来自**各公司官方校招页的人工核实采集**（2026-08-28），均为真实、可溯源的岗位，未做任何编造。共 **25 家公司、131 个全职校招岗位**：

| 公司 | 校招通道 | 岗位数 |
|---|---|---|
| 月之暗面（Kimi） | Moka 校招页 | 9 |
| 阶跃星辰（StepFun） | Moka 校招页（StepStar 计划，截止 10-30） | 11 |
| 商汤科技 | 官方 2027 校招（截止 12-31） | 5 |
| MiniMax | 飞书校招站（AI Infra/系统为主） | 8 |
| 面壁智能 | 「前进四」顶尖人才计划 | 1 |
| 深度求索（DeepSeek） | 官网开放岗（无独立校招，统一接受应届生） | 10 |
| 百川智能 | 飞书校招站「百川星耀计划」 | 2 |
| 字节跳动 | 2027 届校招 + Seed 大模型人才专项（火山方舟/多模态/LLM） | 8 |
| 腾讯 | 2027 校园招聘 + 青云计划（混元/WeLM） | 8 |
| 华为 | 2027 届应届生招聘（AI 模型/应用/Infra 工程师） | 3 |
| 快手 | 27 届校招 + 快Star 计划（大模型算法为主） | 6 |
| 美团 | 2027 应届校招（LongCat 大模型人才校招/北斗计划） | 6 |
| 京东 | 2027 校招新星计划（网申截止 11-30） | 3 |
| 科大讯飞 | 2027 届秋招（飞星计划顶尖人才专项） | 1 |
| 小米 | 2027 届全球校招（AI 岗需求同比 +50%，大模型岗 60 个） | 8 |
| OPPO | 2027 届校招（大模型方向集中于博士专项，限投 2 岗） | 3 |
| 荣耀（HONOR） | 2027 届全球校招（研发类，截止 09-30） | 1 |
| 智源研究院（BAAI） | 2027 届校招（07-27 已启动，研究岗项目级） | 1 |
| 网易 | 网易互联网 2027 届校招（有道大模型/多模态/语音/Agent/Infra） | 7 |
| 哔哩哔哩（B站） | 2027 届校招（LLM 算法 + AI Native 基建） | 2 |
| 百度 | 2027 届校招（网申全年开放；职位列表需登录官网） | 2 |
| 寒武纪（Cambricon） | 2027 届校招 59 岗（大模型训练/推理框架/编译器/智算平台等） | 8 |
| 小红书 | 2027 届校招 + REDstar 顶尖人才计划（基座大模型/Agent/多模态/Infra） | 8 |
| 蚂蚁集团 | 2027 届应届生招聘（超 80% AI 相关；智能体/多模态/评测/系统协同） | 8 |
| 携程集团 | 2027 届秋招 53 岗（AI 智能客服/数据分析师等；TripGenie 方向见官网技术类筛选） | 2 |

### 时点说明（重要）

首轮核实时间是 2026 年 8 月底，**27 届秋招刚启动**，很多公司岗位还没上全，部分官网为动态渲染、且反爬较强，因此首版只收录了能核实的这一批。9 月起岗位会明显增多，应持续补充——逐条数据的最近核实日期见 `jobs.json` 的 `last_verified_at`。

### 下一轮待补充

外企与研究机构当前状态（多数 9 月才启动 27 届批次）：

- 上海人工智能实验室：当前为 26 届应届周期（2025.09-2026.10），27 届走留用实习通道，`/joinus/campus` 建议 9 月复查
- 鹏城国家实验室：上一届 9 月中旬启动，27 届预计同期开放
- 之江实验室：官网招聘页需浏览器手动访问（`https://www.zhejianglab.org/lab/join/index`）
- 微软 / 英伟达：27 届中国区校招暂未官宣，往年 9 月启动（微软走 careers.microsoft.com，英伟达走 Workday 站）
- 其余复查项：vivo 校招官网 `https://hr-campus.vivo.com/`（当时 0 岗，公告截止 2026-09-15）、生数科技 `https://shengshu.jobs.feishu.cn/692892`（当时 0 岗）、第四范式 `https://app.mokahr.com/campus_apply/4paradigm/5073`（页面暂时无法加载）

### 央企 / 运营商与中小公司本轮核实状态（2026-08-28）

- 中国移动：招聘站可访问且已开「人工智能专区（校招）」`job.10086.cn/personal/job/?code=115&zpcode=01` 与「算力专区」（code=117），**当时 0 岗**，27 届公告预计 8 月底-9 月放出，值得盯
- 中国联通：2027 校园招聘公告已发布（8 月底起投递，入口 campus.10010.com）；联通数科校招站 `cudt.zhiye.com/campus/jobs` 当时 0 岗
- 中国电信：官方招聘门户 `job.chinatelecom.com.cn`（当时访问异常，9 月再试）
- 地平线机器人：27 届秋招已启动（北京/上海/南京/成都/武汉），官网直连失败，投递入口请在其官网 careers 页查找
- 昆仑万维：未见明确 27 届校招入口，暂缓

### 广域公司核实状态（2026-08-28）

- 阿里巴巴 / 淘宝闪购：校招统一走 `talent.alibaba.com`，当时应届生批次列表未放出（显示 0 岗），淘系岗位 9 月随集团秋招一起放
- 比亚迪：27 届校招已启动（官网 `job.byd.com`），智能驾驶/算法岗需在其官网筛选，当时未直连成功
- 米哈游 / 鹰角网络：27 届校招均已启动（官方公众号/牛客有公告），招聘官网当时网络不可达，建议直接访问 careers.mihoyo.com 与鹰角招聘官网
- 浪潮集团：27 届校招已启动，官网当时不可达（job.inspur.com），AI 服务器/算力方向
- 它石智航（具身智能）：官网域名未确认，建议直接搜索其官方公众号
- 海尔 / 海信 / 格力：27 届校招均已启动，AI 相关岗位占比小（智慧家庭/显示算法方向），官网当时不可达
- 苹果 / 博世 / 德州仪器：中国区校招门户可访问（jobs.apple.com、bosch.com.cn/careers、careers.ti.com），但 27 届全职 AI 岗极少（以实习与硬件岗为主），暂不收录岗位

### 暂未发现 27 届校招岗位的

零一万物（仅社招站）、硅基流动（官网无招聘入口）、旷视、小冰。

## 旧仓库内容归档

原 `Autumn_recruitment`（秋招作战室）与 `find_job`（AI 校招雷达）两个仓库的 README 原文已留档于 [`docs/legacy/`](docs/legacy/)，仅供回溯。其中提到的仓库地址、Pages 部署步骤、目录路径在合并后均已过时，**日常维护以本 README 为准**。

## 数据隐私

投递记录、个人档案等个人数据仅存于浏览器 localStorage，不上传服务器。原「AI 校招雷达」的收藏与投递状态会在首次打开本站时提示自动迁移（可撤销、可稍后、可跳过），详见「个人档案 → 旧雷达迁移」。

## 部署

GitHub Actions 自动部署：push 到 main 即触发「数据校验 → 构建 → 发布」，见 `.github/workflows/deploy.yml`。

## 数据时效说明

作战室的公务员 / 选调时间节点核实于 2026-08-29（见「官方信息入口」）；岗位雷达数据核实于 2026-09-06（分档复核），逐条核实日期见 `jobs.json` 的 `last_verified_at`（范围 2026-09-01 ~ 2026-09-14）。投递前务必以各公司官网为准。
