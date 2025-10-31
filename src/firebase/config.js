// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = { 
  apiKey: "AIzaSyBxB6n1WQab6pYdZ5VeyeHarh9N_R0bEhg", 
  authDomain: "rutuja-4dc6c.firebaseapp.com", 
  projectId: "rutuja-4dc6c", 
  storageBucket: "rutuja-4dc6c.firebasestorage.app", 
  messagingSenderId: "975665394269", 
  appId: "1:975665394269:web:41300cb639ef28d8c613b4", 
  measurementId: "G-XZ4XP1V8Q5" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

export { db, auth, storage };