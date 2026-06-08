import { useState, useEffect } from 'react'
import styles from './Settings.module.css'

export default function Settings() {
  const [intervaloHoras, setIntervaloHoras] = useState('2')

  // Estados para Watson
  const [peso, setPeso] = useState('')
  const [sexo, setSexo] = useState('')
  const [edad, setEdad] = useState('')
  const [altura, setAltura] = useState('')
  const [tolerancia, setTolerancia] = useState('normal')

  useEffect(() => {
    localStorage.removeItem('intervalo_minutos')

    const valorHoras = localStorage.getItem('intervalo_horas')
    if (valorHoras) setIntervaloHoras(valorHoras)
    else localStorage.setItem('intervalo_horas', '2')

    // Cargar perfil físico completo
    const valorPeso = localStorage.getItem('usuario_peso')
    const valorSexo = localStorage.getItem('usuario_sexo')
    const valorEdad = localStorage.getItem('usuario_edad')
    const valorAltura = localStorage.getItem('usuario_altura')
    const valorTolerancia = localStorage.getItem('usuario_tolerancia')

    if (valorPeso) setPeso(valorPeso)
    if (valorSexo) setSexo(valorSexo)
    if (valorEdad) setEdad(valorEdad)
    if (valorAltura) setAltura(valorAltura)
    if (valorTolerancia) setTolerancia(valorTolerancia)
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

  const handleEdadChange = (e) => {
    const nuevaEdad = e.target.value
    setEdad(nuevaEdad)
    localStorage.setItem('usuario_edad', nuevaEdad)
  }

  const handleAlturaChange = (e) => {
    const nuevaAltura = e.target.value
    setAltura(nuevaAltura)
    localStorage.setItem('usuario_altura', nuevaAltura)
  }

  const handleToleranciaChange = (e) => {
    const nuevaTolerancia = e.target.value
    setTolerancia(nuevaTolerancia)
    localStorage.setItem('usuario_tolerancia', nuevaTolerancia)
  }

  return (
    <div className={styles.container}>
      <h2>⚙️ Ajustes</h2>

      <div className={styles.formGroup}>

        {/* 🧬 SECCIÓN: PERFIL FÍSICO */}
        <div className={styles.infoBoxAlcohol}>
          <h3 className={styles.infoTitleAlcohol}>⚖️ Perfil Físico</h3>
          <p className={styles.infoTextAlcohol}>
            Usamos la <strong>fórmula clínica de Watson</strong> para determinar con precisión matemática cómo se distribuye el alcohol en tu cuerpo.
          </p>

          <label className={styles.label}>
            <strong>Sexo Biológico:</strong>
            <select value={sexo} onChange={handleSexoChange} className={styles.select}>
              <option value="">Selecciona...</option>
              <option value="H">Hombre</option>
              <option value="M">Mujer</option>
            </select>
          </label>

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
            <strong>Edad (años):</strong>
            <input
              type="number"
              value={edad}
              onChange={handleEdadChange}
              placeholder="Ej: 28"
              className={styles.input}
              min="18"
              max="100"
            />
          </label>

          <label className={styles.label}>
            <strong>Altura (cm):</strong>
            <input
              type="number"
              value={altura}
              onChange={handleAlturaChange}
              placeholder="Ej: 175"
              className={styles.input}
              min="100"
              max="250"
            />
          </label>

          <label className={styles.label}>
            <strong>Hábito de consumo:</strong>
            <select value={tolerancia} onChange={handleToleranciaChange} className={styles.select}>
              <option value="baja">Bajo (Bebo muy ocasionalmente)</option>
              <option value="normal">Normal (Salgo algunos fines de semana)</option>
              <option value="alta">Alto (Bebo de forma habitual)</option>
            </select>
          </label>
        </div>

        <hr className={styles.divider} />

        {/* SECCIÓN AGUA */}
        <label className={styles.label}>
          <strong>Frecuencia de agua:</strong>
          <select value={intervaloHoras} onChange={handleHorasChange} className={styles.select}>
            <option value="1">Cada 1 hora</option>
            <option value="2">Cada 2 horas (Recomendado)</option>
            <option value="3">Cada 3 horas</option>
            <option value="4">Cada 4 hours</option>
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