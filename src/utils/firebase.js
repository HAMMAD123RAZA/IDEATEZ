// FILE: client/src/utils/firebase.js

// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import getStorage

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDOSuFZsUzj0L7t9chjzISax9pIRjPwrDk",
    authDomain: "dasservices-de053.firebaseapp.com",
    projectId: "dasservices-de053",
    storageBucket: "dasservices-de053.firebasestorage.app",
    messagingSenderId: "384032609082",
    appId: "1:384032609082:web:a86de9e30b7c14f0f5b603",
    measurementId: "G-X9RT9R1M0G"
  };
  
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize and export Firebase Storage