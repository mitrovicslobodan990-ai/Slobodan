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
import { initializeFirebase, updateUserProfile, listenToUserProfile, saveMessage, listenToMessagesPaginated, saveSharedNote, listenToSharedNote, getMessagesPaginated, markMessagesAsSeen as markMessagesAsSeenFirebase, markNoteSeenBy } from "@/lib/firebase";

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  mediaBase64?: string;
  mediaType?: "image" | "gif" | "video";
  gifUrl?: string;
  timestamp: number;
  type: "text" | "media" | "gif" | "poke";
  seen?: { [userId: string]: number };
  status?: "sent" | "pending";
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
  sendHeart: () => void;
  updateSharedNote: (content: string) => void;
  clearMessages: () => void;
  setUserRole: (role: 'slobodan' | 'aleksandra') => void;
  expoPushToken: string | null;
  registerPushToken: (token: string) => Promise<void>;
  notifyPartner: (title: string, body: string) => Promise<void>;
  isInitialized: boolean;
  giphyApiKey: string;
  updateGiphyApiKey: (key: string) => Promise<void>;
  hasMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  isLoadingMore: boolean;
  markMessagesAsSeen: (messageIds: string[]) => Promise<void>;
  hasUnseenNote: boolean;
  markNoteSeen: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD6FspCzKdBDXcYqA1qikjYbY4RWvIQk1Q",
  authDomain: "couple-chat-5a239.firebaseapp.com",
  databaseURL: "https://couple-chat-5a239-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "couple-chat-5a239",
  storageBucket: "couple-chat-5a239.firebasestorage.app",
  messagingSenderId: "391581056312",
  appId: "1:391581056312:android:bcfbae03d2a9c0c28ad5cd",
};

