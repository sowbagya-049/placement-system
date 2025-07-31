import React, { useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const [emailOrRoll, setEmailOrRoll] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    let email = emailOrRoll;
    let role = "";

    // Auto-detect student if just a roll number is used
    if (!email.includes("@")) {
      email = `${email}@student.com`; // Use a dummy domain to create Firebase user
      role = "student";
    } else if (email.includes("coordinator")) {
      role = "coordinator";
    } else {
      role = "student";
    }

    try {
      // Try logging in
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Check if user exists in users collection
      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      if (!userDoc.exists()) {
        // New user, save to Firestore
        await setDoc(doc(db, "users", res.user.uid), {
          email: emailOrRoll,
          role,
        });

        await setDoc(doc(db, "roles", res.user.uid), {
          role,
        });
      }

      alert(`Login successful as ${role}`);
    } catch (loginErr) {
      // If login fails, try creating a new account
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", res.user.uid), {
          email: emailOrRoll,
          role,
        });

        await setDoc(doc(db, "roles", res.user.uid), {
          role,
        });

        alert(`New user created and logged in as ${role}`);
      } catch (createErr) {
        console.error("Login failed:", createErr.message);
        setError("❌ Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email or Roll Number"
          value={emailOrRoll}
          onChange={(e) => setEmailOrRoll(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password / Roll Number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Login</button>
      </form>
      <p style={{ color: "red" }}>{error}</p>
    </div>
  );
};

export default Login;
