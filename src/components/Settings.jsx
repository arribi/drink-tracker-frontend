import { useState, useEffect } from 'react'
import styles from './Settings.module.css'

export default function Settings() {
  const [intervaloHoras, setIntervaloHoras] = useState('2')

  // Nuevos estados para Widmark
  const [peso, setPeso] = useState('')
  const [sexo, setSexo] = useState('')

  useEffect(() => {
    localStorage.removeItem('intervalo_minutos')

    const valorHoras = localStorage.getItem('intervalo_horas')
    if (valorHoras) setIntervaloHoras(valorHoras)
    else localStorage.setItem('intervalo_horas', '2')

    // Cargar perfil físico
    const valorPeso = localStorage.getItem('usuario_peso')
    const valorSexo = localStorage.getItem('usuario_sexo')
    if (valorPeso) setPeso(valorPeso)
    if (valorSexo) setSexo(valorSexo)
  }, [])

  const handleHorasChange = async (e) => {
    const nuevoValor = e.target.value
    setIntervaloHoras(nuevoValor)
    localStorage.setItem('intervalo_horas', nuevoValor)

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registro = await navigator.serviceWorker.ready
        const suscripcionExistente = await registro.pushManager.getSubscription()

        if (suscripcionExistente) {
          const respuesta = await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-interval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: suscripcionExistente.endpoint, intervalo: nuevoValor })
          })
          const datos = await respuesta.json()
          console.log('Sincronización de agua:', datos.mensaje)
        }
      } catch (error) {
        console.error('Error push agua:', error)
      }
    }
  }

  // Manejadores del perfil físico
  const handlePesoChange = (e) => {
    const nuevoPeso = e.target.value
    setPeso(nuevoPeso)
    localStorage.setItem('usuario_peso', nuevoPeso)
  }

  const handleSexoChange = (e) => {
    const nuevoSexo = e.target.value
    setSexo(nuevoSexo)
    localStorage.setItem('usuario_sexo', nuevoSexo)
  }

  return (
    <div className={styles.container}>
      <h2>⚙️ Ajustes</h2>

      <div className={styles.formGroup}>

        {/* 🧬 NUEVA SECCIÓN: PERFIL FÍSICO */}
        <div className={styles.infoBoxAlcohol}>
          <h3 className={styles.infoTitleAlcohol}>⚖️ Perfil Físico</h3>
          <p className={styles.infoTextAlcohol}>
            Para calcular tu tasa de alcoholemia estimada (BAC) mediante la <strong>fórmula de Widmark</strong>, necesitamos estos datos. Se guardan solo en tu móvil.
          </p>

          <label className={styles.label}>
            <strong>Peso (kg):</strong>
            <input
              type="number"
              value={peso}
              onChange={handlePesoChange}
              placeholder="Ej: 75"
              className={styles.input}
              min="30"
              max="200"
            />
          </label>

          <label className={styles.label}>
            <strong>Sexo Biológico:</strong>
            <select value={sexo} onChange={handleSexoChange} className={styles.select}>
              <option value="">Selecciona...</option>
              <option value="H">Hombre</option>
              <option value="M">Mujer</option>
            </select>
          </label>
        </div>

        <hr className={styles.divider} />

        {/* SECCIÓN AGUA (Original) */}
        <label className={styles.label}>
          <strong>Frecuencia de agua:</strong>
          <select value={intervaloHoras} onChange={handleHorasChange} className={styles.select}>
            <option value="1">Cada 1 hora</option>
            <option value="2">Cada 2 horas (Recomendado)</option>
            <option value="3">Cada 3 horas</option>
            <option value="4">Cada 4 horas</option>
          </select>
        </label>

        <div className={styles.infoBoxAgua}>
          <p className={styles.infoTextAgua}>
            *Nota: Las alertas de hidratación llegarán de forma automática a este dispositivo para balancear tu consumo durante la fiesta.
          </p>
        </div>

      </div>
    </div>
  )
}