import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { calcularMinsPerUbe } from '../utils/alcoholMath'

/**
 * 📬 Envía una notificación local en el dispositivo del usuario
 * Se extrae fuera del hook para no interferir con el ciclo de vida de React
 */
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

const obtenerHistorialInicial = () => {
  let savedHistory = JSON.parse(localStorage.getItem('historial_bebidas') || '[]')

  // AUTO-RESET: Limpieza automática tras 12 horas de inactividad
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

  return savedHistory
}

export const useFiesta = () => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [history, setHistory] = useState(obtenerHistorialInicial)
  const [showSummary, setShowSummary] = useState(localStorage.getItem('fiesta_terminada') === 'true')

  // Datos del perfil físico almacenados localmente
  const peso = parseFloat(localStorage.getItem('usuario_peso'))
  const sexo = localStorage.getItem('usuario_sexo')
  const edad = parseInt(localStorage.getItem('usuario_edad') || '0', 10)
  const altura = parseFloat(localStorage.getItem('usuario_altura') || '0')
  const tolerancia = localStorage.getItem('usuario_tolerancia') || 'normal'

  /**
   * ⏱️ Calcula los milisegundos restantes hasta estar sobrio
   * Envolviendo en useCallback evitamos recrear la función y bucles infinitos
   */
  const calculateTimeLeft = useCallback(() => {
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
  }, [])

  /**
   * 🔄 Efecto inicial que arranca el segundero y gestiona el auto-reset
   */
  useEffect(() => {
    const initialCheck = setTimeout(calculateTimeLeft, 0)

    const timer = setInterval(calculateTimeLeft, 1000)
    return () => {
      clearTimeout(initialCheck)
      clearInterval(timer)
    }
  }, [calculateTimeLeft])

  /**
   * ➕ Registra una nueva consumición en el historial y actualiza el temporizador
   */
  const handleAddDrink = async (nombreBebida, ubes) => {
    // Cálculo preciso del tiempo por UBE usando Watson (peso, sexo, edad, altura)
    const minsPerUbe = calcularMinsPerUbe(peso, sexo, edad, altura, tolerancia)
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

    toast.success(`✅ ${nombreBebida} añadida`, {
      description: 'Tu metabolismo ya está trabajando en ello.',
      duration: 3000,
    })

    calculateTimeLeft()

    // Programar notificación Push en servidor si el servicio está disponible
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
      } catch (e) {
        console.error('Error al delegar push:', e)
      }
    }
  }

  /**
   * ↩️ Elimina la última bebida registrada del historial y recalcula los tiempos
   */
  const handleUndoLastDrink = async () => {
    if (history.length === 0) return

    const lastDrink = history[history.length - 1]
    const updatedHistory = history.slice(0, -1)
    setHistory(updatedHistory)
    localStorage.setItem('historial_bebidas', JSON.stringify(updatedHistory))

    const minsPerUbe = calcularMinsPerUbe(peso, sexo, edad, altura, tolerancia)
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

    const minsRestantes = Math.max(0, Math.round((newTargetTime - ahora) / (60 * 1000)))

    // Actualizar el temporizador en el backend tras deshacer la acción
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
      } catch (e) {
        console.error('Error al actualizar servidor tras deshacer:', e)
      }
    }
  }

  /**
   * 🏁 Da por terminada la fiesta y congela el estado para el resumen
   */
  const handleEndParty = () => {
    setShowSummary(true)
    localStorage.setItem('fiesta_terminada', 'true')
  }

  /**
   * 🗑️ Limpia por completo la sesión actual para empezar una nueva de cero
   */
  const handleReset = () => {
    localStorage.removeItem('hora_objetivo')
    localStorage.removeItem('historial_bebidas')
    localStorage.removeItem('fiesta_terminada')
    setHistory([])
    setTimeLeft(0)
    setIsActive(false)
    setShowSummary(false)
  }

  return {
    timeLeft,
    isActive,
    history,
    showSummary,
    peso,
    sexo,
    edad,
    altura,
    tolerancia,
    handleAddDrink,
    handleUndoLastDrink,
    handleEndParty,
    handleReset
  }
}
