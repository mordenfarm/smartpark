// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NOTE: Replace with your actual Firebase project configuration.
// This is a placeholder configuration.
const firebaseConfig = {
  apiKey: "AIzaSyBGAiw7InabqWQTzxE00wj3DD8ov3Fla_Q",
  authDomain: "smatpark-9c5dc.firebaseapp.com",
  databaseURL: "https://smatpark-9c5dc-default-rtdb.firebaseio.com",
  projectId: "smatpark-9c5dc",
  storageBucket: "smatpark-9c5dc.firebasestorage.app",
  messagingSenderId: "63579930759",
  appId: "1:63579930759:web:e2db504ff5169cd00bb822"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
