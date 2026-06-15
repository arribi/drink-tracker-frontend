import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import styles from './Settings.module.css'

export default function Settings() {
  const [intervaloHoras, setIntervaloHoras] = useState(() => localStorage.getItem('intervalo_horas') || '2')
  const [peso, setPeso] = useState(() => localStorage.getItem('usuario_peso') || '')
  const [sexo, setSexo] = useState(() => localStorage.getItem('usuario_sexo') || '')
  const [edad, setEdad] = useState(() => localStorage.getItem('usuario_edad') || '')
  const [altura, setAltura] = useState(() => localStorage.getItem('usuario_altura') || '')
  const [tolerancia, setTolerancia] = useState(() => localStorage.getItem('usuario_tolerancia') || 'normal')

  useEffect(() => {
    localStorage.removeItem('intervalo_minutos')
    if (!localStorage.getItem('intervalo_horas')) {
      localStorage.setItem('intervalo_horas', '2')
    }
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
          toast.promise(
            fetch(`${import.meta.env.VITE_BACKEND_URL}/update-interval`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: suscripcionExistente.endpoint, intervalo: nuevoValor })
            }).then(async (respuesta) => {
              const datos = await respuesta.json()
              console.log('Sincronización de agua:', datos.mensaje)
              return datos
            }),
            {
              loading: 'Actualizando frecuencia...',
              success: 'Frecuencia actualizada ✓',
              error: 'Error al actualizar frecuencia'
            }
          )
        }
      } catch (error) {
        console.error('Error push agua:', error)
      }
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>⚙️ Ajustes</h2>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>⚖️ Perfil Físico</h3>
        <p className={styles.cardDescription}>
          Usamos la <strong>fórmula clínica de Watson</strong> para determinar con precisión matemática cómo se distribuye el alcohol en tu cuerpo.
        </p>

        <div className={styles.gridTwo}>
          <label className={styles.label}>
            <span>Sexo Biológico</span>
            <select value={sexo} onChange={(e) => { setSexo(e.target.value); localStorage.setItem('usuario_sexo', e.target.value); }} className={styles.select}>
              <option value="">Selecciona...</option>
              <option value="H">Hombre</option>
              <option value="M">Mujer</option>
            </select>
          </label>

          <label className={styles.label}>
            <span>Hábito de consumo</span>
            <select value={tolerancia} onChange={(e) => { setTolerancia(e.target.value); localStorage.setItem('usuario_tolerancia', e.target.value); }} className={styles.select}>
              <option value="baja">Bajo (Ocasional)</option>
              <option value="normal">Normal (Fines de semana)</option>
              <option value="alta">Alto (Habitual)</option>
            </select>
          </label>
        </div>

        <div className={styles.gridThree}>
          <label className={styles.label}>
            <span>Peso (kg)</span>
            <input type="number" value={peso} onChange={(e) => { setPeso(e.target.value); localStorage.setItem('usuario_peso', e.target.value); }} placeholder="Ej: 75" className={styles.input} min="30" max="200" />
          </label>

          <label className={styles.label}>
            <span>Edad (años)</span>
            <input type="number" value={edad} onChange={(e) => { setEdad(e.target.value); localStorage.setItem('usuario_edad', e.target.value); }} placeholder="Ej: 28" className={styles.input} min="18" max="100" />
          </label>

          <label className={styles.label}>
            <span>Altura (cm)</span>
            <input type="number" value={altura} onChange={(e) => { setAltura(e.target.value); localStorage.setItem('usuario_altura', e.target.value); }} placeholder="Ej: 175" className={styles.input} min="100" max="250" />
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>💧 Hidratación Automática</h3>

        <label className={styles.label}>
          <span>Frecuencia de las alertas</span>
          <select value={intervaloHoras} onChange={handleHorasChange} className={styles.select}>
            <option value="1">Cada 1 hora</option>
            <option value="2">Cada 2 horas (por defecto)</option>
            <option value="3">Cada 3 horas</option>
            <option value="4">Cada 4 horas</option>
          </select>
        </label>

        <div className={styles.infoBoxAgua}>
          <p>
            📌 Las alertas llegarán de forma inteligente a tu móvil para balancear tu consumo mientras mantengas un nivel de alcoholemia activo.
          </p>
        </div>
      </div>
    </div>
  )
}
