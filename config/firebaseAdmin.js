import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const getServiceAccount = () => {
  // Prefer explicit env-provided values
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  // Fallback to bundled JSON file if present (local dev only)
  const servicePath = path.resolve(process.cwd(), "loan-approval-tracker-system-firebase-adminsdk-fbsvc.json");
  if (fs.existsSync(servicePath)) {
    const service = JSON.parse(fs.readFileSync(servicePath, "utf8"));
    return {
      projectId: service.project_id,
      clientEmail: service.client_email,
      privateKey: service.private_key,
    };
  }

  throw new Error("Firebase service account configuration not found. Set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL and FIREBASE_PROJECT_ID env vars or provide a local service JSON file.");
};

if (!admin.apps.length) {
  const svc = getServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: svc.projectId,
      clientEmail: svc.clientEmail,
      privateKey: svc.privateKey,
    }),
  });
}

export default admin;
