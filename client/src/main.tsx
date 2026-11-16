import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { i18nReady } from './i18n'

import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

const renderApp = () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void i18nReady
  .then(renderApp)
  .catch((error: unknown) => {
    console.error('Failed to initialize i18next:', error)
    renderApp()
  })
