import styles from './Dashboard.module.css'

export default function PartySummary({ totalUbesConsumidas, diagnostico, history, handleReset }) {
  return (
    <div className={styles.container}>
      <h2>📊 Resumen de la fiesta</h2>
      <div className={styles.summaryCard}>
        <p className={styles.summaryTotal}>Alcohol total: <strong>{totalUbesConsumidas} UBEs</strong></p>
        <div className={styles.diagnosticoBox} style={{ borderColor: diagnostico.color }}>
          <p className={styles.diagnosticoText}>{diagnostico.texto}</p>
        </div>
      </div>
      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.historyTitle}>📋 Bebidas de la fiesta:</h3>
          <ul className={styles.list}>
            {history.map((drink) => (
              <li key={drink.id} className={styles.listItem}>
                <span>{drink.type}</span>
                <span className={styles.timeText}>{drink.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button className={styles.resetButton} onClick={handleReset}>Iniciar Nueva Fiesta</button>
    </div>
  )
}