const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

let authInstance = null;

if (!admin.getApps().length) {
  try {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
      ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.resolve(__dirname, 'serviceAccountKey.json');

    if (fs.existsSync(keyPath)) {
      const serviceAccount = require(keyPath);
      const app = admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      authInstance = getAuth(app);
      console.log('✅ Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('⚠️ Firebase service account key not found at:', keyPath);
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  }
} else {
  authInstance = getAuth();
}

module.exports = {
  admin,
  getAuth: () => authInstance || (admin.getApps().length ? getAuth() : null)
};
