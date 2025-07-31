// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1T6SBSs4iyBpmzNGtTuaPUt3ZHuzOc1o",
  authDomain: "placement-8b2ea.firebaseapp.com",
  projectId: "placement-8b2ea",
  storageBucket: "placement-8b2ea.appspot.com",
  messagingSenderId: "286483392611",
  appId: "1:286483392611:web:f633624b5751706490b056",
  measurementId: "G-P42X65CHNQ"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };