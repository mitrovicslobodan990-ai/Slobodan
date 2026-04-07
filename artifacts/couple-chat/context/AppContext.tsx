import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  estimateBase64Size,
  IMAGE_COMPRESSION_SETTINGS,
} from "@/lib/imageCompression";
import { initializeFirebase, updateUserProfile, listenToUserProfile } from "@/lib/firebase";

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  mediaBase64?: string;
  mediaType?: "image" | "gif" | "video";
  gifUrl?: string;
  timestamp: number;
  type: "text" | "media" | "gif" | "poke";
}

export interface UserProfile {
  id: string;
  name: string;
  avatarBase64?: string;
  mood: string;
}

export interface SharedNote {
  id: string;
  content: string;
  lastEditedBy: string;
  lastEditedAt: number;
}

interface AppContextValue {
  currentUser: UserProfile;
  partner: UserProfile;
  messages: Message[];
  sharedNote: SharedNote;
  updateMood: (mood: string) => void;
  updateAvatar: (base64: string) => void;
  sendMessage: (msg: Omit<Message, "id" | "timestamp" | "senderId">) => void;
  sendPoke: () => void;
  updateSharedNote: (content: string) => void;
  clearMessages: () => void;
  giphyApiKey: string;
  firebaseConfig: Record<string, string>;
  updateFirebaseConfig: (config: Record<string, string>) => void;
  updateGiphyKey: (key: string) => void;
  setUserRole: (role: 'slobodan' | 'aleksandra') => void;
  expoPushToken: string | null;
  registerPushToken: (token: string) => Promise<void>;
  notifyPartner: (title: string, body: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEMO_MESSAGES: Message[] = [
  {
    id: "demo1",
    senderId: "partner",
    text: "Hey ljubavi! 💕",
    timestamp: Date.now() - 300000,
    type: "text",
  },
  {
    id: "demo2",
    senderId: "me",
    text: "Hej! Jedva čekam da vidim tvoj novi smajli status 😊",
    timestamp: Date.now() - 240000,
    type: "text",
  },
  {
    id: "demo3",
    senderId: "partner",
    text: "Klikni na smajli u headeru i vidi moje raspoloženje!",
    timestamp: Date.now() - 180000,
    type: "text",
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: "slobodan",
    name: "Slobodan",
    mood: "😊",
    avatarBase64: undefined,
  });

  const [partner, setPartner] = useState<UserProfile>({
    id: "aleksandra",
    name: "Aleksandra",
    mood: "❤️",
    avatarBase64: undefined,
  });

  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [sharedNote, setSharedNote] = useState<SharedNote>({
    id: "note1",
    content: "Naše zajedničke bilješke... ✨\n\nOvdje možete oboje pisati!",
    lastEditedBy: "me",
    lastEditedAt: Date.now(),
  });
  const [giphyApiKey, setGiphyApiKey] = useState("");
  const [firebaseConfig, setFirebaseConfig] = useState<Record<string, string>>(
    {}
  );
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const loadPersistedData = async () => {
    try {
      const [
        storedUser,
        storedPartner,
        storedMessages,
        storedNote,
        storedGiphy,
        storedFirebase,
        storedPushToken,
      ] = await Promise.all([
        AsyncStorage.getItem("currentUser"),
        AsyncStorage.getItem("partner"),
        AsyncStorage.getItem("messages"),
        AsyncStorage.getItem("sharedNote"),
        AsyncStorage.getItem("giphyApiKey"),
        AsyncStorage.getItem("firebaseConfig"),
        AsyncStorage.getItem("expoPushToken"),
      ]);

      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      if (storedPartner) setPartner(JSON.parse(storedPartner));
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedNote) setSharedNote(JSON.parse(storedNote));
      if (storedGiphy) setGiphyApiKey(storedGiphy);
      if (storedFirebase) setFirebaseConfig(JSON.parse(storedFirebase));
      if (storedPushToken) setExpoPushToken(storedPushToken);
    } catch (e) {
      console.warn("Error loading data:", e);
    }
  };

