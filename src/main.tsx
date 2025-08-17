import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { GeistSans } from 'geist/font/sans'
// import { GeistMono } from 'geist/font/mono'
// import 'non.geist'

// For Geist Mono
// import 'non.geist/mono'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <App />
  </StrictMode>,
)
