import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import {
  getDatabase,
  Database,
  ref,
  set,
  update,
  get,
  remove,
    onValue,
  Unsubscribe,
  push, // Add push for generating unique keys
} from "firebase/database";
import { Message, UserProfile } from "@/context/AppContext";

let app: FirebaseApp | null = null;
let database: Database | null = null;

export function initializeFirebase(firebaseConfig: Record<string, string>) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("Firebase config missing required fields");
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
    const config = {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain || "",
      databaseURL: firebaseConfig.databaseURL || `https://${firebaseConfig.projectId}.firebaseio.com`,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket || "",
      messagingSenderId: firebaseConfig.messagingSenderId || "",
      appId: firebaseConfig.appId || "",
    };
    app = initializeApp(config);
    }

    database = getDatabase(app);
    console.log("✅ Firebase initialized");
    return { app, database };
  } catch (error) {
    console.error("Firebase init error:", error);
    return null;
  }
}

export function getFirebaseInstance() {
  return { app, database };
}

export async function setUserProfile(
  userId: string,
  profile: UserProfile
): Promise<void> {
  if (!database) throw new Error("Firebase not initialized");
  try {
    const userRef = ref(database, `users/${userId}`);
    return set(userRef, profile);
  } catch (error) {
    console.error("Error setting user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!database) throw new Error("Firebase not initialized");
  try {
    const userRef = ref(database, `users/${userId}`);
    const dataToUpdate = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    return update(userRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export function listenToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void
): Unsubscribe | null {
  if (!database) {
    console.warn("Firebase not initialized");
    return null;
  }

  try {
    const userRef = ref(database, `users/${userId}`);
    return onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.val());
      } else {
        onUpdate(null);
      }
    });
  } catch (error) {
    console.error("Error listening to user profile:", error);
    return null;
  }
}

export async function deleteUserProfile(userId: string): Promise<void> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const userRef = ref(database, `users/${userId}`);
    return remove(userRef);
  } catch (error) {
    console.error("Error deleting user profile:", error);
    throw error;
  }
}

// ===== MESSAGE FUNCTIONS =====

export async function saveMessage(
  message: Message,
  conversationId: string
): Promise<void> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const messageRef = ref(database, `conversations/${conversationId}/messages/${message.id}`);
    await set(messageRef, message);

    // Maintain only the last 200 messages
    await maintainMessageLimit(conversationId);
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

async function maintainMessageLimit(conversationId: string): Promise<void> {
  if (!database) return;

  try {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const snapshot = await get(messagesRef);

    if (snapshot.exists()) {
      const messagesObj = snapshot.val();
      const messageIds = Object.keys(messagesObj);

      // Sort messages by timestamp (newest first)
      const sortedMessages = messageIds
        .map(id => ({ id, ...messagesObj[id] }))
        .sort((a, b) => b.timestamp - a.timestamp);

      // If we have more than 200 messages, delete the oldest ones
      if (sortedMessages.length > 200) {
        const messagesToDelete = sortedMessages.slice(200);
        const deletePromises = messagesToDelete.map(msg =>
          database ? remove(ref(database, `conversations/${conversationId}/messages/${msg.id}`)) : Promise.resolve()
        );
        await Promise.all(deletePromises);
        console.log(`🗑️ Deleted ${messagesToDelete.length} old messages to maintain 200 message limit`);
      }
    }
  } catch (error) {
    console.error("Error maintaining message limit:", error);
  }
}

