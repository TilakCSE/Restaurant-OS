import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your verified config for PC's Kitchen
const firebaseConfig = {
  apiKey: "AIzaSyBls_JUGN9OVeAJT99wOLhMVXRAYyivM-k",
  authDomain: "restaurant-os-e36ed.firebaseapp.com",
  projectId: "restaurant-os-e36ed",
  storageBucket: "restaurant-os-e36ed.firebasestorage.app",
  messagingSenderId: "852332247454",
  appId: "1:852332247454:web:9936dc2f0da661a2b2be8f",
  measurementId: "G-6Y0MC9GW8B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the database so App.jsx can use it
export { db };