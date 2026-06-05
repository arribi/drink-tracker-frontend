import styles from './Dashboard.module.css'
import { useFiesta } from '../hooks/useFiesta'
import { calcularMinsPerUbe, calcularBacEst, obtenerDiagnosticoResaca } from '../utils/alcoholMath'

export default function Dashboard() {
  // 🎮 Conectamos el "mando a distancia"
  const {
    timeLeft,
    isActive,
    history,
    showSummary,
    peso,
    sexo,
    handleAddDrink,
    handleUndoLastDrink,
    handleEndParty,
    handleReset
  } = useFiesta()

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const minsPerUbe = calcularMinsPerUbe(peso, sexo)
  const totalUbesConsumidas = history.reduce((acc, drink) => acc + (drink.ubes || 1), 0)
  const diagnostico = obtenerDiagnosticoResaca(history, totalUbesConsumidas, minsPerUbe)
  const bacEst = calcularBacEst(history, peso, sexo, minsPerUbe)

  const porcentajeProgreso = isActive && totalUbesConsumidas > 0
    ? Math.min(100, Math.max(0, (timeLeft / (totalUbesConsumidas * minsPerUbe * 60 * 1000)) * 100))
    : 100
  const ringColor = isActive ? '#f97316' : '#22c55e'
  const isPulsing = isActive && timeLeft > 0 && timeLeft <= 900000
  const bacColor = bacEst >= 0.5 ? '#ef4444' : bacEst >= 0.25 ? '#eab308' : '#22c55e'

  if (showSummary) {
    return (
      <div className={styles.container}>
        <h2>📊 Resumen de la noche</h2>
        <div className={styles.summaryCard}>
          <p className={styles.summaryTotal}>Alcohol total: <strong>{totalUbesConsumidas} UBEs</strong></p>
          <div className={styles.diagnosticoBox} style={{ borderColor: diagnostico.color }}>
            <p className={styles.diagnosticoText}>{diagnostico.texto}</p>
          </div>
        </div>
        {history.length > 0 && (
          <div className={styles.historySection}>
            <h3 className={styles.historyTitle}>📋 Bebidas de la noche:</h3>
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

  return (
    <div className={styles.container}>
      <h2>{isActive ? '🟠 En proceso' : '🟢 Vía libre'}</h2>

      <div className={`${styles.circle} ${isPulsing ? styles.pulseRing : ''}`} style={{ background: `conic-gradient(${ringColor} ${porcentajeProgreso}%, #d1d5db ${porcentajeProgreso}%)` }}>
        <div className={styles.circleContent}>
          <p className={`${styles.timerText} ${isPulsing ? styles.pulseText : ''}`}>{formatTime(timeLeft)}</p>
          <p className={styles.timerLabel}>{isActive ? 'Hígado trabajando' : 'Listos para empezar'}</p>
        </div>
      </div>

      <div className={styles.gridContainer}>
        <button className={`${styles.drinkButton} ${styles.drinkSuave}`} onClick={() => handleAddDrink('Chupito Suave', 0.5)}>
          <span>🥃 Chupito Suave</span> <span className={`${styles.ubeTag} ${styles.ubeTagDark}`}>0.5 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkCana}`} onClick={() => handleAddDrink('Caña / Vino', 1)}>
          <span>🍺 Caña / Vino</span> <span className={styles.ubeTag}>1 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkCana}`} onClick={() => handleAddDrink('Vermú / Fino', 1)}>
          <span>🍸 Vermú / Fino</span> <span className={styles.ubeTag}>1 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkFuerte}`} onClick={() => handleAddDrink('Chupito Fuerte', 1)}>
          <span>🔥 Chupito Fuerte</span> <span className={styles.ubeTag}>1 UBE</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkLata}`} onClick={() => handleAddDrink('Lata / Tercio', 1.5)}>
          <span>🍺 Lata / Tercio</span> <span className={styles.ubeTag}>1.5 UBEs</span>
        </button>
        <button className={`${styles.drinkButton} ${styles.drinkCopa}`} onClick={() => handleAddDrink('Combinado / Copa', 2)}>
          <span>🍹 Combinado / Copa Larga</span> <span className={styles.ubeTag}>2 UBEs</span>
        </button>
      </div>

      {history.length > 0 && (
        <div className={styles.bacCard}>
          <h3 className={styles.bacTitle}>🩸 Tasa de Alcoholemia Estimada</h3>
          {(!peso || !sexo) ? (
            <p className={styles.bacMissing}>⚠️ Configura tu <strong>Peso y Sexo</strong> en Ajustes para ver tu estimación.</p>
          ) : (
            <>
              <p className={styles.bacValue} style={{ color: bacColor }}>
                {bacEst.toFixed(3)} <span style={{ fontSize: '1.2rem' }}>g/L en sangre</span>
              </p>
              <p style={{ margin: '0 0 1rem 0', color: '#6b7280', fontSize: '1rem', fontWeight: 'bold' }}>
                (Equivale a {(bacEst / 2).toFixed(3)} mg/L en aire)
              </p>
              <p className={styles.bacDisclaimer}>*Cálculo dinámico (Widmark con absorción diferida de 45 min). Conducir solo con 0.0.</p>
            </>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3>Llevas {history.length} {history.length === 1 ? 'bebida' : 'bebidas'} anoche:</h3>
          <ul className={styles.list}>
            {history.map((drink) => (
              <li key={drink.id} className={styles.listItem}>
                <span>{drink.type}</span> <span className={styles.timeText}>{drink.time}</span>
              </li>
            ))}
          </ul>
          <div className={styles.actionGroup}>
            <button className={styles.undoButton} onClick={handleUndoLastDrink}>↩️ Deshacer Última</button>
            <button className={styles.endButton} onClick={handleEndParty}>🛑 Terminar Fiesta</button>
          </div>
        </div>
      )}
    </div>
  )
}