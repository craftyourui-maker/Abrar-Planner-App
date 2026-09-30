import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installRipples } from './app/ripple'
import { StoreProvider } from './app/StoreProvider'
import { ThemeProvider } from './theme/ThemeProvider'

installRipples()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaults={{ palette: 'blue', scheme: 'light', contrast: 'standard' }}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>,
)
