import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Función auxiliar nativa para transformar la llave VAPID y que el navegador la entienda
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  // Estado para controlar qué pantalla vemos
  const [currentView, setCurrentView] = useState('dashboard')

  // LÓGICA PARA SOLICITAR PERMISO Y GUARDAR EN MONGO
  const suscribirUsuario = async () => {
    try {
      // A. Pedir permiso nativo al usuario
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') {
        alert('¡Ups! Has denegado el permiso de notificaciones.');
        return;
      }

      // B. Esperar a que el Service Worker esté activo
      const registro = await navigator.serviceWorker.ready;

      // C. Generar la suscripción con el servidor del ecosistema (Google/Apple)
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('Suscripción generada en el navegador:', suscripcion);

      // Enviar el JSON directo al backend en Node (Puerto 3000)
      const respuesta = await fetch(`${import.meta.env.VITE_BACKEND_URL}/subscribe`, {
        method: 'POST',
        body: JSON.stringify(suscripcion),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const datos = await respuesta.json();
      console.log('Respuesta del backend:', datos);
      alert('¡Dispositivo vinculado con éxito en MongoDB! 🔔');

    } catch (error) {
      console.error('Error al suscribir al usuario:', error);
      alert('Hubo un error al activar las notificaciones.');
    }
  };

  return (
    <div style={styles.appShell}>
      {/* Cabecera */}
      <header style={styles.header}>
        <h1>Drink Tracker</h1>
      </header>

      {/* Zona principal dinámica */}
      <main style={styles.mainArea}>
        {currentView === 'dashboard' ? <Dashboard /> : <Settings />}
      </main>

      {/* Barra de navegación inferior */}
      <nav style={styles.bottomNav}>
        <button
          style={{ ...styles.navBtn, color: currentView === 'dashboard' ? '#3b82f6' : '#666' }}
          onClick={() => setCurrentView('dashboard')}
        >
          🏠<br />Inicio
        </button>

        {/* 🔔 BOTÓN INTEGRADO: Activar Notificaciones */}
        <button
          style={{ ...styles.navBtn, color: '#f97316' }}
          onClick={suscribirUsuario}
        >
          🔔<br />Activar
        </button>

        <button
          style={{ ...styles.navBtn, color: currentView === 'settings' ? '#3b82f6' : '#666' }}
          onClick={() => setCurrentView('settings')}
        >
          ⚙️<br />Ajustes
        </button>
      </nav>
    </div>
  )
}

const styles = {
  appShell: { display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#1e293b', color: 'white', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 },
  mainArea: { flex: 1, overflowY: 'auto', position: 'relative' },
  bottomNav: { display: 'flex', justifyContent: 'space-around', backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '0.8rem 0', paddingBottom: 'env(safe-area-inset-bottom)' },
  navBtn: { background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontWeight: 'bold' }
}

export default App;