export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const snapshot = await get(messagesRef);
    if (snapshot.exists()) {
      const messagesObj = snapshot.val();
      return Object.values(messagesObj) as Message[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function getMessagesPaginated(
  conversationId: string,
  limit: number = 30,
  startAfter?: number
): Promise<{ messages: Message[], hasMore: boolean }> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const snapshot = await get(messagesRef);

    if (snapshot.exists()) {
      const messagesObj = snapshot.val();
      let messagesList = Object.values(messagesObj) as Message[];

      // Sort by timestamp (newest first)
      messagesList.sort((a, b) => b.timestamp - a.timestamp);

      // Apply pagination
      let startIndex = 0;
      if (startAfter) {
        const afterIndex = messagesList.findIndex(msg => msg.timestamp <= startAfter);
        startIndex = afterIndex >= 0 ? afterIndex + 1 : 0;
      }

      const paginatedMessages = messagesList.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < messagesList.length;

      return { messages: paginatedMessages, hasMore };
    }
    return { messages: [], hasMore: false };
  } catch (error) {
    console.error("Error fetching paginated messages:", error);
    return { messages: [], hasMore: false };
  }
}

export function listenToMessages(
  conversationId: string,
  onUpdate: (messages: Message[]) => void
): Unsubscribe | null {
  if (!database) {
    console.warn("Firebase not initialized");
    return null;
  }

  try {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    return onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesObj = snapshot.val();
        const messagesList = Object.values(messagesObj) as Message[];
        // Sort by timestamp (newest first) and take only the last 30
        const recentMessages = messagesList
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 30);
        onUpdate(recentMessages);
      } else {
        onUpdate([]);
      }
    });
  } catch (error) {
    console.error("Error listening to messages:", error);
    return null;
  }
}

export function listenToMessagesPaginated(
  conversationId: string,
  limit: number = 30,
  onUpdate: (messages: Message[], hasMore: boolean) => void
): Unsubscribe | null {
  if (!database) {
    console.warn("Firebase not initialized");
    return null;
  }

  try {
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    return onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesObj = snapshot.val();
        let messagesList = Object.values(messagesObj) as Message[];

        // Sort by timestamp (newest first)
        messagesList.sort((a, b) => b.timestamp - a.timestamp);

        // Take only the specified limit
        const recentMessages = messagesList.slice(0, limit);
        const hasMore = messagesList.length > limit;

        onUpdate(recentMessages, hasMore);
      } else {
        onUpdate([], false);
      }
    });
  } catch (error) {
    console.error("Error listening to paginated messages:", error);
    return null;
  }
}

export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const messageRef = ref(database, `conversations/${conversationId}/messages/${messageId}`);
    return remove(messageRef);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}

export async function markMessagesAsSeen(
  conversationId: string,
  messageIds: string[],
  userId: string
): Promise<void> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const updates: { [key: string]: any } = {};
    const timestamp = Date.now();

    messageIds.forEach(messageId => {
      updates[`conversations/${conversationId}/messages/${messageId}/seen/${userId}`] = timestamp;
    });

    await update(ref(database), updates);
    console.log(`✅ Marked ${messageIds.length} messages as seen by ${userId}`);
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    throw error;
  }
}

// ===== SHARED NOTES FUNCTIONS =====

export async function saveSharedNote(
  conversationId: string,
  note: any
): Promise<void> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const noteRef = ref(database, `conversations/${conversationId}/sharedNote`);
    return set(noteRef, note);
  } catch (error) {
    console.error("Error saving shared note:", error);
    throw error;
  }
}

export async function getSharedNote(conversationId: string): Promise<any | null> {
  if (!database) throw new Error("Firebase not initialized");

  try {
    const noteRef = ref(database, `conversations/${conversationId}/sharedNote`);
    const snapshot = await get(noteRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error fetching shared note:", error);
    return null;
  }
}

export function listenToSharedNote(
  conversationId: string,
  onUpdate: (note: any | null) => void
): Unsubscribe | null {
  if (!database) {
    console.warn("Firebase not initialized");
    return null;
  }

  try {
    const noteRef = ref(database, `conversations/${conversationId}/sharedNote`);
    return onValue(noteRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.val());
      } else {
        onUpdate(null);
      }
    });
  } catch (error) {
    console.error("Error listening to shared note:", error);
    return null;
  }
}
