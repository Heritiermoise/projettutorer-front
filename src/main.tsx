import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handlers to assist debugging runtime errors that cause a blank page
window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('Global error caught:', e.error ?? e.message, e)
})
window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', e.reason)
})

try {
  // eslint-disable-next-line no-console
  console.log('Mounting React app...')
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Error during React mount:', err)
}