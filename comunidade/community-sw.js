self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }
  const title = typeof payload.title === 'string' ? payload.title : 'Comunidade KynosRecompVI';
  const options = {
    body: typeof payload.body === 'string' ? payload.body : 'Você tem uma nova atualização da comunidade.',
    icon: '../assets/icon.svg',
    badge: '../assets/icon.svg',
    data: { url: typeof payload.url === 'string' ? payload.url : './index.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destination = new URL(event.notification.data && event.notification.data.url || './index.html', self.location.href);
  if (destination.origin !== self.location.origin) return;
  event.waitUntil(self.clients.openWindow(destination.href));
});
