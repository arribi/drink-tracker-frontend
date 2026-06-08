/**
 * Traduce el string de tolerancia a la tasa de eliminación metabólica
 */
const obtenerTasaEliminacion = (tolerancia) => {
  if (tolerancia === 'baja') return 0.12;
  if (tolerancia === 'alta') return 0.18;
  return 0.15; // normal (por defecto)
};

export const calcularMinsPerUbe = (peso, sexo, edad = 0, altura = 0, tolerancia = 'normal') => {
  if (!peso || !sexo) return 40;

  const tasa = obtenerTasaEliminacion(tolerancia);

  if (edad > 0 && altura > 0) {
    let tbw = 0;
    if (sexo === 'H') {
      tbw = 2.447 - (0.09156 * edad) + (0.1074 * altura) + (0.3362 * peso);
    } else {
      tbw = -2.097 + (0.1069 * altura) + (0.2466 * peso);
    }

    const mins = (8 / (tbw * tasa)) * 60;
    return Math.round(mins);
  }

  const r = sexo === 'M' ? 0.55 : 0.68;
  const gramosPorHora = peso * tasa * r;
  const mins = (10 / gramosPorHora) * 60;
  return Math.round(mins);
};

export const calcularBacEst = (history, peso, sexo, minsPerUbe, edad = 0, altura = 0, tolerancia = 'normal', customAhora = null) => {
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

  const tasa = obtenerTasaEliminacion(tolerancia);

  if (edad > 0 && altura > 0) {
    let tbw = 0;
    if (sexo === 'H') {
      tbw = 2.447 - (0.09156 * edad) + (0.1074 * altura) + (0.3362 * peso);
    } else {
      tbw = -2.097 + (0.1069 * altura) + (0.2466 * peso);
    }

    const calculo = (gramosAbsorbidosTotales * 0.80 / tbw) - (tasa * horasTranscurridas);
    return Math.max(0, calculo);
  }

  const r = sexo === 'M' ? 0.55 : 0.68;
  const calculo = (gramosAbsorbidosTotales / (peso * r)) - (tasa * horasTranscurridas);
  return Math.max(0, calculo);
};

export const calcularTendenciaBac = (history, peso, sexo, minsPerUbe, edad = 0, altura = 0, tolerancia = 'normal') => {
  if (!history || history.length === 0 || !peso || !sexo) return 'estable';

  const bacActual = calcularBacEst(history, peso, sexo, minsPerUbe, edad, altura, tolerancia, Date.now());
  const bacFuturo = calcularBacEst(history, peso, sexo, minsPerUbe, edad, altura, tolerancia, Date.now() + 60000);

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