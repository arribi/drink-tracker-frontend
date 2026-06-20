import styles from './Dashboard.module.css'

export default function TimerCircle({ isActive, isPulsing, ringColor, porcentajeProgreso, formattedTime }) {
  return (
    <div className={`${styles.circle} ${isPulsing ? styles.pulseRing : ''}`} style={{ background: `conic-gradient(${ringColor} ${porcentajeProgreso}%, #d1d5db ${porcentajeProgreso}%)` }}>
      <div className={styles.circleContent}>
        <p className={`${styles.timerText} ${isPulsing ? styles.pulseText : ''}`}>{formattedTime}</p>
        <p className={styles.timerLabel}>{isActive ? '' : 'Listos para empezar'}</p>
      </div>
    </div>
  )
}