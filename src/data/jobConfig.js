/**
 * 岗位雷达配置（自 find_job/js/config.js 移植 + 合并方案 P1-3 扩展）
 */

/** 临近截止高亮阈值（天） */
export const URGENT_DAYS = 7

/** 技术方向 */
export const DIRECTIONS = {
  llm: '大模型算法',
  multimodal: '多模态·生成',
  infra: '推理优化·AI Infra',
  app: 'AI 应用开发',
  research: 'AI 研究',
  other: '其他 AI 方向'
}

/** 公司分类 */
export const GROUPS = {
  ai_native: 'AI 原生公司',
  big_tech: '大厂 AI 岗',
  foreign_lab: '外企 / 研究机构'
}

/** 旧雷达状态 key → 作战室看板状态（Tracker STATUSES） */
export const AIRADAR_STATUS_MAP = {
  applied: '已网申',
  interviewing: '面试',
  offer: 'Offer',
  rejected: '已拒'
}

/** find_job 公司 id → 作战室公司库 id（仅列不一致的；一致的可省略） */
export const COMPANY_ALIAS = { antgroup: 'ant' }
export function companyId(cid) { return COMPANY_ALIAS[cid] || cid }

/** 城市规范表述（jobs.json 中 5 条含「香港」、2 条含「新加坡」） */
export const CITY_LABEL = { '香港': '中国香港' }
export function labelCity(c) { return CITY_LABEL[c] || c }

/**
 * 题库资源去重屏蔽表：以下资源与作战室「真题与面经」页重复
 * （作战室版本为更深的具体仓库链接），八股题库 tab 不重复展示。
 */
export const RESOURCE_DEDUP_BLOCKLIST = [
  'wdndev/llm_interview_note',
  'adongwanai/AgentGuide',
  'datawhalechina'
]
