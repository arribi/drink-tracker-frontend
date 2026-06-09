import styles from './Dashboard.module.css'

// 🚪 ¡Aquí añadimos edad, altura y legalAlert al recibidor de props!
export default function BacCard({ peso, sexo, bacEst, bacColor, tendencia, edad, altura, isActive, bacAire }) {
  // Elegimos el icono según la tendencia
  const iconoTendencia = tendencia === 'subiendo' ? ' ⬆️' : tendencia === 'bajando' ? ' ⬇️' : '';
  const textoTendencia = tendencia === 'subiendo' ? ' (Subiendo)' : tendencia === 'bajando' ? ' (Bajando)' : '';
  const usandoWatson = edad > 0 && altura > 0;

  // --- 🚦 LÓGICA DE AVISOS LEGALES EN AIRE ASPIRADO (mg/L) ---
  let legalAlert = {
    message: '💚 ¡Hígado libre! Estado óptimo.',
    className: styles.legalSafe
  }

  if (isActive && bacAire > 0) {
    if (bacAire > 0.60) {
      legalAlert = {
        message: `🚨 Tu tasa actual de es más de 0.60 mg/L en aire aspirado. Te expones a un delito penal con posibles penas de cárcel.`,
        className: styles.legalCriminal
      }
    } else if (bacAire >= 0.25) {
      legalAlert = {
        message: `🛑 Tu tasa actual es más de 0.25 mg/L en aire aspirado. Te expones a una multa administrativa grave y pérdida de puntos.`,
        className: styles.legalAdministrative
      }
    } else {
      legalAlert = {
        message: `🚗 Tu tasa actual es menos de 0.25 mg/L en aire aspirado. Puedes conducir, pero hazlo con cuidado.`,
        className: styles.legalWarning
      }
    }
  }

  return (
    <div className={styles.bacCard}>
      <h3 className={styles.bacTitle}>🩸 Tasa de Alcoholemia Estimada</h3>
      {(!peso || !sexo) ? (
        <p className={styles.bacMissing}>⚠️ Configura tu <strong>Peso y Sexo</strong> en Ajustes para ver tu estimación.</p>
      ) : (
        <>
          <p className={styles.bacValue} style={{ color: '#16a34a' }}>
            {bacAire.toFixed(3)}
            <span style={{ fontSize: '1.2rem', marginLeft: '5px' }}>
              mg/L en aire {iconoTendencia}
            </span>
          </p>

          <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: 'normal' }}>
            (Equivale a {bacEst.toFixed(3)} g/L en sangre) <span style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>{textoTendencia}</span>
          </p>

          {/* Legal Alert integrada en la card */}
          <div className={legalAlert.className} style={{ marginTop: '1rem' }}>
            {legalAlert.message}
          </div>

          <p className={styles.bacDisclaimer}>
            *Cálculo dinámico ({usandoWatson ? 'Fórmula clínica de Watson' : 'Widmark estándar'} con absorción diferida de 45 min). Conducir solo con 0.0.
          </p>
        </>
      )}
    </div>
  )
}