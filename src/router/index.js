import { createRouter, createWebHashHistory } from 'vue-router'

// hash 路由：无需服务器 rewrite 规则，GitHub Pages / 本地双击均可直接运行
const routes = [
  { path: '/', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '作战仪表盘' } },
  { path: '/enterprise', name: 'enterprise', component: () => import('../views/Enterprise.vue'), meta: { title: '企业赛道' } },
  { path: '/jobs', name: 'jobs', component: () => import('../views/JobRadar.vue'), meta: { title: '岗位雷达' } },
  { path: '/civil-service', name: 'civilService', component: () => import('../views/CivilService.vue'), meta: { title: '公务员赛道' } },
  { path: '/xuandiao', name: 'xuandiao', component: () => import('../views/Xuandiao.vue'), meta: { title: '选调赛道' } },
  { path: '/tracker', name: 'tracker', component: () => import('../views/Tracker.vue'), meta: { title: '投递进度看板' } },
  { path: '/calendar', name: 'calendar', component: () => import('../views/CalendarView.vue'), meta: { title: '秋招日历' } },
  { path: '/interview', name: 'interview', component: () => import('../views/Interview.vue'), meta: { title: '面试笔试准备' } },
  { path: '/resume', name: 'resume', component: () => import('../views/Resume.vue'), meta: { title: '简历与材料' } },
  { path: '/profile', name: 'profile', component: () => import('../views/Profile.vue'), meta: { title: '个人档案' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = `${to.meta.title || ''} · 秋招作战室`
})

export default router
