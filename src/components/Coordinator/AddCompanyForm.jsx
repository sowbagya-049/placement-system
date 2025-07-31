import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import './AddCompanyForm.css';

const AddCompanyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    minCgpa: '',
    maxArrears: '',
  });

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedInUser) => {
      if (loggedInUser) {
        setUser(loggedInUser);
        try {
          const roleRef = doc(db, "roles", loggedInUser.uid);
          const roleSnap = await getDoc(roleRef);
          if (roleSnap.exists()) {
            setUserRole(roleSnap.data().role);
          } else {
            setUserRole("none");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("none");
        }
      } else {
        setUser(null);
        setUserRole("none");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!user || userRole !== "coordinator") {
      setMessage("❌ You must be logged in as a coordinator to add a company.");
      return;
    }

    const minCgpa = parseFloat(formData.minCgpa);
    const maxArrears = parseInt(formData.maxArrears);

    if (isNaN(minCgpa) || isNaN(maxArrears)) {
      setMessage("❗ Please enter valid numbers for CGPA and Arrears.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, 'companies'), {
        name: formData.name.trim(),
        minCgpa,
        maxArrears,
        createdBy: user.email || "unknown",
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Company added successfully!");
      setFormData({ name: '', minCgpa: '', maxArrears: '' });
    } catch (err) {
      console.error("Error adding company:", err);
      setMessage("❌ Failed to add company. Check the console.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>🔄 Checking access...</p>;
  if (!user) return <p>🔒 Please log in to add a company.</p>;

  return (
    <form className="add-company-form" onSubmit={handleSubmit}>
      <h2>Add New Company</h2>

      <input
        type="text"
        name="name"
        placeholder="Company Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="minCgpa"
        placeholder="Minimum CGPA"
        step="0.1"
        value={formData.minCgpa}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="maxArrears"
        placeholder="Maximum Arrears"
        value={formData.maxArrears}
        onChange={handleChange}
        required
      />

      {message && (
        <p className={`form-message ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </p>
      )}

      <button type="submit" disabled={submitting || userRole !== "coordinator"}>
        {submitting ? "Adding..." : "➕ Add Company"}
      </button>

      {userRole !== "coordinator" && (
        <p className="form-message error">❌ Only coordinators can access this form.</p>
      )}
    </form>
  );
};

export default AddCompanyForm;
