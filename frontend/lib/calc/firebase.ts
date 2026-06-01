'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Public web config for Firebase project dream-sales-318e8 (safe to ship to client).
const firebaseConfig = {
  apiKey: 'AIzaSyAcGFwcqrE6pyXi9FPPFXwhYUkmawpSPy0',
  authDomain: 'dream-sales-318e8.firebaseapp.com',
  projectId: 'dream-sales-318e8',
  storageBucket: 'dream-sales-318e8.firebasestorage.app',
  messagingSenderId: '863162066971',
  appId: '1:863162066971:web:eaa17da28986cc826670be',
  measurementId: 'G-MJ3QNX8FN3',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
