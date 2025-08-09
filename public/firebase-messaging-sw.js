
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

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
    icon: payload.notification.icon,
    sound: payload.notification.sound,
    tag: payload.notification.tag,
    data: {
        click_action: payload.notification.click_action
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const clickAction = event.notification.data.click_action;
  if (clickAction) {
    event.waitUntil(
      clients.openWindow(clickAction)
    );
  }
});
