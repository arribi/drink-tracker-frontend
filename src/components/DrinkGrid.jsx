import styles from './Dashboard.module.css'

export default function DrinkGrid({ handleAddDrink }) {
  return (
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
  )
}