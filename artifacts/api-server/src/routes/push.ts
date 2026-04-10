import { Router } from "express";
import Expo from "expo-server-sdk";
import { getFirebaseAdmin } from "../lib/firebaseAdmin";

const expo = new Expo();
const router = Router();

router.post("/register", async (req, res) => {
  const { userId, token } = req.body;
  if (typeof userId !== "string" || typeof token !== "string") {
    return res.status(400).json({ error: "userId and token are required" });
  }

  try {
    const admin = await getFirebaseAdmin();
    // Upisujemo token pod ID-em korisnika (npr. pushTokens/slobodan)
    await admin.database().ref(`pushTokens/${userId}`).set(token);
    console.log(`✅ Token registrovan za: ${userId}`);
    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Failed to save push token:", error);
    return res.status(500).json({ error: String(error) });
  }
});

router.post("/notify", async (req, res) => {
  // IZMENA: Više ne izvlačimo 'token' iz req.body jer ne želimo da mu verujemo
  const { toUserId, title, body, data } = req.body;

  if (typeof title !== "string" || typeof body !== "string") {
    return res.status(400).json({ error: "title and body are required" });
  }

  try {
    const admin = await getFirebaseAdmin();
    let pushToken: string | undefined;

    // IZMENA: UVEK tražimo token u bazi na osnovu toUserId
    if (typeof toUserId === "string" && toUserId.trim()) {
      console.log(`🔍 Tražim token u bazi za partnera: ${toUserId}`);
      const snapshot = await admin.database().ref(`pushTokens/${toUserId}`).get();
      if (snapshot.exists()) {
        pushToken = snapshot.val() as string;
      }
    }

    if (!pushToken) {
      console.log(`⚠️ Partner (${toUserId}) nema registrovan token.`);
      return res.status(404).json({ error: "No push token available for recipient" });
    }

    console.log(`🚀 Šaljem notifikaciju na token: ${pushToken.substring(0, 20)}...`);

    // Provera da li je Expo token
    if (pushToken.startsWith("ExponentPushToken") || pushToken.startsWith("ExpoPushToken")) {
      // Provera validnosti formata
      if (Expo.isExpoPushToken(pushToken)) {
        await expo.sendPushNotificationsAsync([
          {
            to: pushToken,
            sound: "default",
            title,
            body,
            data: data || {},
          },
        ]);
      }
    } else {
      // Ako je običan Firebase token (za svaki slučaj)
      const message = {
        token: pushToken,
        notification: { title, body },
        data: (data || {}) as Record<string, string>,
        android: { priority: "high" as const },
      };
      await admin.messaging().send(message);
    }

    console.log(`✅ Notifikacija uspešno poslata za: ${toUserId}`);
    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Notification error:", error);
    return res.status(500).json({ error: String(error) });
  }
});

export default router;