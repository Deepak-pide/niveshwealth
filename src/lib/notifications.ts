
"use client";

import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const VAPID_KEY = "BMefk-iiLGKli6ufvZaRi8nu2tEZrE_2LCRSBxqbpCoNXeR-zvfA5OgACg9GArSMyYGADAR4LuHsLvbL9CSxAFU";

export const requestNotificationPermission = async (userId: string) => {
  if (!messaging) {
    console.log("Firebase Messaging is not available.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (currentToken) {
        console.log("FCM Token:", currentToken);
        const userDocRef = doc(db, "users", userId);
        await setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
        console.log("FCM token saved to Firestore.");
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Unable to get permission to notify.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
  }
};
