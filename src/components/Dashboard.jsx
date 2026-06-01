import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [history, setHistory] = useState([])
  const [showSummary, setShowSummary] = useState(false)

  // 1. Cargar el historial y calcular el tiempo al arrancar
  useEffect(() => {
    calculateTimeLeft()
    const savedHistory = JSON.parse(localStorage.getItem('historial_bebidas') || '[]')
    setHistory(savedHistory)

    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  const calculateTimeLeft = () => {
    const targetTime = localStorage.getItem('hora_objetivo')
    if (targetTime) {
      const difference = parseInt(targetTime, 10) - Date.now()
      if (difference > 0) {
        setTimeLeft(difference)
        setIsActive(true)
      } else {
        setTimeLeft(0)
        setIsActive(false)
        localStorage.removeItem('hora_objetivo')
      }
    }
  }

  // 2. Registrar bebida y añadirla al historial
  const handleAddDrink = () => {
    const mins = parseInt(localStorage.getItem('intervalo_minutos') || '45', 10)
    const newTargetTime = Date.now() + (mins * 60 * 1000)
    localStorage.setItem('hora_objetivo', newTargetTime.toString())

    // Guardar en el historial local
    const newDrink = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Cerveza / Vino (1 UBE)'
    }
    const updatedHistory = [...history, newDrink]
    setHistory(updatedHistory)
    localStorage.setItem('historial_bebidas', JSON.stringify(updatedHistory))

    calculateTimeLeft()
  }

  // 3. Botón "Terminar Fiesta"
  const handleEndParty = () => {
    setShowSummary(true)
  }

  // 4. Resetear todo para la próxima noche
  const handleReset = () => {
    localStorage.removeItem('hora_objetivo')
    localStorage.removeItem('historial_bebidas')
    setHistory([])
    setTimeLeft(0)
    setIsActive(false)
    setShowSummary(false)
  }

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Vista de Resumen de la mañana siguiente
  if (showSummary) {
    return (
      <div style={styles.container}>
        <h2>📊 Resumen de la noche</h2>
        <div style={styles.summaryCard}>
          <p style={{ fontSize: '1.2rem' }}>Bebidas totales: <strong>{history.length} UBEs</strong></p>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            {history.length <= 3 ? '¡Excelente control! Tu hígado te lo agradece. 🏆' : 'Buen intento, la próxima noche saldrá mejor. 👍'}
          </p>
        </div>
        <button style={styles.resetButton} onClick={handleReset}>Iniciar Nueva Fiesta</button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2>{isActive ? '🟠 En proceso' : '🟢 Vía libre'}</h2>

      <div style={{ ...styles.circle, borderColor: isActive ? '#f97316' : '#22c55e' }}>
        <p style={styles.timerText}>{formatTime(timeLeft)}</p>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          {isActive ? 'Hígado trabajando' : 'Listos para empezar'}
        </p>
      </div>

      <button style={{ ...styles.button, opacity: isActive ? 0.5 : 1 }} onClick={handleAddDrink} disabled={isActive}>
        🍺 Añadir Bebida (1 UBE)
      </button>

      {/* Sección del Historial */}
      {history.length > 0 && (
        <div style={styles.historySection}>
          <h3>Llevas {history.length} {history.length === 1 ? 'bebida' : 'bebidas'} anoche:</h3>
          <ul style={styles.list}>
            {history.map((drink) => (
              <li key={drink.id} style={styles.listItem}>
                <span>{drink.type}</span>
                <span style={{ color: '#9ca3af' }}>{drink.time}</span>
              </li>
            ))}
          </ul>
          <button style={styles.endButton} onClick={handleEndParty}>🛑 Terminar Fiesta</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem' },
  circle: { width: '220px', height: '220px', borderRadius: '50%', borderWidth: '12px', borderStyle: 'solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', transition: 'border-color 0.5s ease' },
  timerText: { fontSize: '3.2rem', fontWeight: 'bold', margin: 0, color: '#1f2937', fontVariantNumeric: 'tabular-nums' },
  button: { padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  historySection: { width: '100%', maxWidth: '320px', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  list: { listStyle: 'none', backgroundColor: 'white', borderRadius: '12px', padding: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid #f3f4f6' },
  endButton: { padding: '0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' },
  summaryCard: { backgroundColor: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '320px' },
  resetButton: { padding: '1rem 2rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
}