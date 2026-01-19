import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getFirestore, Firestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    !firebaseConfig.apiKey.includes('your-api-key')
  );
};

// Initialize Firebase (only on client side)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let firebaseInitialized = false;

if (typeof window !== 'undefined') {
  if (isFirebaseConfigured()) {
    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      db = getFirestore(app);
      firebaseInitialized = true;
      console.log('✅ Firebase Auth & Firestore initialized');
    } catch (error) {
      console.warn('⚠️ Firebase initialization failed:', error);
      firebaseInitialized = false;
      app = null;
      auth = null;
      db = null;
    }
  } else {
    console.warn('⚠️ Firebase not configured. Add credentials to .env.local');
    firebaseInitialized = false;
  }
}

// Helper to check if auth is available
export const isAuthAvailable = () => {
  return firebaseInitialized && auth !== null;
};

// Helper to check if Firestore is available
export const isFirestoreAvailable = () => {
  return firebaseInitialized && db !== null;
};

export { app, auth, db, firebaseInitialized };
export default firebaseConfig;

// Firestore helper functions for Orders and Payments
export { Timestamp };

export async function createOrder(orderData: {
  userId: string;
  userEmail?: string;
  userName?: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  paymentStatus?: 'pending' | 'success' | 'failed';
  shippingInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  notes?: string;
}) {
  if (!db) throw new Error('Firestore not initialized');

  const orderRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return orderRef.id;
}

export async function getUserOrders(userId: string) {
  if (!db) throw new Error('Firestore not initialized');

  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  }));
}

export async function getOrderById(orderId: string) {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, 'orders', orderId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    };
  }

  return null;
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!db) throw new Error('Firestore not initialized');

  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

export async function createPayment(paymentData: {
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  transactionId?: string;
  status: 'pending' | 'success' | 'failed';
  paymentDetails?: Record<string, any>;
}) {
  if (!db) throw new Error('Firestore not initialized');

  const paymentRef = await addDoc(collection(db, 'payments'), {
    ...paymentData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return paymentRef.id;
}

export async function getUserPayments(userId: string) {
  if (!db) throw new Error('Firestore not initialized');

  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  }));
}

