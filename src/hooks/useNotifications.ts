import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true);
      setPermission(Notification.permission);
      // Register service worker
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const scheduleWateringReminder = (plantName: string, minutesFromNow = 0) => {
    if (permission !== 'granted') return;
    if (minutesFromNow === 0) {
      // Immediate notification
      new Notification(`💧 Water your ${plantName}!`, {
        body: `${plantName} needs watering today. Don't forget!`,
        icon: '/plant.svg',
        tag: `water-${plantName}`,
      });
    } else {
      // Delayed via setTimeout (works while tab is open)
      setTimeout(() => {
        new Notification(`💧 Water your ${plantName}!`, {
          body: `${plantName} needs watering. Time to check your garden!`,
          icon: '/plant.svg',
          tag: `water-${plantName}`,
        });
      }, minutesFromNow * 60 * 1000);
    }
  };

  const notifyHarvest = (plantName: string) => {
    if (permission !== 'granted') return;
    new Notification(`🌾 ${plantName} is ready!`, {
      body: `Your ${plantName} is ready to harvest. Head to your garden!`,
      icon: '/plant.svg',
      tag: `harvest-${plantName}`,
    });
  };

  return { permission, supported, requestPermission, scheduleWateringReminder, notifyHarvest };
}
