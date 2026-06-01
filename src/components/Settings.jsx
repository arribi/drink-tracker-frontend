import { useState, useEffect } from 'react'

export default function Settings() {
  // --- 1. ESTADOS LOCALES INDEPENDIENTES ---
  const [intervaloMinutos, setIntervaloMinutos] = useState('45') // Alcohol (UBEs)
  const [intervaloHoras, setIntervaloHoras] = useState('2')     // Agua (Push)

  // --- 2. CARGA INICIAL DESDE LOCALSTORAGE ---
  useEffect(() => {
    // Cargar ajuste de Alcohol
    const valorMinutos = localStorage.getItem('intervalo_minutos')
    if (valorMinutos) {
      setIntervaloMinutos(valorMinutos)
    } else {
      localStorage.setItem('intervalo_minutos', '45')
    }

    // Cargar ajuste de Agua
    const valorHoras = localStorage.getItem('intervalo_horas')
    if (valorHoras) {
      setIntervaloHoras(valorHoras)
    } else {
      localStorage.setItem('intervalo_horas', '2')
    }
  }, [])

  // --- 3. MANEJADORES DE CAMBIO (HANDLERS) ---

  // Cambios en el tiempo entre bebidas (Solo local)
  const handleMinutosChange = (e) => {
    const nuevoValor = e.target.value
    setIntervaloMinutos(nuevoValor)
    localStorage.setItem('intervalo_minutos', nuevoValor)
  }

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
          const respuesta = await fetch('http://localhost:3000/update-interval', {
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
    <div style={styles.container}>
      <h2>⚙️ Ajustes</h2>

      <div style={styles.formGroup}>

        {/* SECCIÓN ALCOHOL / UBEs (Tu código original blindado) */}
        <label style={styles.label}>
          <strong>Minutos de espera por UBE:</strong>
          <select
            value={intervaloMinutos}
            onChange={handleMinutosChange}
            style={styles.select}
          >
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
            <option value="90">90 minutos</option>
          </select>
        </label>

        <div style={styles.infoBoxAlcohol}>
          <p style={styles.infoTextAlcohol}>
            *Nota: Científicamente, el cuerpo humano tarda alrededor de 60 minutos en procesar y eliminar 1 UBE (Unidad de Bebida Estándar) del sistema.
          </p>
        </div>

        {/* Separador visual elegante */}
        <hr style={styles.divider} />

        {/* SECCIÓN AGUA / NOTIFICACIONES (La nueva funcionalidad) */}
        <label style={styles.label}>
          <strong>Frecuencia de los recordatorios de agua:</strong>
          <select
            value={intervaloHoras}
            onChange={handleHorasChange}
            style={styles.select}
          >
            <option value="1">Cada 1 hora</option>
            <option value="2">Cada 2 horas (Recomendado)</option>
            <option value="3">Cada 3 horas</option>
            <option value="4">Cada 4 horas</option>
          </select>
        </label>

        <div style={styles.infoBoxAgua}>
          <p style={styles.infoTextAgua}>
            *Nota: Las alertas de hidratación llegarán de forma automática a este dispositivo para balancear tu consumo durante la noche, incluso con la app cerrada.
          </p>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem' },
  formGroup: { marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '1.1rem', color: '#1f2937' },
  select: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' },
  // Caja original de alcohol (Tono ámbar/aviso)
  infoBoxAlcohol: { padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' },
  infoTextAlcohol: { color: '#b45309', fontSize: '0.9rem', margin: 0, lineHeight: '1.4' },
  // Caja nueva de agua (Tono azul hidratación)
  infoBoxAgua: { padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' },
  infoTextAgua: { color: '#0369a1', fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }
}