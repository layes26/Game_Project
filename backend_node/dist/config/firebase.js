"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebase = initializeFirebase;
exports.verifyIdToken = verifyIdToken;
exports.getUserByUid = getUserByUid;
exports.createCustomToken = createCustomToken;
exports.setAdminClaim = setAdminClaim;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Initialize Firebase Admin SDK for server-side authentication
function initializeFirebase() {
    if (firebase_admin_1.default.apps.length > 0) {
        return firebase_admin_1.default.app();
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
        const app = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId,
                privateKey,
                clientEmail,
            }),
        });
        console.log('Firebase Admin SDK initialized');
        return app;
    }
    catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
        throw error;
    }
}
// Verify Firebase ID token
async function verifyIdToken(idToken) {
    if (!firebase_admin_1.default.apps.length) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    try {
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(idToken);
        return decodedToken;
    }
    catch (error) {
        console.error('Error verifying ID token:', error);
        throw error;
    }
}
// Get user by UID
async function getUserByUid(uid) {
    if (!firebase_admin_1.default.apps.length) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    try {
        const userRecord = await firebase_admin_1.default.auth().getUser(uid);
        return userRecord;
    }
    catch (error) {
        console.error('Error getting user by UID:', error);
        throw error;
    }
}
// Create custom token for user
async function createCustomToken(uid, claims) {
    if (!firebase_admin_1.default.apps.length) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    try {
        const customToken = await firebase_admin_1.default.auth().createCustomToken(uid, claims);
        return customToken;
    }
    catch (error) {
        console.error('Error creating custom token:', error);
        throw error;
    }
}
// Set custom user claims (for admin role)
async function setAdminClaim(uid) {
    if (!firebase_admin_1.default.apps.length) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    try {
        await firebase_admin_1.default.auth().setCustomUserClaims(uid, { role: 'ADMIN' });
        console.log(`Admin claim set for user: ${uid}`);
    }
    catch (error) {
        console.error('Error setting admin claim:', error);
        throw error;
    }
}
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebase.js.map