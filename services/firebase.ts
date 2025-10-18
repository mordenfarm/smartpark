// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGAiw7InabqWQTzxE00wj3DD8ov3Fla_Q",
  authDomain: "smatpark-9c5dc.firebaseapp.com",
  projectId: "smatpark-9c5dc",
  storageBucket: "smatpark-9c5dc.appspot.com",
  messagingSenderId: "63579930759",
  appId: "1:63579930759:web:e2db504ff5169cd00bb822"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };