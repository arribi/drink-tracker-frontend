/**
 * Calcula cuántos minutos tarda el cuerpo en procesar 1 UBE (10g de alcohol)
 */
export const calcularMinsPerUbe = (peso, sexo) => {
  if (!peso || !sexo) return 60;
  const r = sexo === 'M' ? 0.55 : 0.68;
  const horas = 10 / (0.15 * peso * r);
  return Math.round(horas * 60);
};

/**
 * Calcula la Tasa de Alcoholemia Estimada (g/L)
 * Acepta 'customAhora' para simular cálculos en el futuro
 */
export const calcularBacEst = (history, peso, sexo, minsPerUbe, customAhora = null) => {
  if (!history || history.length === 0 || !peso || !sexo) return 0;

  const r = sexo === 'M' ? 0.55 : 0.68;
  const ahora = customAhora || Date.now(); // ⏱️ Aquí aplicamos el viaje en el tiempo
  const primeraBebidaMs = history[0].id;
  const horasTranscurridas = Math.max(0, (ahora - primeraBebidaMs) / (1000 * 60 * 60));

  let gramosAbsorbidosTotales = 0;
  const TIEMPO_ABSORCION_MS = 45 * 60 * 1000;

  history.forEach(drink => {
    const tiempoDesdeQueSurgioMs = ahora - drink.id;
    const gramosTotalesDeEstaBebida = drink.ubes * 10;

    if (tiempoDesdeQueSurgioMs >= TIEMPO_ABSORCION_MS) {
      gramosAbsorbidosTotales += gramosTotalesDeEstaBebida;
    } else if (tiempoDesdeQueSurgioMs > 0) {
      const fraccionAbsorbida = tiempoDesdeQueSurgioMs / TIEMPO_ABSORCION_MS;
      gramosAbsorbidosTotales += gramosTotalesDeEstaBebida * fraccionAbsorbida;
    }
  });

  const calculo = (gramosAbsorbidosTotales / (peso * r)) - (0.15 * horasTranscurridas);
  return Math.max(0, calculo);
};

/**
 * 📈 NUEVO: Compara la tasa actual con la de dentro de 1 minuto para ver la tendencia
 */
export const calcularTendenciaBac = (history, peso, sexo, minsPerUbe) => {
  if (!history || history.length === 0 || !peso || !sexo) return 'estable';

  const bacActual = calcularBacEst(history, peso, sexo, minsPerUbe, Date.now());
  const bacFuturo = calcularBacEst(history, peso, sexo, minsPerUbe, Date.now() + 60000); // +1 minuto

  if (bacActual === 0 && bacFuturo === 0) return 'estable';
  if (bacFuturo > bacActual) return 'subiendo';
  if (bacFuturo < bacActual) return 'bajando';

  return 'estable';
};

/**
 * Devuelve el nivel de gravedad de la resaca estimada
 */
export const obtenerDiagnosticoResaca = (history, totalUbesConsumidas, minsPerUbe) => {
  if (!history || history.length === 0) {
    return { texto: "👼 Modo Ángel: No has bebido nada. Mañana estarás resplandeciente.", color: "#22c55e" };
  }

  const primeraBebidaMs = history[0].id;
  const ahoraMs = Date.now();
  const horasTranscurridas = Math.max(0, (ahoraMs - primeraBebidaMs) / (1000 * 60 * 60));
  const ubesMetabolizadas = horasTranscurridas * (60 / minsPerUbe);
  const cargaActual = Math.max(0, totalUbesConsumidas - ubesMetabolizadas);

  if (cargaActual <= 0.5) {
    return { texto: "🦸‍♂️ Cero resaca: Ritmo clínico perfecto. Tu cuerpo ha procesado casi todo sobre la marcha. Mañana madrugas y te ríes de los demás.", color: "#22c55e" };
  } else if (cargaActual <= 2.5) {
    return { texto: "🕺 Modo supervivencia: Hay un pequeño atasco metabólico, pero nada grave. Dos vasos de agua antes de dormir y mañana estarás al 90%.", color: "#eab308" };
  } else if (cargaActual <= 5) {
    return { texto: "🧟‍♂️ Resaca importante: Te has venido bastante arriba. El hígado está pidiendo la hora. Mañana maratón de series en el sofá.", color: "#f97316" };
  } else {
    return { texto: "🪦 Resacón brutal: La ciencia no hace milagros. Has saturado el sistema por completo. Ve redactando tu testamento y cancela los planes de mañana.", color: "#ef4444" };
  }
};