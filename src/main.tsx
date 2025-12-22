import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * 修正說明：
 * 您的 index.html 裡面使用的是 <div id="app"></div>
 * 因此這裡必須精確尋找 'app' 而不是 'root'。
 * 這是解決「白畫面」與「Error #299」最關鍵的步驟。
 */
const rootElement = document.getElementById('app') || document.getElementById('root');

if (!rootElement) {
  console.error("Critical: Could not find id='app' in index.html");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
