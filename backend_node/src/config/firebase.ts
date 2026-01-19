import admin from 'firebase-admin';

// Initialize Firebase Admin SDK for server-side authentication
export function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn('Firebase credentials not found. Please set environment variables.');
    console.warn('Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });

    console.log('Firebase Admin SDK initialized');
    return app;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

// Verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// Get user by UID
export async function getUserByUid(uid: string) {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    throw error;
  }
}

// Create custom token for user
export async function createCustomToken(uid: string, claims?: Record<string, any>) {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  try {
    const customToken = await admin.auth().createCustomToken(uid, claims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

// Set custom user claims (for admin role)
export async function setAdminClaim(uid: string) {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { role: 'ADMIN' });
    console.log(`Admin claim set for user: ${uid}`);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw error;
  }
}

export default admin;

