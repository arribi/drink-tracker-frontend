import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [history, setHistory] = useState([])

  const [showSummary, setShowSummary] = useState(
    localStorage.getItem('fiesta_terminada') === 'true'
  )

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

  const handleAddDrink = async (nombreBebida, ubes) => {
    const MINS_PER_UBE = 60
    const tiempoBebidaMs = ubes * MINS_PER_UBE * 60 * 1000

    const currentTarget = parseInt(localStorage.getItem('hora_objetivo') || '0', 10)
    const ahora = Date.now()

    let newTargetTime
    if (currentTarget > ahora) {
      newTargetTime = currentTarget + tiempoBebidaMs
    } else {
      newTargetTime = ahora + tiempoBebidaMs
    }

    localStorage.setItem('hora_objetivo', newTargetTime.toString())
    const minutosTotalesRestantes = Math.round((newTargetTime - ahora) / (60 * 1000))

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

  const handleUndoLastDrink = async () => {
    if (history.length === 0) return

    const lastDrink = history[history.length - 1]
    const updatedHistory = history.slice(0, -1)
    setHistory(updatedHistory)
    localStorage.setItem('historial_bebidas', JSON.stringify(updatedHistory))

    const MINS_PER_UBE = 60
    const tiempoBebidaMs = (lastDrink.ubes || 1) * MINS_PER_UBE * 60 * 1000

    const currentTarget = parseInt(localStorage.getItem('hora_objetivo') || '0', 10)
    const ahora = Date.now()
    let newTargetTime = currentTarget - tiempoBebidaMs

    if (newTargetTime <= ahora || updatedHistory.length === 0) {
      localStorage.removeItem('hora_objetivo')
      setTimeLeft(0)
      setIsActive(false)
      newTargetTime = ahora
    } else {
      localStorage.setItem('hora_objetivo', newTargetTime.toString())
      setTimeLeft(newTargetTime - ahora)
      setIsActive(true)
    }

    const minutosTotalesRestantes = Math.max(0, Math.round((newTargetTime - ahora) / (60 * 1000)))
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
        console.error('Error al actualizar el servidor tras deshacer:', error)
      }
    }
  }

  const handleEndParty = () => {
    setShowSummary(true)
    localStorage.setItem('fiesta_terminada', 'true')
  }

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

  const totalUbesConsumidas = history.reduce((acc, drink) => acc + (drink.ubes || 1), 0)

  const obtenerDiagnosticoResaca = () => {
    if (history.length === 0) {
      return { texto: "👼 Modo Ángel: No has bebido nada. Mañana estarás resplandeciente.", color: "#22c55e" }
    }

    const primeraBebidaMs = history[0].id
    const ahoraMs = Date.now()

    const horasTranscurridas = Math.max(0, (ahoraMs - primeraBebidaMs) / (1000 * 60 * 60))
    const ubesMetabolizadas = horasTranscurridas * 1
    const cargaActual = Math.max(0, totalUbesConsumidas - ubesMetabolizadas)

    if (cargaActual <= 0.5) {
      return { texto: "🦸‍♂️ Cero resaca: Ritmo clínico perfecto. Tu cuerpo ha procesado casi todo sobre la marcha. Mañana madrugas y te ríes de los demás.", color: "#22c55e" }
    } else if (cargaActual <= 2.5) {
      return { texto: "🕺 Modo supervivencia: Hay un pequeño atasco metabólico, pero nada grave. Dos vasos de agua antes de dormir y mañana estarás al 90%.", color: "#eab308" }
    } else if (cargaActual <= 5) {
      return { texto: "🧟‍♂️ Resaca importante: Te has venido bastante arriba. El hígado está pidiendo la hora. Mañana maratón de series en el sofá.", color: "#f97316" }
    } else {
      return { texto: "🪦 Resacón brutal: La ciencia no hace milagros. Has saturado el sistema por completo. Ve redactando tu testamento y cancela los planes de mañana.", color: "#ef4444" }
    }
  }

  const diagnostico = obtenerDiagnosticoResaca()

  // 🧠 CÁLCULO DEL PROGRESO DINÁMICO
  let porcentajeProgreso = 100
  if (isActive && totalUbesConsumidas > 0) {
    const tiempoTotalMs = totalUbesConsumidas * 60 * 60 * 1000
    porcentajeProgreso = Math.min(100, Math.max(0, (timeLeft / tiempoTotalMs) * 100))
  }

  const ringColor = isActive ? '#f97316' : '#22c55e'
  const bgColor = '#d1d5db'

  // Si quedan menos de 15 minutos (900.000 ms) y está activo, activamos el latido
  const isPulsing = isActive && timeLeft > 0 && timeLeft <= 900000
  //const isPulsing = isActive Late siempre

  if (showSummary) {
    return (
      <div className={styles.container}>
        <h2>📊 Resumen de la noche</h2>

        <div className={styles.summaryCard}>
          <p className={styles.summaryTotal}>Alcohol total: <strong>{totalUbesConsumidas} UBEs</strong></p>
          <div className={styles.diagnosticoBox} style={{ borderColor: diagnostico.color }}>
            <p className={styles.diagnosticoText}>{diagnostico.texto}</p>
          </div>
        </div>

        {history.length > 0 && (
          <div className={styles.historySection}>
            <h3 className={styles.historyTitle}>📋 Bebidas de la noche:</h3>
            <ul className={styles.list}>
              {history.map((drink) => (
                <li key={drink.id} className={styles.listItem}>
                  <span>{drink.type}</span>
                  <span className={styles.timeText}>{drink.time}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className={styles.resetButton} onClick={handleReset}>Iniciar Nueva Fiesta</button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2>{isActive ? '🟠 En proceso' : '🟢 Vía libre'}</h2>

      {/* 🚀 ANILLO DINÁMICO CON EFECTO LATIDO */}
      <div
        className={`${styles.circle} ${isPulsing ? styles.pulseRing : ''}`}
        style={{
          background: `conic-gradient(${ringColor} ${porcentajeProgreso}%, ${bgColor} ${porcentajeProgreso}%)`
        }}
      >
        <div className={styles.circleContent}>
          <p className={`${styles.timerText} ${isPulsing ? styles.pulseText : ''}`}>
            {formatTime(timeLeft)}
          </p>
          <p className={styles.timerLabel}>
            {isActive ? 'Hígado trabajando' : 'Listos para empezar'}
          </p>
        </div>
      </div>

      <div className={styles.gridContainer}>
        <button className={`${styles.drinkButton} ${styles.drinkSuave}`} onClick={() => handleAddDrink('Chupito Suave', 0.5)}>
          <span>🥃 Chupito Suave</span>
          <span className={`${styles.ubeTag} ${styles.ubeTagDark}`}>0.5 UBE</span>
        </button>

        <button className={`${styles.drinkButton} ${styles.drinkCana}`} onClick={() => handleAddDrink('Caña / Vino', 1)}>
          <span>🍺 Caña / Vino</span>
          <span className={styles.ubeTag}>1 UBE</span>
        </button>

        <button className={`${styles.drinkButton} ${styles.drinkFuerte}`} onClick={() => handleAddDrink('Chupito Fuerte', 1)}>
          <span>🔥 Chupito Fuerte</span>
          <span className={styles.ubeTag}>1 UBE</span>
        </button>

        <button className={`${styles.drinkButton} ${styles.drinkLata}`} onClick={() => handleAddDrink('Lata / Tercio', 1.5)}>
          <span>🍺 Lata / Tercio</span>
          <span className={styles.ubeTag}>1.5 UBEs</span>
        </button>

        <button className={`${styles.drinkButton} ${styles.drinkCopa}`} onClick={() => handleAddDrink('Combinado / Copa', 2)}>
          <span>🍹 Combinado / Copa Larga</span>
          <span className={styles.ubeTag}>2 UBEs</span>
        </button>
      </div>

      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3>Llevas {history.length} {history.length === 1 ? 'bebida' : 'bebidas'} anoche:</h3>
          <ul className={styles.list}>
            {history.map((drink) => (
              <li key={drink.id} className={styles.listItem}>
                <span>{drink.type}</span>
                <span className={styles.timeText}>{drink.time}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actionGroup}>
            <button className={styles.undoButton} onClick={handleUndoLastDrink}>↩️ Deshacer Última</button>
            <button className={styles.endButton} onClick={handleEndParty}>🛑 Terminar Fiesta</button>
          </div>
        </div>
      )}
    </div>
  )
}