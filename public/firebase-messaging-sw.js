
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js");

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
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
