self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'HomeFarm Reminder', {
      body: data.body ?? 'Time to check your garden!',
      icon: '/plant.svg',
      badge: '/plant.svg',
      tag: data.tag ?? 'garden-reminder',
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/my-garden'));
});
