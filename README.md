
# 🍺 Cero resaca - Asistente metabólico de fiesta 🍹

¡Tu asistente de bolsillo definitivo para noches (o tardes) de fiesta con rigor científico! Esta aplicación web progresiva (PWA) permite a los usuarios registrar sus consumiciones en tiempo real, calculando de manera exacta el tiempo que necesita el hígado para procesar el alcohol basándose en el estándar de **Unidades de Bebida Estándar (UBEs)**.

Además, cuenta con un sistema inteligente de alertas de hidratación en segundo plano y un diagnóstico de resaca personalizado al finalizar la fiesta.

Este repositorio es la interfaz de usuario de **Cero Resaca** (frontend). Puedes acceder al backend de la app en el siguiente repositorio: [https://github.com/arribi/drink-tracker-backend](https://github.com/arribi/drink-tracker-backend)

---

## 🚀 Características principales de la app

- **Contador metabólico científico:** Cada copa suma tiempo real de procesamiento de forma acumulativa basándose en la fórmula médica de 1 UBE = 1 Hora de procesamiento.
- **Cálculo avanzado de BAC:** Estimación dinámica de la tasa de alcoholemia (g/L en sangre y mg/L en aire) con fórmulas clínicas mejoradas (Watson con edad/altura y Widmark estándar).
- **Tendencia de alcoholemia:** Seguimiento en tiempo real de si tu BAC está subiendo o bajando para tomar decisiones informadas.
- **Avisos legales dinámicos:** La app te alerta automáticamente si superas los límites legales de conducción (0.25 mg/L = multa administrativa, 0.60 mg/L = delito penal).
- **Configuración personalizada:** Ajusta tu peso, sexo, edad, altura y tolerancia para cálculos más precisos y personalizados.
- **Diagnóstico matutino:** Al terminar la fiesta, la app analiza las UBEs totales y genera un veredicto clínico sobre el nivel de resaca esperado (Cero, Moderada o Brutal).
- **Historial de bebidas:** Registra cada consumición con marca de tiempo y permite deshacer la última bebida.
- **Recordatorios de hidratación:** Tareas programadas en el servidor (`cron jobs`) que envían notificaciones push automáticas cada cierto tiempo (configurable) para recordar al usuario que beba agua.
- **Experiencia PWA completa:** Totalmente instalable en iOS (Safari) y Android (Chrome), funcionando a pantalla completa y recibiendo notificaciones incluso con la app cerrada.
- **Estado persistente:** El progreso de la fiesta no se pierde si cierras la pestaña del navegador o reinicias el teléfono.
- **Interfaz visual intuitiva:** Temporizador circular con animaciones, grid de bebidas categorizado (suave, caña, fuerte, lata, combinado) y tarjetas informativas con colores dinámicos.
- **Resumen de sesión:** Al finalizar, obtienes un resumen completo con total de UBEs, diagnóstico de resaca e historial de bebidas.

---

## 🛠️ Stack tecnológico

### Frontend
- **React + Vite** (Interfaz ágil y reactiva)
- **Service Workers & Push API** (Gestión de notificaciones nativas en el dispositivo)
- **LocalStorage** (Persistencia de datos local rápida)

### Backend
- **Node.js + Express** (Servidor API REST)
- **MongoDB + Mongoose** (Almacenamiento seguro de dispositivos y preferencias de usuario)
- **Web-Push** (Cifrado y envío de notificaciones push a los servidores de Google/Apple)
- **Node-Cron** (Automatización del control de hidratación cada 15 minutos)

---

## 📂 Estructura del proyecto frontend

```text
├── drink-tracker-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx          # Panel principal con temporizador y grid de bebidas
│   │   │   ├── TimerCircle.jsx        # Círculo animado con contador de tiempo
│   │   │   ├── DrinkGrid.jsx          # Botones de bebidas categorizadas
│   │   │   ├── BacCard.jsx            # Tarjeta de tasa de alcoholemia estimada
│   │   │   ├── HistoryList.jsx        # Historial de bebidas con deshacer
│   │   │   ├── PartySummary.jsx       # Resumen final de la sesión
│   │   │   ├── Settings.jsx           # Configuración de usuario y notificaciones
│   │   │   └── Dashboard.module.css   # Estilos componentizados
│   │   ├── hooks/
│   │   │   └── useFiesta.js           # Hook central con lógica de estado
│   │   ├── utils/
│   │   │   └── alcoholMath.js         # Cálculos científicos (BAC, UBEs, diagnóstico)
│   │   ├── App.jsx                    # Componente raíz con navegación
│   │   ├── main.jsx                   # Punto de entrada
│   │   ├── index.css                  # Estilos globales
│   │   └── App.css
│   ├── public/
│   │   └── sw.js                      # Service Worker para PWA
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   └── ...
```

---

## ⚙️ Configuración Local

Accede a la carpeta del frontend e instala las dependencias:

```bash
cd drink-tracker-frontend/
npm install
```

Crea un archivo `.env` en la raíz del frontend para enlazarlo con tu servidor local y configurar las notificaciones push:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=tu_clave_publica_vapid_aqui
```

**Nota sobre VAPID:** La clave pública VAPID es necesaria para las notificaciones push. Generalmente te la proporciona el servidor backend (junto con la clave privada que usará Node.js).

Inicia la aplicación:

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## 🌐 Despliegue (producción)

El proyecto está diseñado para desplegarse de manera independiente garantizando coste cero y máxima eficiencia:

### Vercel / Netlify

1. **Conecta tu repositorio** a Vercel o Netlify
2. **Configura las variables de entorno:**
   - `VITE_BACKEND_URL`: URL pública de tu servidor backend (ej: `https://drink-tracker-api.render.com`)
   - `VITE_VAPID_PUBLIC_KEY`: Clave pública VAPID para notificaciones push

3. **Deploy:** La aplicación Vite se compilará automáticamente a una carpeta `dist/` lista para producción

### Build manual para producción

```bash
npm run build
npm run preview
```

El directorio `dist/` contiene la app lista para servir desde cualquier CDN o servidor estático.

---

## 🧮 ¿Cómo funciona el cálculo de BAC?

La app utiliza **fórmulas científicas estándar** para estimar la tasa de alcoholemia:

- **Widmark (estándar):** Basada en peso y sexo
- **Watson (mejorada):** Considera también edad, altura y tolerancia para mayor precisión
- **Tiempo de absorción:** Se asume una absorción gradual en los primeros 45 minutos
- **Metabolización:** El hígado procesa aproximadamente 1 UBE por hora
- **Tendencia:** Muestra si tu BAC está subiendo (absorbiendo) o bajando (metabolizándose)

La conversión entre unidades:
- **g/L en sangre:** Medida médica estándar
- **mg/L en aire aspirado:** Límite legal para conducir (España: 0.25 mg/L en vías públicas, 0.0 en autopistas)

**⚠️ Disclaimer:** Este cálculo es una *estimación* basada en promedios. Factores como medicamentos, comida, o metabolismo individual pueden afectar significativamente.

---

## 📱 Características PWA

La app está totalmente optimizada como Progressive Web App:

✅ **Instalable:** Añade a pantalla de inicio en iOS y Android  
✅ **Funciona offline:** Los datos se guardan en tu dispositivo  
✅ **Notificaciones:** Recibe recordatorios de hidratación incluso con la app cerrada  
✅ **Pantalla completa:** Experiencia nativa sin barra de navegador  
✅ **Sincronización:** Los datos persisten entre sesiones  

### Instalación

**Android (Chrome):**
1. Abre la app en Chrome
2. Toca el menú → "Instalar app"

**iOS (Safari):**
1. Abre la app en Safari
2. Toca Compartir → "Añadir a pantalla de inicio"

---

## 📋 Requisitos del navegador

- **Chrome/Edge 90+** (Android e iOS con Safari)
- **Service Workers habilitados**
- **localStorage disponible**
- **Notificaciones push** (opcional pero recomendado)

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| No aparecen notificaciones | Verifica que has dado permiso de notificaciones y que el backend está activo |
| BAC no se calcula | Asegúrate de configurar tu peso y sexo en Ajustes |
| Service Worker no registra | Comprueba que tu navegador soporta Service Workers |
| La app no persiste datos | Verifica que localStorage está habilitado en tu navegador |

---

> **Nota Legal:** Este proyecto ha sido desarrollado con fines recreativos y educativos basados en pautas de salud estandarizadas. Los cálculos de BAC son estimaciones y no reemplazan análisis profesionales. Consume alcohol con moderación y responsabilidad. **Nunca conduzcas bajo los efectos del alcohol.**
