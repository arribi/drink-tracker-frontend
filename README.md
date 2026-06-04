
# 🍺 Cero resaca - Asistente metabólico de fiesta 🍹

¡Tu asistente de bolsillo definitivo para noches de fiesta con rigor científico! Esta aplicación web progresiva (PWA) permite a los usuarios registrar sus consumiciones en tiempo real, calculando de manera exacta el tiempo que necesita el hígado para procesar el alcohol basándose en el estándar de **Unidades de Bebida Estándar (UBEs)**.

Además, cuenta con un sistema inteligente de alertas de hidratación en segundo plano y un diagnóstico de resaca personalizado al finalizar la noche.

Este repositorio es la interfaz de usuario de **Cero Resaca** (frontend). Puedes acceder al backend de la app en el siguiente repositorio: [https://github.com/arribi/drink-tracker-backend](https://github.com/arribi/drink-tracker-backend)

---

## 🚀 Características principales de la app

- **Contador metabólico científico:** Cada copa suma tiempo real de procesamiento de forma acumulativa basándose en la fórmula médica de 1 UBE = 1 Hora de procesamiento.
- **Diagnóstico matutino:** Al terminar la fiesta, la app analiza las UBEs totales y genera un veredicto clínico sobre el nivel de resaca esperado (Cero, Moderada o Brutal).
- **Recordatorios de hidratación:** Tareas programadas en el servidor (`cron jobs`) que envían notificaciones push automáticas cada cierto tiempo (configurable) para recordar al usuario que beba agua.
- **Experiencia PWA completa:** Totalmente instalable en iOS (Safari) y Android (Chrome), funcionando a pantalla completa y recibiendo notificaciones incluso con la app cerrada.
- **Estado persistente:** El progreso de la noche no se pierde si cierras la pestaña del navegador o reinicias el teléfono.

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
│   │   │   ├── Dashboard.jsx # Panel principal con la rejilla de bebidas y contador
│   │   │   └── Settings.jsx  # Configuración de notificaciones de agua
│   │   └── ...
│   ├── package.json
    ├── README.md
│   └── ...
```

---

## ⚙️ Configuración Local

Accede a la carpeta del frontend e instala las dependencias:

```bash
cd drink-tracker-frontend/
npm install
```

Crea un archivo `.env` en la raíz del frontend para enlazarlo con tu servidor local:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Inicia la aplicación:

```bash
npm run dev
```

---

## 🌐 Despliegue (producción)

El proyecto está diseñado para desplegarse de manera independiente garantizando coste cero y máxima eficiencia:

- **Vercel / Netlify:** Despliega la aplicación estática de Vite de forma directa. No olvides añadir la variable de entorno `VITE_BACKEND_URL` apuntando a la URL pública de tu servidor en Render antes de compilar.

---

> **Nota:** Este proyecto ha sido desarrollado con fines recreativos y educativos basados en pautas de salud estandarizadas. Consume con moderación y responsabilidad.
