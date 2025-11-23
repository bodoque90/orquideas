import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGX_BgL7khcA9pxES3qt2RKvrVP58S6t0",
  authDomain: "orchid-monitor.firebaseapp.com",
  projectId: "orchid-monitor",
  storageBucket: "orchid-monitor.firebasestorage.app",
  messagingSenderId: "229834140600",
  appId: "1:229834140600:web:5b574627ea4b6b46b47d4d",
  measurementId: "G-GHWZHLVWR5",
  databaseURL: "https://orchid-monitor-default-rtdb.firebaseio.com"
};

// Inicializar Firebase (solo una vez)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let realtimeDb: Database;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  // Solo inicializar en el cliente
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  realtimeDb = getDatabase(app);
  
  // Analytics solo funciona en el cliente
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available');
  }
}

export { app, auth, db, realtimeDb, analytics };