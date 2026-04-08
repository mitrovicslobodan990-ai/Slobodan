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
import { initializeFirebase, updateUserProfile, listenToUserProfile, saveMessage, listenToMessages, saveSharedNote, listenToSharedNote } from "@/lib/firebase";

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
  setUserRole: (role: 'slobodan' | 'aleksandra') => void;
  expoPushToken: string | null;
  registerPushToken: (token: string) => Promise<void>;
  notifyPartner: (title: string, body: string) => Promise<void>;
  isInitialized: boolean; // ✨ NOVO: App initialization status
  giphyApiKey: string;
  updateGiphyApiKey: (key: string) => Promise<void>;
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
    senderId: "slobodan",
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

// ✨ FIREBASE CONFIG AS CONSTANT (outside component to avoid re-creation on every render)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD6FspCzKdBDXcYqA1qikjYbY4RWvIQk1Q",
  authDomain: "couple-chat-5a239.firebaseapp.com",
  databaseURL: "https://couple-chat-5a239-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "couple-chat-5a239",
  storageBucket: "couple-chat-5a239.firebasestorage.app",
  messagingSenderId: "391581056312",
  appId: "1:391581056312:android:bcfbae03d2a9c0c28ad5cd",
};

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
    content: "Our shared notes... ✨\n\nYou can both write here!",
    lastEditedBy: "me",
    lastEditedAt: Date.now(),
  });
  
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // ✨ NOVO: Tracking app initialization
  const [giphyApiKey, setGiphyApiKey] = useState<string>("");

  // Helper function to generate consistent conversation ID
  const getConversationId = useCallback((user1Id: string, user2Id: string): string => {
    return [user1Id, user2Id].sort().join("_");
  }, []);

  const loadPersistedData = async () => {
    try {
      const [
        storedUser,
        storedPartner,
        storedMessages,
        storedNote,
        storedPushToken,
        storedUserRole,
        storedGiphyKey,
      ] = await Promise.all([
        AsyncStorage.getItem("currentUser"),
        AsyncStorage.getItem("partner"),
        AsyncStorage.getItem("messages"),
        AsyncStorage.getItem("sharedNote"),
        AsyncStorage.getItem("expoPushToken"),
        AsyncStorage.getItem("userRole"),
        AsyncStorage.getItem("giphyApiKey"),
      ]);

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
        console.log("✅ Loaded currentUser from AsyncStorage:", JSON.parse(storedUser).id);
      } else if (storedUserRole) {
        // Ako nema celog korisnika ali ima sačuvane uloge, postavi je
        const role = storedUserRole as 'slobodan' | 'aleksandra';
        const isSlobodan = role === 'slobodan';
        setCurrentUser({
          id: role,
          name: isSlobodan ? 'Slobodan' : 'Aleksandra',
          mood: isSlobodan ? '😊' : '❤️',
          avatarBase64: undefined,
        });
        console.log("✅ Loaded userRole from AsyncStorage:", role);
      }
      
      if (storedPartner) setPartner(JSON.parse(storedPartner));
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedNote) setSharedNote(JSON.parse(storedNote));
      if (storedPushToken) setExpoPushToken(storedPushToken);
      if (storedGiphyKey) setGiphyApiKey(storedGiphyKey);
    } catch (e) {
      console.warn("Error loading data:", e);
    } finally {
      setIsInitialized(true); // ✨ NOVO: Mark app as ready
      console.log("✅ App initialization complete");
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
    if (FIREBASE_CONFIG && Object.keys(FIREBASE_CONFIG).length > 0) {
      try {
        console.log("🔥 Initializing Firebase...");
        initializeFirebase(FIREBASE_CONFIG);
        
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

        // Setup listener for messages from Firebase
        const conversationId = getConversationId(currentUser.id, partner.id);
        const unsubscribeMessages = listenToMessages(conversationId, (firebaseMessages) => {
          console.log("💬 Messages loaded from Firebase:", firebaseMessages.length);
          if (firebaseMessages.length > 0) {
            setMessages(firebaseMessages);
            AsyncStorage.setItem("messages", JSON.stringify(firebaseMessages));
          }
        });

        // Setup listener for shared notes from Firebase
        const unsubscribeSharedNote = listenToSharedNote(conversationId, (firebaseNote) => {
          console.log("📝 Shared note loaded from Firebase:", firebaseNote?.content?.substring(0, 50));
          if (firebaseNote) {
            setSharedNote(firebaseNote);
            AsyncStorage.setItem("sharedNote", JSON.stringify(firebaseNote));
          }
        });

        return () => {
          unsubscribeCurrent?.();
          unsubscribePartner?.();
          unsubscribeMessages?.();
          unsubscribeSharedNote?.();
        };
      } catch (error) {
        console.error("❌ Failed to initialize Firebase:", error);
      }
    }
  }, [currentUser.id, partner.id, getConversationId]);

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
      if (FIREBASE_CONFIG && Object.keys(FIREBASE_CONFIG).length > 0) {
        try {
          await updateUserProfile(currentUser.id, { mood });
          console.log("🔥 Mood synced to Firebase:", mood);
        } catch (error) {
          console.warn("⚠️ Failed to sync mood to Firebase:", error);
        }
      }
    },
    [currentUser]
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
        if (FIREBASE_CONFIG && Object.keys(FIREBASE_CONFIG).length > 0) {
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
    [currentUser]
  );

  const sendMessage = useCallback(
    async (msg: Omit<Message, "id" | "timestamp" | "senderId">) => {
      try {
        // ✨ KRITIČAN CHECK: Provera da li je currentUser pravilno inicijalizovan
        if (!currentUser.id || currentUser.id === "unknown") {
          console.error("❌ ERROR: currentUser.id is not valid:", currentUser.id);
          console.log("⏳ Waiting for app initialization...");
          // Fallback: koristi "slobodan" kao default
          const fallbackId = "slobodan";
          console.warn(`⚠️ Using fallback ID: ${fallbackId}`);
        }
        
        console.log("📨 Sending message from:", currentUser.id, currentUser.name);
        console.log("📊 isInitialized:", isInitialized);
        
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
          senderId: currentUser.id, // Koristi stvarni ID
          timestamp: Date.now(),
          ...finalMsg,
        };
        console.log("✅ Message created with senderId:", newMsg.senderId);
        const updated = [...messages, newMsg];
        setMessages(updated);
        await AsyncStorage.setItem("messages", JSON.stringify(updated));
        
        // Save message to Firebase if configured
        if (FIREBASE_CONFIG && Object.keys(FIREBASE_CONFIG).length > 0) {
          try {
            const conversationId = getConversationId(currentUser.id, partner.id);
            await saveMessage(newMsg, conversationId);
            console.log("🔥 Message saved to Firebase with senderId:", newMsg.senderId);
          } catch (error) {
            console.warn("⚠️ Failed to save message to Firebase:", error);
          }
        }
        
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
    [messages, notifyPartner, currentUser.id, currentUser.name, isInitialized, getConversationId]
  );

  const sendPoke = useCallback(async () => {
    console.log("👉 Sending poke from:", currentUser.id, currentUser.name);
    console.log("📊 isInitialized:", isInitialized);
    const pokeMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text: "👉 Bocnuo/la te!",
      timestamp: Date.now(),
      type: "poke",
    };
    const updated = [...messages, pokeMsg];
    setMessages(updated);
    await AsyncStorage.setItem("messages", JSON.stringify(updated));
    
    // Save poke message to Firebase if configured
    if (FIREBASE_CONFIG && Object.keys(FIREBASE_CONFIG).length > 0) {
      try {
        const conversationId = getConversationId(currentUser.id, partner.id);
        await saveMessage(pokeMsg, conversationId);
        console.log("🔥 Poke message saved to Firebase");
      } catch (error) {
        console.warn("⚠️ Failed to save poke to Firebase:", error);
      }
    }
    
    notifyPartner(`Bocnuli ste ${partner.name}`, "Dobio/la si bocnu! 💌");
  }, [messages, notifyPartner, partner.name, currentUser.id, currentUser.name, isInitialized, getConversationId]);

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
      
      // Save to Firebase if configured
      if (FIREBASE_CONFIG && Object.keys(FIREBASE_CONFIG).length > 0) {
        try {
          const conversationId = getConversationId(currentUser.id, partner.id);
          await saveSharedNote(conversationId, updated);
          console.log("🔥 Shared note saved to Firebase");
        } catch (error) {
          console.warn("⚠️ Failed to save shared note to Firebase:", error);
        }
      }
    },
    [sharedNote, currentUser.name, currentUser.id, partner.id, getConversationId]
  );

  const clearMessages = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.setItem("messages", JSON.stringify([]));
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
    await AsyncStorage.setItem("userRole", role); // ✨ NOVO: Čuvaj ulogu posebno
    console.log("✅ User role set to:", role);
  }, [currentUser, partner]);

  const updateGiphyApiKey = useCallback(async (key: string) => {
    setGiphyApiKey(key);
    await AsyncStorage.setItem("giphyApiKey", key);
    console.log("✅ Giphy API key updated");
  }, []);

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
        setUserRole,
        expoPushToken,
        registerPushToken,
        notifyPartner,
        isInitialized,
        giphyApiKey,
        updateGiphyApiKey,
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
