import { Router } from "express";
import Expo from "expo-server-sdk";
import { getFirebaseAdmin } from "../lib/firebaseAdmin";

const expo = new Expo();
const pushTokens = new Map<string, string>();
const router = Router();

router.post("/register", (req, res) => {
  const { userId, token } = req.body;
  if (typeof userId === "string" && typeof token === "string") {
    pushTokens.set(userId, token);
  }
  return res.json({ ok: true });
});

router.post("/notify", async (req, res) => {
  const { toUserId, title, body, data, token } = req.body;
  let pushToken = toUserId ? pushTokens.get(toUserId) : token;

  if (!pushToken) {
    return res.status(404).json({ error: "No push token provided" });
  }

  try {
    // Inicijalizujemo admina SAMO JEDNOM na početku
    const admin = await getFirebaseAdmin();
    
    // SAMO slanje notifikacije - poruke se već čuvaju u /conversations/{id}/messages na frontend-u
    if (pushToken.startsWith("ExponentPushToken") || pushToken.startsWith("ExpoPushToken")) {
      // EXPO LOGIKA
      if (Expo.isExpoPushToken(pushToken)) {
        await expo.sendPushNotificationsAsync([{
          to: pushToken,
          sound: "default",
          title,
          body,
          data: data || {},
        }]);
      }
    } else {
      // FIREBASE ADMIN LOGIKA
      const message = {
        token: pushToken,
        notification: { title, body },
        data: (data || {}) as Record<string, string>,
        android: { priority: "high" as const },
      };
      await admin.messaging().send(message);
    }

    console.log("✅ Sve završeno uspešno");
    return res.json({ ok: true });

  } catch (error) {
    console.error("❌ Kritična greška:", error);
    return res.status(500).json({ error: String(error) });
  }
});

export default router;