async function isOnline(): Promise<boolean> {
  try {
    const res = await fetch("https://www.google.com/generate_204", { method: "HEAD" });
    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}

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

  const [messages, setMessages] = useState<Message[]>([]);
  const [sharedNote, setSharedNote] = useState<SharedNote>({
    id: "note1",
    content: "Our shared notes... ✨",
    lastEditedBy: "me",
    lastEditedAt: Date.now(),
  });

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [giphyApiKey, setGiphyApiKey] = useState<string>("");
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentMessageLimit, setCurrentMessageLimit] = useState(30);
  const [hasUnseenNote, setHasUnseenNote] = useState(false);

  const getConversationId = useCallback((user1Id: string, user2Id: string): string => {
    return [user1Id, user2Id].sort().join("_");
  }, []);

  const loadPersistedData = async () => {
    try {
      const [storedUser, storedPartner, storedMessages, storedNote, storedPushToken, storedUserRole, storedGiphyKey] = await Promise.all([
        AsyncStorage.getItem("currentUser"),
        AsyncStorage.getItem("partner"),
        AsyncStorage.getItem("messages"),
        AsyncStorage.getItem("sharedNote"),
        AsyncStorage.getItem("expoPushToken"),
        AsyncStorage.getItem("userRole"),
        AsyncStorage.getItem("giphyApiKey"),
      ]);

      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      else if (storedUserRole) {
        const role = storedUserRole as 'slobodan' | 'aleksandra';
        const isSlobodan = role === 'slobodan';
        setCurrentUser(prev => ({ ...prev, id: role, name: isSlobodan ? 'Slobodan' : 'Aleksandra' }));
      }

      if (storedPartner) setPartner(JSON.parse(storedPartner));
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedNote) setSharedNote(JSON.parse(storedNote));
      if (storedPushToken) setExpoPushToken(storedPushToken);
      if (storedGiphyKey) setGiphyApiKey(storedGiphyKey);
    } catch (e) {
      console.warn("Error loading data:", e);
    } finally {
      setIsInitialized(true);
    }
  };

  const registerPushToken = useCallback(async (token: string) => {
    try {
      setExpoPushToken(token);
      await AsyncStorage.setItem("expoPushToken", token);
      const API_BASE_URL = "https://couple-chat-api.onrender.com";
      await fetch(`${API_BASE_URL}/api/push/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, token }),
      });
    } catch (error) {
      console.error("❌ Failed to register push token:", error);
    }
  }, [currentUser.id]);

  const notifyPartner = useCallback(async (title: string, body: string) => {
    try {
      const API_BASE_URL = "https://couple-chat-api.onrender.com";
      const payload: Record<string, unknown> = {
        fromUserId: currentUser.id,
        toUserId: partner.id,
        title,
        body,
      };
      const response = await fetch(`${API_BASE_URL}/api/push/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("📬 Notification response:", response.status);
    } catch (error) {
      console.error("❌ Failed to send push notification:", error);
    }
  }, [currentUser.id, partner.id]);

  useEffect(() => {
    loadPersistedData();
  }, []);

  useEffect(() => {
    if (isInitialized && FIREBASE_CONFIG) {
      initializeFirebase(FIREBASE_CONFIG);

      const unsubscribeCurrent = listenToUserProfile(currentUser.id, (profile) => {
        if (profile) setCurrentUser(prev => ({ ...prev, ...profile }));
      });

      const unsubscribePartner = listenToUserProfile(partner.id, (profile) => {
        if (profile) setPartner(prev => ({ ...prev, ...profile }));
      });

      const conversationId = getConversationId(currentUser.id, partner.id);
      const unsubscribeMessages = listenToMessagesPaginated(conversationId, currentMessageLimit, (firebaseMessages, hasMore) => {
        if (firebaseMessages.length > 0) {
          const sortedMessages = firebaseMessages.sort((a, b) => a.timestamp - b.timestamp);
          // Zadrzи pending poruke koje jos nisu stigle na Firebase
          setMessages(prev => {
            const pendingOnly = prev.filter(m => m.status === "pending" && !sortedMessages.find(f => f.id === m.id));
            return [...sortedMessages, ...pendingOnly];
          });
          AsyncStorage.setItem("messages", JSON.stringify(sortedMessages));
        }
        setHasMoreMessages(hasMore);
      });

      const unsubscribeSharedNote = listenToSharedNote(conversationId, (firebaseNote) => {
        if (firebaseNote) {
          setSharedNote(firebaseNote);
          AsyncStorage.setItem("sharedNote", JSON.stringify(firebaseNote));
          // Proveri da li partner ima neprocitane beleske
          const seenBy: Record<string, number> = firebaseNote.seenBy || {};
          const lastEdit: number = firebaseNote.lastEditedAt || 0;
          const editedByPartner = firebaseNote.lastEditedBy !== currentUser.name;
          const partnerSeenTs = seenBy[currentUser.id] || 0;
          setHasUnseenNote(editedByPartner && partnerSeenTs < lastEdit);
        }
      });

      return () => {
        unsubscribeCurrent?.();
        unsubscribePartner?.();
        unsubscribeMessages?.();
        unsubscribeSharedNote?.();
      };
    }
  }, [currentUser.id, partner.id, getConversationId, currentMessageLimit, isInitialized]);

  useEffect(() => {
    if (expoPushToken && currentUser.id && isInitialized) {
      registerPushToken(expoPushToken);
    }
  }, [expoPushToken, currentUser.id, registerPushToken, isInitialized]);

  const sendMessage = useCallback(async (msg: Omit<Message, "id" | "timestamp" | "senderId">) => {
    try {
      const newMsg: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        senderId: currentUser.id,
        timestamp: Date.now(),
        seen: { [currentUser.id]: Date.now() },
        status: "pending",
        ...msg,
      };

      setMessages(prev => [...prev, newMsg]);

      const connected = await isOnline();
      const conversationId = getConversationId(currentUser.id, partner.id);

      if (connected) {
        await saveMessage({ ...newMsg, status: "sent" }, conversationId);
        setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: "sent" } : m));
        const notificationBody = msg.type === "text" ? msg.text ?? "Nova poruka" : "Poslao/la vam je nešto lepo 💌";
        notifyPartner(`Poruka od: ${currentUser.name}`, notificationBody);
      } else {
        const pendingRaw = await AsyncStorage.getItem("pendingMessages");
        const pending: Message[] = pendingRaw ? JSON.parse(pendingRaw) : [];
        pending.push(newMsg);
        await AsyncStorage.setItem("pendingMessages", JSON.stringify(pending));
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [currentUser, partner, notifyPartner, getConversationId]);

  const sendPoke = useCallback(async () => {
    const pokeMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text: "👉 Bocnuo/la te!",
      timestamp: Date.now(),
      type: "poke",
      seen: { [currentUser.id]: Date.now() },
    };
    const conversationId = getConversationId(currentUser.id, partner.id);
    await saveMessage(pokeMsg, conversationId);
    notifyPartner("👉 Boc!", `${currentUser.name} te je bocnuo/la!`);
  }, [currentUser, partner, notifyPartner, getConversationId]);

  const sendHeart = useCallback(async () => {
    const heartMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text: "❤️",
      timestamp: Date.now(),
      type: "poke",
      seen: { [currentUser.id]: Date.now() },
    };
    const conversationId = getConversationId(currentUser.id, partner.id);
    await saveMessage(heartMsg, conversationId);
    notifyPartner("❤️", `${currentUser.name} ti je poslao/la srce!`);
  }, [currentUser, partner, notifyPartner, getConversationId]);

  const setUserRole = useCallback(async (role: 'slobodan' | 'aleksandra') => {
    const isSlobodan = role === 'slobodan';
    const newCurrentUser = { ...currentUser, id: role, name: isSlobodan ? 'Slobodan' : 'Aleksandra' };
    const newPartner = { ...partner, id: isSlobodan ? 'aleksandra' : 'slobodan', name: isSlobodan ? 'Aleksandra' : 'Slobodan' };

    setCurrentUser(newCurrentUser);
    setPartner(newPartner);

    await AsyncStorage.setItem("userRole", role);
    await AsyncStorage.setItem("currentUser", JSON.stringify(newCurrentUser));
    await AsyncStorage.setItem("partner", JSON.stringify(newPartner));

    if (expoPushToken) {
      registerPushToken(expoPushToken);
    }
  }, [currentUser, partner, expoPushToken, registerPushToken]);

  const updateMood = useCallback(async (mood: string) => {
    setCurrentUser(prev => ({ ...prev, mood }));
    await updateUserProfile(currentUser.id, { mood });
  }, [currentUser.id]);

  const updateAvatar = useCallback(async (base64: string) => {
    setCurrentUser(prev => ({ ...prev, avatarBase64: base64 }));
    await updateUserProfile(currentUser.id, { avatarBase64: base64 });
  }, [currentUser.id]);

  const updateSharedNote = useCallback(async (content: string) => {
    const updated = { ...sharedNote, content, lastEditedBy: currentUser.name, lastEditedAt: Date.now(), seenBy: { [currentUser.id]: Date.now() } };
    setSharedNote(updated);
    await saveSharedNote(getConversationId(currentUser.id, partner.id), updated);
  }, [sharedNote, currentUser, partner, getConversationId]);

  const markNoteSeen = useCallback(async () => {
    const conversationId = getConversationId(currentUser.id, partner.id);
    await markNoteSeenBy(conversationId, currentUser.id);
    setHasUnseenNote(false);
  }, [currentUser.id, partner.id, getConversationId]);

  const updateGiphyApiKey = useCallback(async (key: string) => {
    setGiphyApiKey(key);
    await AsyncStorage.setItem("giphyApiKey", key);
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const conversationId = getConversationId(currentUser.id, partner.id);
      const oldestTimestamp = messages[0]?.timestamp;
      const { messages: olderMessages, hasMore } = await getMessagesPaginated(conversationId, 30, oldestTimestamp);
      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages.sort((a, b) => a.timestamp - b.timestamp), ...prev]);
        setCurrentMessageLimit(prev => prev + 30);
      }
      setHasMoreMessages(hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreMessages, isLoadingMore, currentUser.id, partner.id, messages, getConversationId]);

  const markMessagesAsSeen = useCallback(async (messageIds: string[]) => {
    const conversationId = getConversationId(currentUser.id, partner.id);
    await markMessagesAsSeenFirebase(conversationId, messageIds, currentUser.id);
  }, [currentUser.id, partner.id, getConversationId]);

  // Retry pending poruka svakih 5s
  useEffect(() => {
    const retryPending = async () => {
      const pendingRaw = await AsyncStorage.getItem("pendingMessages");
      if (!pendingRaw) return;
      const pending: Message[] = JSON.parse(pendingRaw);
      if (pending.length === 0) return;

      const connected = await isOnline();
      if (!connected) return;

      const conversationId = getConversationId(currentUser.id, partner.id);
      for (const msg of pending) {
        try {
          await saveMessage({ ...msg, status: "sent" }, conversationId);
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: "sent" } : m));
        } catch (e) {
          console.error("Retry failed for message:", msg.id);
          return;
        }
      }
      await AsyncStorage.removeItem("pendingMessages");
    };

    const interval = setInterval(retryPending, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id, partner.id, getConversationId]);

  return (
    <AppContext.Provider value={{
      currentUser, partner, messages, sharedNote, updateMood, updateAvatar,
      sendMessage, sendPoke, sendHeart, updateSharedNote, clearMessages: () => {},
      setUserRole, expoPushToken, registerPushToken, notifyPartner, isInitialized,
      giphyApiKey, updateGiphyApiKey, hasMoreMessages, loadMoreMessages,
      isLoadingMore, markMessagesAsSeen, hasUnseenNote, markNoteSeen
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
