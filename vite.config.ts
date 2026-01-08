import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 提高警告門檻，避免沒意義的警告
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // [PERFORMANCE STRATEGY] 手動分包策略 (Manual Chunking)
        // 將肥大的第三方庫拆分出去，讓瀏覽器可以平行下載
        manualChunks: {
          // 把 React 核心拆出來
          'vendor-react': ['react', 'react-dom'],
          // 把 Firebase 拆出來 (這是最肥的部分)
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
        },
      },
    },
    // 啟用更激進的縮小化 (Minification)
    minify: 'esbuild', 
    cssCodeSplit: true, // CSS 也拆分，避免單一檔案過大
  },
});