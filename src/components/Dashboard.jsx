import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [history, setHistory] = useState([])

  // 🚀 NUEVO: Comprobamos en el localStorage si la fiesta ya había terminado al abrir la app
  const [showSummary, setShowSummary] = useState(
    localStorage.getItem('fiesta_terminada') === 'true'
  )

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
        lanzarNotificacionViaLibre()
      }
    }
  }

  const lanzarNotificacionViaLibre = () => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registro) => {
        registro.showNotification('🟢 ¡Vía Libre!', {
          body: 'Tu hígado ha terminado de procesar todo el alcohol. ¡Estás a cero! 🥳',
          icon: '/vite.svg',
          vibrate: [200, 100, 200]
        })
      })
    }
  }

  // Lógica científica: 1 UBE = 60 minutos inamovibles de procesamiento en hígado sano
  const handleAddDrink = async (nombreBebida, ubes) => {
    const MINS_PER_UBE = 60
    const tiempoBebidaMs = ubes * MINS_PER_UBE * 60 * 1000

    const currentTarget = parseInt(localStorage.getItem('hora_objetivo') || '0', 10)
    const ahora = Date.now()

    let newTargetTime
    if (currentTarget > ahora) {
      newTargetTime = currentTarget + tiempoBebidaMs // Acumula tiempo al hígado colapsado
    } else {
      newTargetTime = ahora + tiempoBebidaMs // Empieza cuenta nueva
    }

    localStorage.setItem('hora_objetivo', newTargetTime.toString())
    const minutosTotalesRestantes = Math.round((newTargetTime - ahora) / (60 * 1000))

    // Guardar la bebida detallada con sus UBEs en el historial
    const newDrink = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: `${nombreBebida} (${ubes} UBE${ubes > 1 ? 's' : ''})`,
      ubes: ubes
    }
    const updatedHistory = [...history, newDrink]
    setHistory(updatedHistory)
    localStorage.setItem('historial_bebidas', JSON.stringify(updatedHistory))

    calculateTimeLeft()

    // Sincronizar con el servidor
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registro = await navigator.serviceWorker.ready
        const suscripcionExistente = await registro.pushManager.getSubscription()

        if (suscripcionExistente) {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedule-via-libre`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: suscripcionExistente.endpoint,
              minutos: minutosTotalesRestantes
            })
          })
        }
      } catch (error) {
        console.error('Error al delegar el push acumulado:', error)
      }
    }
  }

  // 🚀 NUEVO: Guardamos en disco que la fiesta ha terminado
  const handleEndParty = () => {
    setShowSummary(true)
    localStorage.setItem('fiesta_terminada', 'true')
  }

  // 🚀 NUEVO: Limpiamos también el estado de la fiesta al reiniciar
  const handleReset = () => {
    localStorage.removeItem('hora_objetivo')
    localStorage.removeItem('historial_bebidas')
    localStorage.removeItem('fiesta_terminada')
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

  // Calcular el total de UBEs reales consumidas en la noche
  const totalUbesConsumidas = history.reduce((acc, drink) => acc + (drink.ubes || 1), 0)

  // Algoritmo del diagnóstico de la mañana siguiente
  const obtenerDiagnosticoResaca = () => {
    if (totalUbesConsumidas <= 2) {
      return {
        texto: "🏆 ¡Cero resaca! Has mantenido un control clínico impecable. Tu cuerpo está limpio y mañana te levantarás como nuevo. ¡A disfrutar del día!",
        color: "#22c55e"
      }
    } else if (totalUbesConsumidas <= 5) {
      return {
        texto: "⚠️ Resaca leve/moderada en camino. Tu hígado ha tenido trabajo extra. Asegúrate de beber dos vasos grandes de agua antes de dormir y tu cabeza te lo agradecerá.",
        color: "#eab308"
      }
    } else {
      return {
        texto: "💀 ¡Resaca brutal garantizada! Tu hígado está completamente desbordado y saturado. Ve preparando el ibuprofeno, deja una botella de agua al lado de la cama y cancela tus planes matutinos.",
        color: "#ef4444"
      }
    }
  }

  const diagnostico = obtenerDiagnosticoResaca()

  // Vista de Resumen Diagnóstico
  if (showSummary) {
    return (
      <div style={styles.container}>
        <h2>📊 Resumen de la noche</h2>
        <div style={styles.summaryCard}>
          <p style={{ fontSize: '1.4rem' }}>Alcohol total: <strong>{totalUbesConsumidas} UBEs</strong></p>
          <div style={{ ...styles.diagnosticoBox, borderColor: diagnostico.color }}>
            <p style={{ color: '#1f2937', margin: 0, lineHeight: '1.5' }}>{diagnostico.texto}</p>
          </div>
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

      <div style={styles.gridContainer}>
        <button style={{ ...styles.drinkButton, backgroundColor: '#3b82f6' }} onClick={() => handleAddDrink('Cerveza / Vino', 1)}>
          <span>🍺 caña / vino</span>
          <span style={styles.ubeTag}>1 UBE</span>
        </button>

        <button style={{ ...styles.drinkButton, backgroundColor: '#a855f7' }} onClick={() => handleAddDrink('Chupito', 1)}>
          <span>🥃 Chupito</span>
          <span style={styles.ubeTag}>1 UBE</span>
        </button>

        <button style={{ ...styles.drinkButton, backgroundColor: '#ec4899', gridColumn: 'span 2' }} onClick={() => handleAddDrink('Combinado / Copa', 2)}>
          <span>🍹 Combinado / Copa Larga</span>
          <span style={styles.ubeTag}>2 UBEs</span>
        </button>
      </div>

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
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', width: '100%', maxWidth: '340px' },
  drinkButton: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '1rem', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.08)', transition: 'transform 0.1s ease' },
  ubeTag: { fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '8px', fontWeight: 'normal' },
  historySection: { width: '100%', maxWidth: '340px', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  list: { listStyle: 'none', backgroundColor: 'white', borderRadius: '12px', padding: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid #f3f4f6' },
  endButton: { padding: '1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
  summaryCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  diagnosticoBox: { padding: '1rem', borderRadius: '12px', backgroundColor: '#f9fafb', borderLeft: '5px solid', textAlign: 'left' },
  resetButton: { padding: '1rem 2rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }
}