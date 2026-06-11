self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  if (!e.data) return;
  let data;
  try { data = e.data.json(); } catch { data = { title: "Najahi", body: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(data.title || "Najahi", {
      body:    data.body || data.message || "",
      icon:    "/najahi_logo.png",
      badge:   "/najahi_logo.png",
      tag:     data.tag || "najahi",
      data:    { url: data.link || "/app/dashboard" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/app/dashboard";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
