import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjJLBHyzEOPVZalJvjI-PYyGfLTWBbpPg",
  authDomain: "mynotes-4df22.firebaseapp.com",
  projectId: "mynotes-4df22",
  storageBucket: "mynotes-4df22.firebasestorage.app",
  messagingSenderId: "553169915797",
  appId: "1:553169915797:web:764cc4db6bc1d7b0c0309c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
