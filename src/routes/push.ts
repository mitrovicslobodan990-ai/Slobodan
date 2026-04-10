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
    await admin.database().ref(`pushTokens/${userId}`).set(token);
    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Failed to save push token:", error);
    return res.status(500).json({ error: String(error) });
  }
});

router.post("/notify", async (req, res) => {
  const { toUserId, title, body, data, token } = req.body;

  if (typeof title !== "string" || typeof body !== "string") {
    return res.status(400).json({ error: "title and body are required" });
  }

  try {
    const admin = await getFirebaseAdmin();
    let pushToken: string | undefined;

    if (typeof token === "string" && token.trim()) {
      pushToken = token.trim();
    } else if (typeof toUserId === "string" && toUserId.trim()) {
      const snapshot = await admin.database().ref(`pushTokens/${toUserId}`).get();
      if (snapshot.exists()) {
        pushToken = snapshot.val() as string;
      }
    }

    if (!pushToken) {
      return res.status(404).json({ error: "No push token available for recipient" });
    }

    if (pushToken.startsWith("ExponentPushToken") || pushToken.startsWith("ExpoPushToken")) {
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
      const message = {
        token: pushToken,
        notification: { title, body },
        data: (data || {}) as Record<string, string>,
        android: { priority: "high" as const },
      };
      await admin.messaging().send(message);
    }

    console.log("✅ Notification delivered successfully");
    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Notification error:", error);
    return res.status(500).json({ error: String(error) });
  }
});

export default router;