import styles from './Dashboard.module.css'

export default function BacCard({ peso, sexo, bacEst, bacColor }) {
  return (
    <div className={styles.bacCard}>
      <h3 className={styles.bacTitle}>🩸 Tasa de Alcoholemia Estimada</h3>
      {(!peso || !sexo) ? (
        <p className={styles.bacMissing}>⚠️ Configura tu <strong>Peso y Sexo</strong> en Ajustes para ver tu estimación.</p>
      ) : (
        <>
          <p className={styles.bacValue} style={{ color: bacColor }}>
            {bacEst.toFixed(3)} <span style={{fontSize: '1.2rem'}}>g/L en sangre</span>
          </p>
          <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '1rem', fontWeight: 'bold' }}>
            (Equivale a {(bacEst / 2).toFixed(3)} mg/L en aire)
          </p>
          <p className={styles.bacDisclaimer}>*Cálculo dinámico (Widmark con absorción diferida de 45 min). Conducir solo con 0.0.</p>
        </>
      )}
    </div>
  )
}