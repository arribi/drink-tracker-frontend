import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('🚀 Service Worker registrado con éxito en el Frontend:', reg.scope);
      })
      .catch((err) => {
        console.error('❌ Error al registrar el Service Worker:', err);
      });
  });
}
