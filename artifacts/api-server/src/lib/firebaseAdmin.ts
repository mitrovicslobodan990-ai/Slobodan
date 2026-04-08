import fs from "node:fs/promises";
import path from "node:path";
import admin from "firebase-admin";

let initialized = false;

async function loadServiceAccount() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (typeof serviceAccountJson === "string" && serviceAccountJson.trim()) {
    try {
      return JSON.parse(serviceAccountJson) as admin.ServiceAccount;
    } catch (error) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON.");
    }
  }

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_PATH, GOOGLE_APPLICATION_CREDENTIALS, or FIREBASE_SERVICE_ACCOUNT_JSON must be set.",
    );
  }

  const resolvedPath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.resolve(process.cwd(), serviceAccountPath);

  const fileContents = await fs.readFile(resolvedPath, "utf8");
  return JSON.parse(fileContents) as admin.ServiceAccount;
}

export async function getFirebaseAdmin() {
  if (!initialized) {
    const serviceAccount = await loadServiceAccount();
    
    // Inicijalizacija sa tvojim specifičnim URL-om za Evropu
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://couple-chat-5a239-default-rtdb.europe-west1.firebasedatabase.app/"
    });
    
    initialized = true;
  }

  return admin;
}