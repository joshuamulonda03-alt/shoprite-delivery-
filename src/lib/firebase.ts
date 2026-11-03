import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);

// Validate connection in browser context
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ doc, getDocFromServer }) => {
    getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase client is offline, retrying when network connects.');
      }
    });
  }).catch(() => {});
}

