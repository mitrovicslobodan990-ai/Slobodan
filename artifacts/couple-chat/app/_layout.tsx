// Pronađi funkciju notifyPartner i zameni je ovom:
const notifyPartner = useCallback(async (title: string, body: string) => {
  try {
    console.log("📤 SENDING NOTIFICATION to partner:", partner.id);
    const API_BASE_URL = "https://couple-chat-api.onrender.com"; 

    // IZMENA: Payload više ne sadrži "token: expoPushToken" 
    // kako server ne bi slao notifikaciju pošiljaocu.
    const payload: Record<string, unknown> = {
      toUserId: partner.id,
      title,
      body,
    };

    const response = await fetch(`${API_BASE_URL}/api/push/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log("📬 Notification response:", response.status);
  } catch (error) {
    console.error("❌ Failed to send push notification:", error);
  }
}, [partner.id]); // Uklonjen expoPushToken iz zavisnosti