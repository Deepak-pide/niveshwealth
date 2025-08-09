// This file is intentionally left empty.
// The PWA plugin will automatically generate the service worker.
// We need this file to exist to handle background notifications for FCM.

// Import and configure the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBGPL9oIZ1o0hQEYlC-Y_1vL6Hx5YtFlqA",
    authDomain: "niveshpro.firebaseapp.com",
    projectId: "niveshpro",
    storageBucket: "niveshpro.appspot.com",
    messagingSenderId: "801180386301",
    appId: "1:801180386301:web:fe11b99f1eae9b6a9d4f94"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/logo.svg",
    sound: payload.notification.sound,
    tag: payload.notification.tag,
    data: {
      click_action: payload.notification.click_action,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.click_action || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // Check if a window is already open.
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new one.
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
