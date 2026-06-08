export const calcularMinsPerUbe = (peso, sexo, edad = 0, altura = 0) => {
  if (!peso || !sexo) return 40;

  // 🧪 Si tenemos los datos de Watson, calculamos el tiempo según el Agua Corporal Total (TBW)
  if (edad > 0 && altura > 0) {
    let tbw = 0;
    if (sexo === 'H') {
      tbw = 2.447 - (0.09156 * edad) + (0.1074 * altura) + (0.3362 * peso);
    } else {
      tbw = -2.097 + (0.1069 * altura) + (0.2466 * peso);
    }

    // Convertimos la tasa de eliminación clínica (0.15 g/L por hora) al tiempo por UBE
    const mins = (8 / (tbw * 0.15)) * 60;
    return Math.round(mins);
  }

  // 🪵 Fallback clásico si no hay edad/altura
  const r = sexo === 'M' ? 0.55 : 0.68;
  const gramosPorHora = peso * 0.15 * r;
  const mins = (10 / gramosPorHora) * 60;
  return Math.round(mins);
};
/**
 * FÓRMULA DE WATSON + WIDMARK COMBINADAS
 */
export const calcularBacEst = (history, peso, sexo, minsPerUbe, edad = 0, altura = 0, customAhora = null) => {
  if (!history || history.length === 0 || !peso || !sexo) return 0;

  const ahora = customAhora || Date.now();
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

  // SI TENEMOS EDAD Y ALTURA -> APLICAMOS WATSON (Estándar Clínico)
  if (edad > 0 && altura > 0) {
    let tbw = 0; // Total Body Water (Agua corporal total en litros)

    if (sexo === 'H') {
      tbw = 2.447 - (0.09156 * edad) + (0.1074 * altura) + (0.3362 * peso);
    } else {
      tbw = -2.097 + (0.1069 * altura) + (0.2466 * peso);
    }

    // El alcohol en sangre se calcula dividiendo los gramos entre el volumen de agua de la sangre.
    // Como la sangre tiene un 80% de agua, adaptamos el ACT clínico: BAC = (Gramos * 0.80) / ACT
    const calculo = (gramosAbsorbidosTotales * 0.80 / tbw) - (0.15 * horasTranscurridas);
    return Math.max(0, calculo);
  }

  // FALLBACK: Si no hay edad/altura, usamos Widmark clásico
  const r = sexo === 'M' ? 0.55 : 0.68;
  const calculo = (gramosAbsorbidosTotales / (peso * r)) - (0.15 * horasTranscurridas);
  return Math.max(0, calculo);
};

export const calcularTendenciaBac = (history, peso, sexo, minsPerUbe, edad = 0, altura = 0) => {
  if (!history || history.length === 0 || !peso || !sexo) return 'estable';

  const bacActual = calcularBacEst(history, peso, sexo, minsPerUbe, edad, altura, Date.now());
  const bacFuturo = calcularBacEst(history, peso, sexo, minsPerUbe, edad, altura, Date.now() + 60000);

  if (bacActual === 0 && bacFuturo === 0) return 'estable';
  if (bacFuturo > bacActual) return 'subiendo';
  if (bacFuturo < bacActual) return 'bajando';

  return 'estable';
};

export const obtenerDiagnosticoResaca = (history, totalUbes, minsPerUbe) => {
  if (totalUbes === 0) return { texto: '¡Cuerpo limpio! Disfruta del día. ☀️', color: '#22c55e' };
  if (totalUbes <= 3) return { texto: 'Consumo moderado. Mañana estarás como una rosa si bebes agua. 🌹', color: '#eab308' };
  if (totalUbes <= 7) return { texto: 'Zona de riesgo. Mañana la cabeza te va a recordar esta noche. 🦫', color: '#f97316' };
  return { texto: 'Peligro de resaca histórica. Ve buscando un ibuprofeno y mucha agua. 💀', color: '#ef4444' };
};