// Escuchar el evento 'push' que envía nuestro backend
self.addEventListener('push', (event) => {
  let data = { title: 'Drink Tracker', body: '¡No olvides beber agua! 💧' };

  // Si el backend envió un texto/JSON, lo parseamos
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  // Opciones visuales de la notificación
  const options = {
    body: data.body,
    icon: '/icon-192x192.png', // Si tienes un icono en public, pon su ruta aquí
    badge: '/icon-192x192.png', // Icono pequeño para la barra de estado en Android
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  // Mostrar la notificación en la pantalla del dispositivo
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Registrar qué pasa si el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Abre la app o la enfoca si ya está abierta
  event.waitUntil(
    clients.openWindow('/')
  );
});