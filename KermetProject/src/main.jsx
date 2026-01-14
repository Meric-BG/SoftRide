import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { VehicleProvider } from './store/vehicleStore'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VehicleProvider>
      <App />
    </VehicleProvider>
  </StrictMode>,
)
