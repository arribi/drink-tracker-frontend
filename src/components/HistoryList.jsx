import styles from './Dashboard.module.css'

export default function HistoryList({ history, handleUndoLastDrink, handleEndParty }) {
  if (history.length === 0) return null;

  return (
    <div className={styles.historySection}>
      <h3>Llevas {history.length} {history.length === 1 ? 'bebida' : 'bebidas'} :</h3>
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
  )
}