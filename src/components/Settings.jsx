import { useState, useEffect } from 'react'

export default function Settings() {
  // Estado local para controlar el select. Por defecto usamos 45.
  const [intervalo, setIntervalo] = useState('45')

  // 1. Al montar el componente, leemos el localStorage
  useEffect(() => {
    const valorGuardado = localStorage.getItem('intervalo_minutos')
    if (valorGuardado) {
      setIntervalo(valorGuardado)
    } else {
      // Si el usuario entra por primera vez y no hay nada, inicializamos en 45
      localStorage.setItem('intervalo_minutos', '45')
    }
  }, [])

  // 2. Al cambiar la opción en el desplegable, actualizamos el estado y el localStorage
  const handleChange = (e) => {
    const nuevoValor = e.target.value
    setIntervalo(nuevoValor)
    localStorage.setItem('intervalo_minutos', nuevoValor)
  }

  return (
    <div style={styles.container}>
      <h2>⚙️ Ajustes</h2>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          <strong>Minutos de espera por UBE:</strong>
          <select
            value={intervalo}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
            <option value="90">90 minutos</option>
          </select>
        </label>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            *Nota: Científicamente, el cuerpo humano tarda alrededor de 60 minutos en procesar y eliminar 1 UBE (Unidad de Bebida Estándar) del sistema.
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
  infoBox: { padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' },
  infoText: { color: '#0369a1', fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }
}