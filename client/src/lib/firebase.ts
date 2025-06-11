// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, // ✅ इसे इम्पोर्ट करें
  onAuthStateChanged, // ✅ इसे इम्पोर्ट करें
  signOut, // ✅ इसे इम्पोर्ट करें
  User as FirebaseUser // ✅ इसे इम्पोर्ट करें (Firebase के User टाइप के लिए)
} from "firebase/auth";

// ✅ Firebase configuration - सुनिश्चित करें कि आप .env फ़ाइल का उपयोग कर रहे हैं
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Use .env variable for full domain
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Add if you have it
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // Add if you have it
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ✅ Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ Google Provider को एक्सपोर्ट करें

// ✅ यहां signInWithRedirect को सीधे कॉल करने के लिए एक फ़ंक्शन बनाएं
export const initiateGoogleSignInRedirect = () => {
  signInWithRedirect(auth, googleProvider);
};

// ✅ handleRedirectResult को भी एक्सपोर्ट करें ताकि useAuth इसे कॉल कर सके
export const handleGoogleRedirectResult = () => {
  return getRedirectResult(auth);
};

// ✅ onAuthStateChanged listener को एक्सपोर्ट करें
export const firebaseOnAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ✅ signOut फंक्शन को एक्सपोर्ट करें
export const firebaseSignOut = () => {
  return signOut(auth);
};

// ✅ For debugging in browser (if needed)
// @ts-ignore
if (typeof window !== "undefined") window.initiateGoogleSignInRedirect = initiateGoogleSignInRedirect;
