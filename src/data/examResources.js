/**
 * 真题与面经资源库
 * ── 所有链接核实于 2026-08-31（联网检索确认仓库/页面真实存在）
 * ── 公司专项链接只收录核实过的；其余公司由工具函数自动生成搜索链接
 */

// GitHub 真题/面经集锦仓库（按用途排序）
export const githubResources = [
  { name: 'wdndev/llm_interview_note', stars: '★ 最热门', desc: '中文社区最系统的大模型面试八股：DL/ML基础+RLHF专章+推理部署，LLM岗必刷', url: 'https://github.com/wdndev/llm_interview_note' },
  { name: 'amusi/AI-Job-Notes', stars: '★ 总入口', desc: 'AI算法岗求职攻略：校招时间表、准备攻略、刷题指南、内推、AI公司清单', url: 'https://github.com/amusi/AI-Job-Notes' },
  { name: 'amusi/Deep-Learning-Interview-Book', stars: '经典', desc: '深度学习面试宝典：数学/机器学习/深度学习/CV/NLP章节+面经经验总结', url: 'https://github.com/amusi/Deep-Learning-Interview-Book' },
  { name: 'datawhalechina/hello-agents · 面试问题总结', stars: '2025秋招新', desc: 'Datawhale出品：LLM & VLM & Agent面试八股，面向大模型/Agent/AI开发/评测岗', url: 'https://github.com/datawhalechina/hello-agents/blob/main/Extra-Chapter/Extra01-%E9%9D%A2%E8%AF%95%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93.md' },
  { name: 'Lau-Jonathan/LLM-Agent-Interview-Guide', stars: '300+题', desc: '大模型&Agent面试八股指南，涵盖RLHF/DPO/GRPO等对齐算法，标注时效性', url: 'https://github.com/Lau-Jonathan/LLM-Agent-Interview-Guide' },
  { name: 'adongwanai/AgentGuide · 公司面试案例', stars: '真实案例', desc: '12家公司真实面试案例：vLLM原理、DeepSeek R1训练流程等实战八股', url: 'https://github.com/adongwanai/AgentGuide/blob/main/docs/04-interview/12-company-interview-cases.md' },
  { name: 'km1994/LLMs_interview_notes', stars: '', desc: '大模型算法工程师面试题记录+个人面经总结', url: 'https://github.com/km1994/LLMs_interview_notes' },
  { name: 'WangRongsheng/Awesome-algorithm-interview', stars: '合集', desc: '算法面经大汇总，收录各方向面经合集与常见面试题及答案', url: 'https://github.com/WangRongsheng/Awesome-algorithm-interview' },
  { name: 'afatcoder/LeetcodeTop', stars: '数据源', desc: 'CodeTop的原始数据：各公司高频题统计（源自牛客面经）+大厂面经导航表', url: 'https://github.com/afatcoder/LeetcodeTop' },
  { name: 'namewyf/Campus2026', stars: '信息汇总', desc: '2026届互联网校招&实习信息汇总：各公司官方校招入口与启动时间线', url: 'https://github.com/namewyf/Campus2026' }
]

// 平台类资源（非GitHub）
export const platformResources = [
  { name: 'CodeTop', url: 'https://codetop.cc/', desc: '★ 按「公司+部门+岗位」查高频算法题频率榜——投哪家公司前先查它的榜单，按频率顺序刷', tip: '打开后在「公司」栏选择目标公司即可' },
  { name: '牛客网 · 公司题库', url: 'https://www.nowcoder.com/exam/interview', desc: '全网较全的企业面试真题/模拟题库，可在线模拟企业校招笔试' },
  { name: '牛客网 · 面经板块', url: 'https://www.nowcoder.com/search/all?query=%E9%9D%A2%E7%BB%8F', desc: '搜「公司名 + 面经/笔试」看往届候选人的真实流程记录（几轮、考什么、多久出结果）' },
  { name: 'LeetCode中国', url: 'https://leetcode.cn/', desc: '刷题主战场，配合 CodeTop 频率榜针对性练习' },
  { name: '知乎 · 面试高频100题', url: 'https://zhuanlan.zhihu.com/p/449686402', desc: '基于牛客面经整理的最常考100道算法题分类版' }
]

// 考公真题资源（优先官方渠道）
export const civilExamResources = [
  { name: '粉笔APP · 历年试卷（官方·首选）', url: 'https://www.fenbi.com', desc: '题库内「历年试卷」含国考/省考真题+模考大赛，行测自动批改、申论有范文对照；真题合规且更新快' },
  { name: '知乎 · 国考历年真题PDF整理', url: 'https://zhuanlan.zhihu.com/p/2042746978921183144', desc: '2000-2025行测+申论真题PDF、答题卡、标准答题纸，适合打印限时模考' },
  { name: '华图教育 · 真题库', url: 'https://www.huatu.com', desc: '国考/各省省考历年真题与解析（免费部分够用）' },
  { name: '半月谈', url: 'https://www.banyuetan.org', desc: '申论素材积累首选：政务热点评论与大作文论据来源' },
  { name: '学习强国', url: 'https://www.xuexi.cn', desc: '常识判断时政部分 + 申论素材的官方来源，考前刷时政汇编' }
]

// 公司专项资源（只收录核实过的具体链接）
export const companyExtras = {
  bytedance: [
    { name: '字节高频算法题统计（389篇面经提炼）', url: 'https://leetcode.cn/circle/discuss/elzQ6U/' },
    { name: '2026字节大模型岗面经汇总（CSDN）', url: 'https://blog.csdn.net/qq_45717425/article/details/160315245' }
  ]
}

// —— 工具函数：为任意公司生成资源搜索链接 ——
const enc = encodeURIComponent

export function nowcoderSearch(company) {
  return `https://www.nowcoder.com/search/all?query=${enc(company + ' 面经')}`
}
export function githubSearch(company) {
  return `https://github.com/search?q=${enc(company + ' 面经 笔试')}&type=repositories`
}
export function webSearch(company) {
  return `https://www.bing.com/search?q=${enc(company + ' 校招 笔试 面经')}`
}
export const codetopHome = 'https://codetop.cc/'

/**
 * 组合某公司的全部真题资源入口
 * @param idOrName 公司id（命中companyExtras专项链接）或任意文本
 * @param displayName 用于搜索的中文名（不传则用 idOrName）
 */
export function companyResourceLinks(idOrName, displayName) {
  const name = displayName || idOrName
  const links = [
    { name: '牛客面经', url: nowcoderSearch(name) },
    { name: 'GitHub真题', url: githubSearch(name) },
    { name: '全网搜索', url: webSearch(name) },
    { name: 'CodeTop频率榜', url: codetopHome }
  ]
  return [...(companyExtras[idOrName] || []), ...links]
}

/** 使用建议 */
export const usageTips = [
  '投递前3天：牛客搜「公司名+面经」读近3个月的帖子——看流程轮次、笔试题型、面试官侧重点',
  '刷题前：CodeTop 选目标公司+算法岗，按出现频率从高到低刷，前50题覆盖大部分笔试',
  '技术面前一晚：过一遍目标公司的面经里的「追问链」，大模型岗重点看 wdndev/llm_interview_note 的对应章节',
  '面试后24小时内：在牛客发面经回馈社区（也能倒逼自己复盘），攒人品',
  '真题时效性：面经看最近3-6个月的（题型随年份变化大），老面经只参考流程不参考题目'
]
