import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'

function App() {
  // Estado para controlar qué pantalla vemos
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <div style={styles.appShell}>
      {/* Cabecera (opcional, le da un toque de app) */}
      <header style={styles.header}>
        <h1>Drink Tracker</h1>
      </header>

      {/* Zona principal dinámica (ocupa el espacio restante y hace scroll si es necesario) */}
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
  navBtn: { background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }
}

export default App