  const registerPushToken = useCallback(async (token: string) => {
    try {
      console.log("🔑 REGISTERING PUSH TOKEN:", token);
      setExpoPushToken(token);
      await AsyncStorage.setItem("expoPushToken", token);
      // Register with our API server
      const API_BASE_URL = "https://couple-chat-api.onrender.com"; // Production API URL
      console.log("📡 Sending token to API server:", `${API_BASE_URL}/api/push/register`);
      const response = await fetch(`${API_BASE_URL}/api/push/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          token,
        }),
      });
      console.log("✅ Token registration response:", response.status, await response.text());
    } catch (error) {
      console.error("❌ Failed to register push token:", error);
    }
  }, [currentUser.id]);

  const notifyPartner = useCallback(async (title: string, body: string) => {
    try {
      console.log("📤 SENDING NOTIFICATION to partner:", partner.id);
      const API_BASE_URL = "https://couple-chat-api.onrender.com"; // Production API URL
      console.log("🌐 API URL:", `${API_BASE_URL}/api/push/notify`);
      const payload: Record<string, unknown> = {
        toUserId: partner.id,
        title,
        body,
      };
      if (expoPushToken) {
        payload.token = expoPushToken;
      }
      const response = await fetch(`${API_BASE_URL}/api/push/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("📬 Notification response:", response.status, await response.text());
    } catch (error) {
      console.error("❌ Failed to send push notification:", error);
    }
  }, [partner.id, expoPushToken]);

  useEffect(() => {
    loadPersistedData();
  }, []);

  // Initialize Firebase when config is set
  useEffect(() => {
    if (firebaseConfig && Object.keys(firebaseConfig).length > 0) {
      try {
        console.log("🔥 Initializing Firebase...");
        initializeFirebase(firebaseConfig);
        
        // Setup listener for current user's profile changes from Firebase
        const unsubscribeCurrent = listenToUserProfile(
          currentUser.id,
          (profile) => {
            console.log("🔄 Current user profile updated from Firebase:", profile);
            if (profile) {
              setCurrentUser(prev => ({ ...prev, ...profile }));
            }
          }
        );

        // Setup listener for partner's profile changes from Firebase
        const unsubscribePartner = listenToUserProfile(
          partner.id,
          (profile) => {
            console.log("🔄 Partner profile updated from Firebase:", profile);
            if (profile) {
              setPartner(prev => ({ ...prev, ...profile }));
            }
          }
        );

        return () => {
          unsubscribeCurrent?.();
          unsubscribePartner?.();
        };
      } catch (error) {
        console.error("❌ Failed to initialize Firebase:", error);
      }
    }
  }, [firebaseConfig, currentUser.id, partner.id]);

  useEffect(() => {
    if (expoPushToken && currentUser.id) {
      registerPushToken(expoPushToken);
    }
  }, [expoPushToken, currentUser.id, registerPushToken]);

  const updateMood = useCallback(
    async (mood: string) => {
      const updated = { ...currentUser, mood };
      setCurrentUser(updated);
      await AsyncStorage.setItem("currentUser", JSON.stringify(updated));
      
      // Sync to Firebase if configured
      if (firebaseConfig && Object.keys(firebaseConfig).length > 0) {
        try {
          await updateUserProfile(currentUser.id, { mood });
          console.log("🔥 Mood synced to Firebase:", mood);
        } catch (error) {
          console.warn("⚠️ Failed to sync mood to Firebase:", error);
        }
      }
    },
    [currentUser, firebaseConfig]
  );

  const updateAvatar = useCallback(
    async (base64: string) => {
      try {
        const sizeKB = estimateBase64Size(base64);
        if (sizeKB > IMAGE_COMPRESSION_SETTINGS.maxSizeKB) {
          console.warn(
            `⚠️ Avatar is ${sizeKB}KB, exceeds max ${IMAGE_COMPRESSION_SETTINGS.maxSizeKB}KB.`
          );
        }

        const updated = { ...currentUser, avatarBase64: base64 };
        setCurrentUser(updated);
        await AsyncStorage.setItem("currentUser", JSON.stringify(updated));
        
        // Sync to Firebase if configured
        if (firebaseConfig && Object.keys(firebaseConfig).length > 0) {
          try {
            await updateUserProfile(currentUser.id, { avatarBase64: base64 });
            console.log("🔥 Avatar synced to Firebase");
          } catch (error) {
            console.warn("⚠️ Failed to sync avatar to Firebase:", error);
          }
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
      }
    },
    [currentUser, firebaseConfig]
  );

  const sendMessage = useCallback(
    async (msg: Omit<Message, "id" | "timestamp" | "senderId">) => {
      try {
        let finalMsg = msg;

        // Handle image compression (Base64 only)
        // GIFs should always be sent as URLs via gifUrl, NEVER as mediaBase64
        if (msg.mediaBase64 && msg.mediaType === "image") {
          const sizeKB = estimateBase64Size(msg.mediaBase64);
          if (sizeKB > IMAGE_COMPRESSION_SETTINGS.maxSizeKB) {
            console.warn(
              `⚠️ Image is ${sizeKB}KB, exceeds max ${IMAGE_COMPRESSION_SETTINGS.maxSizeKB}KB. Consider re-compressing.`
            );
          }
          console.log(`✅ Image stored as Base64: ${sizeKB}KB (compressed)`);
        }

        // GIF URLs should NOT have mediaBase64
        if (msg.type === "gif") {
          if (msg.mediaBase64) {
            console.warn("⚠️ GIF message should not contain mediaBase64, only gifUrl");
            finalMsg = { ...msg, mediaBase64: undefined };
          }
          console.log(`✅ GIF stored as URL: ${msg.gifUrl}`);
        }

        const newMsg: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          senderId: "me",
          timestamp: Date.now(),
          ...finalMsg,
        };
        const updated = [...messages, newMsg];
        setMessages(updated);
        await AsyncStorage.setItem("messages", JSON.stringify(updated));
        const notificationBody =
          msg.type === "text"
            ? msg.text ?? "Nova poruka"
            : msg.type === "media"
            ? "Poslao/la je fotografiju"
            : msg.type === "gif"
            ? "Poslao/la je GIF"
            : "Nova poruka";
        notifyPartner(`Nova poruka od ${currentUser.name}`, notificationBody);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [messages, notifyPartner, currentUser.name]
  );

  const sendPoke = useCallback(async () => {
    const pokeMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: "me",
      text: "👉 Bocnuo/la te!",
      timestamp: Date.now(),
      type: "poke",
    };
    const updated = [...messages, pokeMsg];
    setMessages(updated);
    await AsyncStorage.setItem("messages", JSON.stringify(updated));
    notifyPartner(`Bocnuli ste ${partner.name}`, "Dobio/la si bocnu! 💌");
  }, [messages, notifyPartner, partner.name]);

  const updateSharedNote = useCallback(
    async (content: string) => {
      const updated: SharedNote = {
        ...sharedNote,
        content,
        lastEditedBy: currentUser.name,
        lastEditedAt: Date.now(),
      };
      setSharedNote(updated);
      await AsyncStorage.setItem("sharedNote", JSON.stringify(updated));
    },
    [sharedNote, currentUser.name]
  );

  const clearMessages = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.setItem("messages", JSON.stringify([]));
  }, []);

