import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK
const app = getApps().length === 0 
  ? initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  : getApps()[0];

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export const adminApp = app;