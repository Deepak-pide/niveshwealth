
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

      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "Balance Update",
          body: `Your account has been credited with ₹${amount.toLocaleString(
            "en-IN"
          )}`,
          icon: "/logo.svg",
          click_action: "https://niveshpro.web.app/my-balance",
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
