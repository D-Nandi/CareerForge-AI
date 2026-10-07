/**
 * CareerNest — Firebase Client Configuration & Auth Helpers
 * Uses Firebase Modular SDK v10 over CDN
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBgAAidL7Ao_Z2GXdzYQPpq9QbG7VOk9B8",
  authDomain: "careerforge-ai-c1f65.firebaseapp.com",
  projectId: "careerforge-ai-c1f65",
  storageBucket: "careerforge-ai-c1f65.firebasestorage.app",
  messagingSenderId: "316442572218",
  appId: "1:316442572218:web:d19f0bfb5c24c1355a1983",
  measurementId: "G-RR74F3G1E1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
};
