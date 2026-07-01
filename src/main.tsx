import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { DataProvider } from './context/DataContext.tsx'
import { ToastProvider } from './components/ui/ToastContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
