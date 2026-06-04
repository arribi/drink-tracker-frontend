import { useState, useEffect } from 'react'

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
    <div style={styles.container}>
      <h2>⚙️ Ajustes</h2>

      <div style={styles.formGroup}>

        {/* 🚀 SECCIÓN ALCOHOL / UBEs (Ahora 100% científica e informativa) */}
        <div style={styles.infoBoxAlcohol}>
          <h3 style={styles.infoTitleAlcohol}>🧪 Procesamiento Hepático</h3>
          <p style={styles.infoTextAlcohol}>
            El tiempo de procesamiento del alcohol está fijado por defecto bajo estándares médicos. Tu hígado procesará <strong>1 UBE cada 60 minutos</strong>.
            El sistema calculará y acumulará tu tiempo automáticamente en la pantalla principal según lo que bebas.
          </p>
        </div>

        {/* Separador visual elegante */}
        <hr style={styles.divider} />

        {/* SECCIÓN AGUA / NOTIFICACIONES */}
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
            *Nota: Las alertas de hidratación llegarán de forma automática a este dispositivo para balancear tu consumo durante la fiesta, incluso con la app cerrada.
          </p>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem' },
  formGroup: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
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
  // Caja informativa de alcohol rediseñada
  infoBoxAlcohol: { padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '12px', borderLeft: '5px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  infoTitleAlcohol: { margin: 0, color: '#92400e', fontSize: '1.2rem', fontWeight: 'bold' },
  infoTextAlcohol: { color: '#b45309', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' },
  // Caja original de agua
  infoBoxAgua: { padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' },
  infoTextAgua: { color: '#0369a1', fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }
}