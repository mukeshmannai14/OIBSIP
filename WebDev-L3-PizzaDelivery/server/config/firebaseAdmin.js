
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  throw new Error(
    "GOOGLE_APPLICATION_CREDENTIALS is missing in server/.env"
  );
}

const serviceAccount = require(path.resolve(credentialsPath));

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

const adminAuth = getAuth(app);

module.exports = adminAuth;
