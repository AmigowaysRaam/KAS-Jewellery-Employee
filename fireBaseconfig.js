// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // optional: for authentication
import { getFirestore } from "firebase/firestore"; // optional: for Firestore
import { getStorage } from "firebase/storage"; // optional: for Storage

// Your web API config from Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyDrHvYVbvnN1ApfiHTVbesEOG782IwqLzU",
  authDomain: "kasemployee.firebaseapp.com",
  projectId: "kasemployee",
  storageBucket: "kasemployee.firebasestorage.app",
  messagingSenderId: "189533086770",
  appId: "1:189533086770:android:ebe1adaf3643bdca61882b",
};

const app = initializeApp(firebaseConfig);

// Optional: export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
