import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  Database,
  ref,
  set,
  onValue,
  Unsubscribe,
} from "firebase/database";
import { UserProfile } from "@/context/AppContext";

let app: FirebaseApp | null = null;
let database: Database | null = null;

export function initializeFirebase(firebaseConfig: Record<string, string>) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("Firebase config missing required fields");
    return null;
  }

  try {
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
    database = getDatabase(app);
    console.log("✅ Firebase initialized");
    return { app, database };
  } catch (error) {
    console.error("Firebase init error:", error);
    return null;
  }
}

export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!database) {
    return Promise.reject(new Error("Firebase not initialized"));
  }

  try {
    const userRef = ref(database, `users/${userId}`);
    
    // Filter out undefined values - Firebase doesn't allow them
    const dataToSet = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return set(userRef, dataToSet);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export function listenToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile) => void
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
      }
    });
  } catch (error) {
    console.error("Error listening to user profile:", error);
    return null;
  }
}
