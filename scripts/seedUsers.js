import dotenv from "dotenv";
import connectDB from "../config/db.js";
import admin from "../config/firebaseAdmin.js";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const {
      ADMIN_EMAIL,
      ADMIN_EMAIL_PASSWORD,
      MANAGER_EMAIL,
      MANAGER_EMAIL_PASSWORD,
    } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_EMAIL_PASSWORD || !MANAGER_EMAIL || !MANAGER_EMAIL_PASSWORD) {
      console.error("Please set ADMIN_EMAIL, ADMIN_EMAIL_PASSWORD, MANAGER_EMAIL and MANAGER_EMAIL_PASSWORD in your environment.");
      process.exit(1);
    }

    // Helper to create or update firebase user
    const ensureFirebaseUser = async (email, password, displayName) => {
      try {
        let userRecord;
        try {
          userRecord = await admin.auth().getUserByEmail(email);
          // update password & displayName if provided
          await admin.auth().updateUser(userRecord.uid, {
            password,
            displayName,
          });
          console.log(`Updated Firebase user: ${email}`);
        } catch (err) {
          if (err.code === "auth/user-not-found") {
            userRecord = await admin.auth().createUser({
              email,
              password,
              displayName,
            });
            console.log(`Created Firebase user: ${email}`);
          } else {
            throw err;
          }
        }
        return userRecord || (await admin.auth().getUserByEmail(email));
      } catch (err) {
        console.error(`Firebase user error for ${email}:`, err.message || err);
        throw err;
      }
    };

    // Ensure admin
    const adminFb = await ensureFirebaseUser(ADMIN_EMAIL, ADMIN_EMAIL_PASSWORD, "Admin");
    await User.findOneAndUpdate(
      { email: ADMIN_EMAIL.toLowerCase() },
      { $set: { email: ADMIN_EMAIL.toLowerCase(), name: "Admin", role: "admin", status: "active" } },
      { upsert: true, new: true }
    );

    // Ensure manager
    const managerFb = await ensureFirebaseUser(MANAGER_EMAIL, MANAGER_EMAIL_PASSWORD, "Manager");
    await User.findOneAndUpdate(
      { email: MANAGER_EMAIL.toLowerCase() },
      { $set: { email: MANAGER_EMAIL.toLowerCase(), name: "Manager", role: "manager", status: "active" } },
      { upsert: true, new: true }
    );

    console.log("Seeding complete.");
    console.log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_EMAIL_PASSWORD}`);
    console.log(`Manager: ${MANAGER_EMAIL} / ${MANAGER_EMAIL_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

run();