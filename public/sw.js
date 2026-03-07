// habi.at Service Worker — handles push notifications & actions

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Push Event ──────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "habi.at",
      body: event.data.text(),
    };
  }

  const title = data.title || "habi.at";
  const options = {
    body: data.body || "Time for your habit!",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    image: data.image || undefined,
    tag: data.tag || "habit-" + Date.now(),
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      habitId: data.habitId || null,
      snoozeDuration: data.snoozeDuration || 10,
      url: data.url || "/",
    },
    actions: [
      {
        action: "done",
        title: "✅ Done",
      },
      {
        action: "snooze",
        title: `⏰ Snooze ${data.snoozeDuration || 10}m`,
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification Click ──────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const data = notification.data || {};

  notification.close();

  if (event.action === "snooze") {
    // Re-schedule notification after snooze duration
    const snoozeMs = (data.snoozeDuration || 10) * 60 * 1000;
    setTimeout(() => {
      self.registration.showNotification(notification.title, {
        body: notification.body + " (snoozed)",
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        tag: notification.tag,
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: data,
        actions: [
          { action: "done", title: "✅ Done" },
          { action: "snooze", title: `⏰ Snooze ${data.snoozeDuration || 10}m` },
        ],
      });
    }, snoozeMs);
    return;
  }

  if (event.action === "done") {
    // Tell the client to mark habit as done
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "HABIT_DONE",
            habitId: data.habitId,
          });
        });
      })
    );
    return;
  }

  // Default: open or focus the app
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return self.clients.openWindow(data.url || "/");
      })
  );
});

// ─── Notification Close ──────────────────────────────────────
self.addEventListener("notificationclose", (event) => {
  // Analytics or cleanup if needed
});

// ─── Message from client (for local scheduling) ─────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    const { delay, title, body, tag, habitId, snoozeDuration } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title || "habi.at", {
        body: body || "Time for your habit!",
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        tag: tag || "habit-local-" + Date.now(),
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: {
          habitId,
          snoozeDuration: snoozeDuration || 10,
          url: "/",
        },
        actions: [
          { action: "done", title: "✅ Done" },
          { action: "snooze", title: `⏰ Snooze ${snoozeDuration || 10}m` },
        ],
      });
    }, delay);
  }
});