  const updateFirebaseConfig = useCallback(
    async (config: Record<string, string>) => {
      setFirebaseConfig(config);
      await AsyncStorage.setItem("firebaseConfig", JSON.stringify(config));
    },
    []
  );

  const updateGiphyKey = useCallback(async (key: string) => {
    setGiphyApiKey(key);
    await AsyncStorage.setItem("giphyApiKey", key);
  }, []);

  const setUserRole = useCallback(async (role: 'slobodan' | 'aleksandra') => {
    const isSlobodan = role === 'slobodan';
    const newCurrentUser: UserProfile = {
      ...currentUser,
      id: role,
      name: isSlobodan ? 'Slobodan' : 'Aleksandra',
    };
    const newPartner: UserProfile = {
      ...partner,
      id: isSlobodan ? 'aleksandra' : 'slobodan',
      name: isSlobodan ? 'Aleksandra' : 'Slobodan',
    };
    setCurrentUser(newCurrentUser);
    setPartner(newPartner);
    await AsyncStorage.setItem("currentUser", JSON.stringify(newCurrentUser));
    await AsyncStorage.setItem("partner", JSON.stringify(newPartner));
  }, [currentUser, partner]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        partner,
        messages,
        sharedNote,
        updateMood,
        updateAvatar,
        sendMessage,
        sendPoke,
        updateSharedNote,
        clearMessages,
        giphyApiKey,
        firebaseConfig,
        updateFirebaseConfig,
        updateGiphyKey,
        setUserRole,
        expoPushToken,
        registerPushToken,
        notifyPartner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
