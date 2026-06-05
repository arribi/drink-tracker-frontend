import { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'
import { calcularMinsPerUbe, calcularBacEst, obtenerDiagnosticoResaca } from '../utils/alcoholMath'

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [history, setHistory] = useState([])
  const [showSummary, setShowSummary] = useState(localStorage.getItem('fiesta_terminada') === 'true')

  // Cargar datos de usuario guardados en Ajustes
  const peso = parseFloat(localStorage.getItem('usuario_peso'))
  const sexo = localStorage.getItem('usuario_sexo')

  useEffect(() => {
    let savedHistory = JSON.parse(localStorage.getItem('historial_bebidas') || '[]')

    // 🧠 AUTO-RESET: Si la última bebida tiene más de 12 horas, limpiamos sesión vieja automáticamente
    if (savedHistory.length > 0) {
      const ultimaBebidaMs = savedHistory[savedHistory.length - 1].id
      const doceHorasEnMs = 12 * 60 * 60 * 1000
      const targetTime = parseInt(localStorage.getItem('hora_objetivo') || '0', 10)
      const ahora = Date.now()

      if (ahora > targetTime && (ahora - ultimaBebidaMs) > doceHorasEnMs) {
        localStorage.removeItem('hora_objetivo')
        localStorage.removeItem('historial_bebidas')
        localStorage.removeItem('fiesta_terminada')
        savedHistory = []
      }
    }

    setHistory(savedHistory)
    calculateTimeLeft()

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
    const minsPerUbe = calcularMinsPerUbe(peso, sexo)
    const tiempoBebidaMs = ubes * minsPerUbe * 60 * 1000
    const currentTarget = parseInt(localStorage.getItem('hora_objetivo') || '0', 10)
    const ahora = Date.now()

    const newTargetTime = currentTarget > ahora ? currentTarget + tiempoBebidaMs : ahora + tiempoBebidaMs
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

    // Sincronización del Push Notification Service con el Servidor
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registro = await navigator.serviceWorker.ready
        const suscripcionExistente = await registro.pushManager.getSubscription()
        if (suscripcionExistente) {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedule-via-libre`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: suscripcionExistente.endpoint, minutos: minutosTotalesRestantes })
          })
        }
      } catch (e) { console.error('Error al delegar push:', e) }
    }
  }

  const handleUndoLastDrink = async () => {
    if (history.length === 0) return

    const lastDrink = history[history.length - 1]
    const updatedHistory = history.slice(0, -1)
    setHistory(updatedHistory)
    localStorage.setItem('historial_bebidas', JSON.stringify(updatedHistory))

    const minsPerUbe = calcularMinsPerUbe(peso, sexo)
    const tiempoBebidaMs = (lastDrink.ubes || 1) * minsPerUbe * 60 * 1000
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

    // Actualizar servidor al deshacer
    const minsRestantes = Math.max(0, Math.round((newTargetTime - ahora) / (60 * 1000)))
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registro = await navigator.serviceWorker.ready
        const suscripcion = await registro.pushManager.getSubscription()
        if (suscripcion) {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/schedule-via-libre`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: suscripcion.endpoint, minutos: minsRestantes })
          })
        }
      } catch (e) { console.error('Error al actualizar servidor tras deshacer:', e) }
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

  // --- LLAMADAS CORTAS A NUESTRAS UTILIDADES ---
  const minsPerUbe = calcularMinsPerUbe(peso, sexo)
  const totalUbesConsumidas = history.reduce((acc, drink) => acc + (drink.ubes || 1), 0)
  const diagnostico = obtenerDiagnosticoResaca(history, totalUbesConsumidas, minsPerUbe)
  const bacEst = calcularBacEst(history, peso, sexo, minsPerUbe)

  // Configuración de estilos dinámicos
  const porcentajeProgreso = isActive && totalUbesConsumidas > 0
    ? Math.min(100, Math.max(0, (timeLeft / (totalUbesConsumidas * minsPerUbe * 60 * 1000)) * 100))
    : 100
  const ringColor = isActive ? '#f97316' : '#22c55e'
  const isPulsing = isActive && timeLeft > 0 && timeLeft <= 900000
  const bacColor = bacEst >= 0.5 ? '#ef4444' : bacEst >= 0.25 ? '#eab308' : '#22c55e'

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

      <div className={`${styles.circle} ${isPulsing ? styles.pulseRing : ''}`} style={{ background: `conic-gradient(${ringColor} ${porcentajeProgreso}%, #d1d5db ${porcentajeProgreso}%)` }}>
        <div className={styles.circleContent}>
          <p className={`${styles.timerText} ${isPulsing ? styles.pulseText : ''}`}>{formatTime(timeLeft)}</p>
          <p className={styles.timerLabel}>{isActive ? 'Hígado trabajando' : 'Listos para empezar'}</p>
        </div>
      </div>

      <div className={styles.gridContainer}>
        <button className={`${styles.drinkButton} ${styles.drinkSuave}`} onClick={() => handleAddDrink('Chupito Suave', 0.5)}>
          <span>🥃 Chupito Suave</span> <span className={`${styles.ubeTag} ${styles.ubeTagDark}`}>0.5 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkCana}`} onClick={() => handleAddDrink('Caña / Vino', 1)}>
          <span>🍺 Caña / Vino</span> <span className={styles.ubeTag}>1 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkCana}`} onClick={() => handleAddDrink('Vermú / Fino', 1)}>
          <span>🍸 Vermú / Fino</span> <span className={styles.ubeTag}>1 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkFuerte}`} onClick={() => handleAddDrink('Chupito Fuerte', 1)}>
          <span>🔥 Chupito Fuerte</span> <span className={styles.ubeTag}>1 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkLata}`} onClick={() => handleAddDrink('Lata / Tercio', 1.5)}>
          <span>🍺 Lata / Tercio</span> <span className={styles.ubeTag}>1.5 UBEs</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkCopa}`} onClick={() => handleAddDrink('Combinado / Copa', 2)}>
          <span>🍹 Combinado / Copa Larga</span> <span className={styles.ubeTag}>2 UBEs</span>
        </button>
      </div>

      {history.length > 0 && (
        <div className={styles.bacCard}>
          <h3 className={styles.bacTitle}>🩸 Tasa de Alcoholemia Estimada</h3>
          {(!peso || !sexo) ? (
            <p className={styles.bacMissing}>⚠️ Configura tu <strong>Peso y Sexo</strong> en Ajustes para ver tu estimación.</p>
          ) : (
            <>
              {/* 🎯 Aplicamos la precisión milimétrica de 3 decimales */}
              <p className={styles.bacValue} style={{ color: bacColor }}>
                {bacEst.toFixed(3)} <span style={{ fontSize: '1.2rem' }}>g/L en sangre</span>
              </p>
              <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '1rem', fontWeight: 'bold' }}>
                (Equivale a {(bacEst / 2).toFixed(3)} mg/L en aire)
              </p>
              <p className={styles.bacDisclaimer}>*Cálculo dinámico (Widmark con absorción diferida de 45 min). Conducir solo con 0.0.</p>
            </>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3>Llevas {history.length} {history.length === 1 ? 'bebida' : 'bebidas'} anoche:</h3>
          <ul className={styles.list}>
            {history.map((drink) => (
              <li key={drink.id} className={styles.listItem}>
                <span>{drink.type}</span> <span className={styles.timeText}>{drink.time}</span>
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