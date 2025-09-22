import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // ✅ Add this
import { auth, db } from "../../firebase/config";
import './Login.css';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const [emailOrRoll, setEmailOrRoll] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // ✅ Initialize

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    let email = emailOrRoll;
    let role = "";

    if (!email.includes("@")) {
      email = `${email}@student.com`;
      role = "student";
    } else if (email.includes("coordinator")) {
      role = "coordinator";
    } else {
      role = "student";
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", res.user.uid), {
          email: emailOrRoll,
          role,
        });

        await setDoc(doc(db, "roles", res.user.uid), {
          role,
        });
      }

      alert(`Login successful as ${role}`);
      
      // ✅ Redirect to appropriate dashboard
      if (role === "coordinator") {
        navigate("/coordinator");
      } else {
        navigate("/student");
      }

    } catch (loginErr) {
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

        if (role === "coordinator") {
          navigate("/coordinator-dashboard");
        } else {
          navigate("/student-dashboard");
        }

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
