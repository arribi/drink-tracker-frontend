import styles from './Dashboard.module.css'
import { useFiesta } from '../hooks/useFiesta'
import { calcularMinsPerUbe, calcularBacEst, obtenerDiagnosticoResaca, calcularTendenciaBac } from '../utils/alcoholMath'

// Importamos nuestros nuevos "bloques de Lego"
import TimerCircle from './TimerCircle'
import DrinkGrid from './DrinkGrid'
import BacCard from './BacCard'
import HistoryList from './HistoryList'
import PartySummary from './PartySummary'

export default function Dashboard() {
  const {
    timeLeft,
    isActive,
    history,
    showSummary,
    peso,
    sexo,
    edad,
    altura,
    tolerancia,
    handleAddDrink,
    handleUndoLastDrink,
    handleEndParty,
    handleReset
  } = useFiesta()

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)

    // Si sobrepasa la hora, formateamos en Horas y Minutos
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours}h ${minutes}m`
    }

    // Si es menos de una hora, dejamos el MM:SS clásico para ver los segundos bajar
    const seconds = totalSeconds % 60
    return `${totalMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // --- CÁLCULOS MATEMÁTICOS RÁPIDOS ---
  const minsPerUbe = calcularMinsPerUbe(peso, sexo, edad, altura, tolerancia)
  const totalUbesConsumidas = history.reduce((acc, drink) => acc + (drink.ubes || 1), 0)
  const diagnostico = obtenerDiagnosticoResaca(history, totalUbesConsumidas, minsPerUbe)
  const bacEst = calcularBacEst(history, peso, sexo, minsPerUbe, edad, altura, tolerancia)
  const tendenciaBac = calcularTendenciaBac(history, peso, sexo, minsPerUbe, edad, altura, tolerancia)


  // --- VARIABLES VISUALES ---
  const porcentajeProgreso = isActive && totalUbesConsumidas > 0
    ? Math.min(100, Math.max(0, (timeLeft / (totalUbesConsumidas * minsPerUbe * 60 * 1000)) * 100))
    : 100
  const ringColor = isActive ? '#f97316' : '#22c55e'
  const isPulsing = isActive && timeLeft > 0 && timeLeft <= 900000
  const bacColor = bacEst >= 0.5 ? '#ef4444' : bacEst >= 0.25 ? '#eab308' : '#22c55e'

  // Si la fiesta terminó, mostramos solo la pantalla de resumen
  if (showSummary) {
    return (
      <div className={styles.container}>
        <PartySummary
          totalUbesConsumidas={totalUbesConsumidas}
          diagnostico={diagnostico}
          history={history}
          handleReset={handleReset}
        />
      </div>
    )
  }

  // Interfaz principal activa
  return (
    <div className={styles.container}>

      {/* 🌟 HEADER PREMIUM */}
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Cero Resaca</h1>
        <div className={styles.statusBadge}>
          <div
            className={styles.statusDot}
            style={{ backgroundColor: isActive ? '#f97316' : '#4ade80' }}
          />
          <span>{isActive ? 'En proceso' : 'Vía libre'}</span>
        </div>
      </header>

      {/* 🌟 TARJETA BLANCA PARA EL TEMPORIZADOR */}
      <div className={styles.timerCardWrapper}>
        <TimerCircle
          isActive={isActive}
          isPulsing={isPulsing}
          ringColor={ringColor}
          porcentajeProgreso={porcentajeProgreso}
          formattedTime={formatTime(timeLeft)}
        />
      </div>

      <DrinkGrid handleAddDrink={handleAddDrink} />

      {history.length > 0 && (
        <>
          <BacCard
            peso={peso}
            sexo={sexo}
            bacEst={bacEst}
            bacColor={bacColor}
            tendencia={tendenciaBac}
            edad={edad}
            altura={altura}
          />

          <HistoryList
            history={history}
            handleUndoLastDrink={handleUndoLastDrink}
            handleEndParty={handleEndParty}
          />
        </>
      )}
    </div>
  )
}