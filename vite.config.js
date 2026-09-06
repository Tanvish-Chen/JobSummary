import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 使用相对路径 base + hash 路由：
// 构建产物可部署在 GitHub Pages 任意子路径（github.io/<仓库名>/），
// 也可以直接双击 dist/index.html 本地打开，无需改任何配置。
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 2048
  }
})
