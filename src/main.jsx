import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThaiApp from './ThaiApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThaiApp />
  </StrictMode>
)
