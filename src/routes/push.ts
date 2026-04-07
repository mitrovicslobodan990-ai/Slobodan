import { Router } from "express";
import Expo from "expo-server-sdk";
import { getFirebaseAdmin } from "../lib/firebaseAdmin";

const expo = new Expo();
const pushTokens = new Map<string, string>();

const router = Router();

router.post("/register", (req, res) => {
  const { userId, token } = req.body;

  if (typeof userId !== "string" || typeof token !== "string") {
    return res.status(400).json({ error: "userId and token are required" });
  }

  pushTokens.set(userId, token);
  return res.json({ ok: true });
});

router.post("/notify", async (req, res) => {
  const { toUserId, title, body, data, token } = req.body;

  let pushToken: string | undefined;

  if (typeof toUserId === "string") {
    pushToken = pushTokens.get(toUserId);
  }

  if (!pushToken && typeof token === "string") {
    pushToken = token;
  }

  if (!pushToken) {
    return res.status(404).json({
      error: "No push token provided or registered for user",
      registeredUsers: Array.from(pushTokens.keys()),
    });
  }

  if (typeof title !== "string" || typeof body !== "string") {
    return res.status(400).json({ error: "title and body are required" });
  }

  try {
    console.log("🚀 Sending push notification...");

    // 1. Deo za EXPO notifikacije
    if (
      pushToken.startsWith("ExponentPushToken") ||
      pushToken.startsWith("ExpoPushToken")
    ) {
      if (!Expo.isExpoPushToken(pushToken)) {
        return res.status(400).json({
          error: "Invalid Expo push token",
          token: pushToken,
        });
      }

      const messages = [
        {
          to: pushToken,
          sound: "default",
          title,
          body,
          data: data || {},
        },
      ];

      const ticketChunk = await expo.sendPushNotificationsAsync(messages);
      
      // DODATAK: Upis u bazu za Expo korisnike
      const admin = await getFirebaseAdmin();
      await admin.database().ref('messages').push({
        title,
        body,
        senderId: data?.senderId || 'unknown',
        timestamp: Date.now(),
      });

      console.log("✅ Expo notification result & DB saved");
      return res.json({ ok: true, ticketChunk });
    }

    // 2. Deo za FIREBASE Admin notifikacije
    const admin = await getFirebaseAdmin();
    const message = {
      token: pushToken,
      notification: {
        title,
        body,
      },
      data: (data || {}) as Record<string, string>,
      android: {
        priority: "high" as const,
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
      },
    };

    const messageId = await admin.messaging().send(message);
    console.log("✅ Firebase Admin notification sent, messageId:", messageId);

    // --- KLJUČNI DODATAK ZA TVOJU BAZU ---
    try {
      const db = admin.database();
      await db.ref('messages').push({
        title: title,
        body: body,
        senderId: data?.senderId || 'unknown',
        timestamp: Date.now()
      });
      console.log("✅ Poruka je uspešno upisana u Realtime Database!");
    } catch (dbError) {
      console.error("❌ Greška pri upisu u bazu:", dbError);
    }
    // --- KRAJ DODATKA ---

    return res.json({ ok: true, messageId });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return res.status(500).json({
      error: "Failed to send push notification",
      details: String(error),
    });
  }
});

export default router;