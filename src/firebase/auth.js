// firebase/auth.js
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./config";

// Login function
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Logout function
export const logoutUser = async () => {
  await signOut(auth);
};
