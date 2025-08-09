
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

export const sendCreditNotification = functions.firestore
  .document("balanceHistory/{docId}")
  .onCreate(async (snapshot, context) => {
    const transaction = snapshot.data();

    if (transaction.type !== "Credit") {
      functions.logger.log("Not a credit transaction, skipping notification.");
      return null;
    }

    const userId = transaction.userId;
    const amount = transaction.amount;
    const description = transaction.description;

    if (!userId) {
      functions.logger.error("Transaction document is missing userId.");
      return null;
    }

    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        functions.logger.error("User document not found for userId:", userId);
        return null;
      }

      const fcmToken = userDoc.data()?.fcmToken;
      if (!fcmToken) {
        functions.logger.log("User does not have an FCM token, skipping.");
        return null;
      }

      let notificationBody = `Your account has been credited with ₹${amount.toLocaleString("en-IN")}`;
      if (description.includes("Matured")) {
        notificationBody = `Your FD has matured! ₹${amount.toLocaleString("en-IN")} has been credited to your balance.`;
      } else if (description.includes("Early withdrawal")) {
        notificationBody = `Your FD withdrawal is complete. ₹${amount.toLocaleString("en-IN")} has been credited to your balance.`;
      } else if (description.includes("Added to wallet")) {
        notificationBody = `₹${amount.toLocaleString("en-IN")} has been successfully added to your wallet.`;
      }

      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "Balance Update",
          body: notificationBody,
          icon: "/logo.svg",
          click_action: "https://niveshpro.web.app/my-balance",
          sound: "approved_notify.wav",
          tag: `credit-${userId}`,
        },
      };

      functions.logger.log(`Sending notification to token: ${fcmToken}`);
      await fcm.sendToDevice(fcmToken, payload);
      functions.logger.log("Successfully sent message.");

      return { success: true };
    } catch (error) {
      functions.logger.error("Error sending notification:", error);
      return { success: false, error: error };
    }
  });


export const sendFdActiveNotification = functions.firestore
  .document("investments/{investmentId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (beforeData.status === "Active" || afterData.status !== "Active") {
      functions.logger.log("No status change to Active, skipping.");
      return null;
    }

    const userId = afterData.userId;

    if (!userId) {
      functions.logger.error("Investment document is missing userId.");
      return null;
    }

    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        functions.logger.error("User document not found for userId:", userId);
        return null;
      }

      const fcmToken = userDoc.data()?.fcmToken;
      if (!fcmToken) {
        functions.logger.log("User does not have an FCM token, skipping.");
        return null;
      }

      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "Investment Activated",
          body: `Your investment of ₹${afterData.amount.toLocaleString("en-IN")} is now active!`,
          icon: "/logo.svg",
          click_action: "https://niveshpro.web.app/investments",
          sound: "admin_approval.mp3",
          tag: `fd-active-${afterData.id}`,
        },
      };

      functions.logger.log(`Sending FD Active notification to token: ${fcmToken}`);
      await fcm.sendToDevice(fcmToken, payload);
      functions.logger.log("Successfully sent FD Active message.");

      return { success: true };
    } catch (error) {
      functions.logger.error("Error sending FD Active notification:", error);
      return { success: false, error: error };
    }
  });
