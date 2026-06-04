import { useState, useEffect } from 'react'
import styles from './Settings.module.css'

export default function Settings() {
  // --- 1. ESTADO LOCAL ---
  const [intervaloHoras, setIntervaloHoras] = useState('2') // Agua (Push)

  // --- 2. CARGA INICIAL DESDE LOCALSTORAGE ---
  useEffect(() => {
    // 🧹 LIMPIEZA: Borramos el antiguo ajuste manual de alcohol de los teléfonos de los usuarios
    localStorage.removeItem('intervalo_minutos')

    // Cargar ajuste de Agua
    const valorHoras = localStorage.getItem('intervalo_horas')
    if (valorHoras) {
      setIntervaloHoras(valorHoras)
    } else {
      localStorage.setItem('intervalo_horas', '2')
    }
  }, [])

  // --- 3. MANEJADOR DE CAMBIO ---

  // Cambios en el recordatorio de agua (Local + Sincronización con Backend)
  const handleHorasChange = async (e) => {
    const nuevoValor = e.target.value
    setIntervaloHoras(nuevoValor)
    localStorage.setItem('intervalo_horas', nuevoValor)

    // Si el dispositivo tiene las notificaciones push activas, actualizamos MongoDB
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registro = await navigator.serviceWorker.ready
        const suscripcionExistente = await registro.pushManager.getSubscription()

        if (suscripcionExistente) {
          const respuesta = await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-interval`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              endpoint: suscripcionExistente.endpoint,
              intervalo: nuevoValor
            })
          })

          const datos = await respuesta.json()
          console.log('Sincronización de agua con el servidor:', datos.mensaje)
        }
      } catch (error) {
        console.error('Error al sincronizar el intervalo de agua con el servidor:', error)
      }
    }
  }

  return (
    <div className={styles.container}>
      <h2>⚙️ Ajustes</h2>

      <div className={styles.formGroup}>

        {/* 🚀 SECCIÓN ALCOHOL / UBEs (Ahora 100% científica e informativa) */}
        <div className={styles.infoBoxAlcohol}>
          <h3 className={styles.infoTitleAlcohol}>🧪 Procesamiento Hepático</h3>
          <p className={styles.infoTextAlcohol}>
            El tiempo de procesamiento del alcohol está fijado por defecto bajo estándares médicos. Tu hígado procesará <strong>1 UBE cada 60 minutos</strong>.
            El sistema calculará y acumulará tu tiempo automáticamente en la pantalla principal según lo que bebas.
          </p>
        </div>

        {/* Separador visual elegante */}
        <hr className={styles.divider} />

        {/* SECCIÓN AGUA / NOTIFICACIONES */}
        <label className={styles.label}>
          <strong>Frecuencia de los recordatorios de agua:</strong>
          <select
            value={intervaloHoras}
            onChange={handleHorasChange}
            className={styles.select}
          >
            <option value="1">Cada 1 hora</option>
            <option value="2">Cada 2 horas (Recomendado)</option>
            <option value="3">Cada 3 horas</option>
            <option value="4">Cada 4 horas</option>
          </select>
        </label>

        <div className={styles.infoBoxAgua}>
          <p className={styles.infoTextAgua}>
            *Nota: Las alertas de hidratación llegarán de forma automática a este dispositivo para balancear tu consumo durante la fiesta, incluso con la app cerrada.
          </p>
        </div>

      </div>
    </div>
  )
}