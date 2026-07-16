import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Auto-recover from stale chunks after a new deploy.
 *
 * When the site is redeployed, chunk filenames change and the old ones are
 * removed. A tab opened before the deploy will fail to load a lazy route
 * chunk on navigation (blank page) — Vite fires `vite:preloadError` for this.
 * We reload once to pull the fresh build. A short time-guard prevents a reload
 * loop if a chunk is genuinely, permanently missing.
 */
window.addEventListener('vite:preloadError', () => {
  const KEY = 'ig-preload-reload-at'
  const last = Number(sessionStorage.getItem(KEY) || 0)
  if (Date.now() - last < 10000) return
  sessionStorage.setItem(KEY, String(Date.now()))
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
