import fs from "node:fs/promises";
import path from "node:path";
import admin from "firebase-admin";

let initialized = false;

async function loadServiceAccount() {
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!serviceAccountPath) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS must be set to the service account JSON file path.",
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
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
  }

  return admin;
}
