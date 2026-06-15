/**
 * Traduce el string de tolerancia a la tasa de eliminación metabólica
 */
const obtenerTasaEliminacion = (tolerancia) => {
  if (tolerancia === 'baja') return 0.12;
  if (tolerancia === 'alta') return 0.18;
  return 0.15; // normal (por defecto)
};

const TIEMPO_ABSORCION_MS = 45 * 60 * 1000;
const MS_POR_HORA = 60 * 60 * 1000;

const calcularFactorDistribucion = (peso, sexo, edad = 0, altura = 0) => {
  if (edad > 0 && altura > 0) {
    const tbw = sexo === 'H'
      ? 2.447 - (0.09156 * edad) + (0.1074 * altura) + (0.3362 * peso)
      : -2.097 + (0.1069 * altura) + (0.2466 * peso);

    return 0.80 / tbw;
  }

  const r = sexo === 'M' ? 0.55 : 0.68;
  return 1 / (peso * r);
};

export const calcularMinsPerUbe = (peso, sexo, edad = 0, altura = 0, tolerancia = 'normal') => {
  if (!peso || !sexo) return 40;

  const tasa = obtenerTasaEliminacion(tolerancia);

  if (edad > 0 && altura > 0) {
    const tbw = sexo === 'H'
      ? 2.447 - (0.09156 * edad) + (0.1074 * altura) + (0.3362 * peso)
      : -2.097 + (0.1069 * altura) + (0.2466 * peso);

    const mins = (8 / (tbw * tasa)) * 60;
    return Math.round(mins);
  }

  const r = sexo === 'M' ? 0.55 : 0.68;
  const gramosPorHora = peso * tasa * r;
  const mins = (10 / gramosPorHora) * 60;
  return Math.round(mins);
};

export const calcularBacEst = (history, peso, sexo, edad = 0, altura = 0, tolerancia = 'normal', customAhora = null) => {
  if (!history || history.length === 0 || !peso || !sexo) return 0;

  const ahora = customAhora ?? Date.now();
  const tasa = obtenerTasaEliminacion(tolerancia);
  const factorDistribucion = calcularFactorDistribucion(peso, sexo, edad, altura);
  const bebidasPasadas = history.filter(drink => drink.id <= ahora);

  if (bebidasPasadas.length === 0) {
    return 0;
  }

  const puntosDeCambio = new Set([Math.min(...bebidasPasadas.map(drink => drink.id)), ahora]);

  bebidasPasadas.forEach((drink) => {
    puntosDeCambio.add(drink.id);
    puntosDeCambio.add(Math.min(drink.id + TIEMPO_ABSORCION_MS, ahora));
  });

  const tiempos = [...puntosDeCambio].sort((a, b) => a - b);
  let bac = 0;

  for (let i = 0; i < tiempos.length - 1; i += 1) {
    const inicio = tiempos[i];
    const fin = tiempos[i + 1];
    const duracionMs = fin - inicio;

    if (duracionMs <= 0) continue;

    const gramosAbsorbidosEnTramo = bebidasPasadas.reduce((total, drink) => {
      const inicioAbsorcion = Math.max(inicio, drink.id);
      const finAbsorcion = Math.min(fin, drink.id + TIEMPO_ABSORCION_MS);

      if (finAbsorcion <= inicioAbsorcion) {
        return total;
      }

      const gramosBebida = (drink.ubes || 1) * 10;
      const fraccionAbsorbida = (finAbsorcion - inicioAbsorcion) / TIEMPO_ABSORCION_MS;
      return total + (gramosBebida * fraccionAbsorbida);
    }, 0);

    const bacAbsorbido = gramosAbsorbidosEnTramo * factorDistribucion;
    const bacEliminado = tasa * (duracionMs / MS_POR_HORA);
    bac = Math.max(0, bac + bacAbsorbido - bacEliminado);
  }

  return bac;
};

export const calcularTendenciaBac = (history, peso, sexo, edad = 0, altura = 0, tolerancia = 'normal') => {
  if (!history || history.length === 0 || !peso || !sexo) return 'estable';

  const bacActual = calcularBacEst(history, peso, sexo, edad, altura, tolerancia, Date.now());
  const bacFuturo = calcularBacEst(history, peso, sexo, edad, altura, tolerancia, Date.now() + 60000);

  if (bacActual === 0 && bacFuturo === 0) return 'estable';
  if (bacFuturo > bacActual) return 'subiendo';
  if (bacFuturo < bacActual) return 'bajando';

  return 'estable';
};

export const obtenerDiagnosticoResaca = (
  history,
  totalUbes,
  peso,
  sexo,
  edad = 0,
  altura = 0,
  tolerancia = 'normal'
) => {
  if (totalUbes === 0) return { texto: '¡Cuerpo limpio! Disfruta del día. ☀️', color: '#22c55e' };

  // 1. Calcular BAC actual (indicador principal de resaca)
  const bacActual = calcularBacEst(history, peso, sexo, edad, altura, tolerancia);

  // 2. Calcular duración del consumo (factor secundario)
  let duracionConsumoHoras = 1;
  if (history && history.length > 1) {
    const primeraDrink = Math.min(...history.map(d => d.id));
    const ultimaDrink = Math.max(...history.map(d => d.id));
    duracionConsumoHoras = Math.max(1, (ultimaDrink - primeraDrink) / (1000 * 60 * 60));
  }

  // 3. Calcular ritmo de consumo (UBEs por hora)
  const ritmoConsumo = totalUbes / duracionConsumoHoras;

  // 4. Modificador por duración prolongada (desgaste físico)
  let factorDuracion = 1;
  if (duracionConsumoHoras > 6) factorDuracion = 1.3;
  else if (duracionConsumoHoras > 4) factorDuracion = 1.15;

  // 5. Modificador por ritmo muy acelerado
  let factorRitmo = 1;
  if (ritmoConsumo > 3) factorRitmo = 1.25;
  else if (ritmoConsumo > 1.5) factorRitmo = 1.1;

  // 6. Ajuste por BAC: el BAC actual es el mejor predictor de resaca
  // Cada 0.01 de BAC equivale aproximadamente a un factor de riesgo
  const indiceRiesgo = bacActual * 100 * factorDuracion * factorRitmo;

  if (indiceRiesgo < 2) {
    return { texto: '¡Cuerpo limpio! Disfruta del día. ☀️', color: '#22c55e' };
  }
  if (indiceRiesgo < 4) {
    return { texto: 'Consumo moderado. Mañana estarás como una rosa si bebes agua. 🌹', color: '#eab308' };
  }
  if (indiceRiesgo < 7) {
    return { texto: 'Zona de riesgo. Mañana la cabeza te va a recordar esta noche. 🦫', color: '#f97316' };
  }
  if (indiceRiesgo < 11) {
    return { texto: 'Riesgo elevado de resaca. Prepárate: ibuprofeno y mucha agua. 🤕', color: '#ea580c' };
  }
  return { texto: 'Peligro de resaca histórica. Ve buscando un ibuprofeno y mucha agua. 💀', color: '#ef4444' };
};
