import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // email or roll number
  const [password, setPassword] = useState("");     // for coordinator only
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Simple email check
    const isEmail = identifier.includes("@");

    try {
      if (isEmail) {
        // Coordinator login
        const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
        const user = userCredential.user;
        console.log("Coordinator login successful:", user.email);
        // Redirect to coordinator dashboard
      } else {
        // Student login
        const roll = identifier;

        const userRef = doc(db, "users", roll); // assumes document ID is roll number
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          if (userData.roll === roll && userData.password === roll) {
            console.log("Student login successful:", roll);
            // Redirect to student dashboard
          } else {
            setError("Invalid credentials for student.");
          }
        } else {
          setError("Student record not found.");
        }
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Email (coordinator) or Roll No (student)"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      {identifier.includes("@") && (
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      )}
      <button type="submit">Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default Login;
