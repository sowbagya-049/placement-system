import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import "./AddCompanyForm.css";

const AddCompanyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    website: "",
    designation: "",
    ctc: "",
    bond: "No",
    block: "No",
    location: "",
    jobType: "Non-Dream",
    openingFor: "",
    maxCgpa: "",
    minArrears: "",
    rounds: ""
  });

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedInUser) => {
      if (loggedInUser) {
        setUser(loggedInUser);
        try {
          const userRef = doc(db, "users", loggedInUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user || userRole !== "coordinator") {
      setMessage("❌ You must be logged in as a coordinator to add a company.");
      return;
    }

    const {
      name,
      about,
      website,
      designation,
      ctc,
      bond,
      block,
      location,
      jobType,
      openingFor,
      maxCgpa,
      minArrears,
      rounds,
    } = formData;

    if (
      !name || !designation || !ctc || !location || !rounds ||
      !maxCgpa || !minArrears
    ) {
      setMessage("❗ Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "companies"), {
        name: name.trim(),
        about: about.trim(),
        website: website.trim(),
        designation: designation.trim(),
        ctc: ctc.trim(),
        bond,
        block,
        location: location.trim(),
        jobType,
        openingFor: openingFor.trim(),
        eligibility: {
          maxCgpa: parseFloat(maxCgpa),
          minArrears: parseInt(minArrears),
        },
        rounds: parseInt(rounds),
        createdBy: user.email || "unknown",
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Company added successfully!");
      setFormData({
        name: "",
        about: "",
        website: "",
        designation: "",
        ctc: "",
        bond: "No",
        block: "No",
        location: "",
        jobType: "Non-Dream",
        openingFor: "",
        maxCgpa: "",
        minArrears: "",
        rounds: "",
      });
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

      <input type="text" name="name" placeholder="Company Name" value={formData.name} onChange={handleChange} required />
      <textarea name="about" placeholder="About Company" value={formData.about} onChange={handleChange} />
      <input type="url" name="website" placeholder="Website Link" value={formData.website} onChange={handleChange} />
      <input type="text" name="designation" placeholder="Job Designation" value={formData.designation} onChange={handleChange} required />
      <input type="text" name="ctc" placeholder="CTC" value={formData.ctc} onChange={handleChange} required />

      <label>Bond</label>
      <select name="bond" value={formData.bond} onChange={handleChange}>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>

      <label>Block</label>
      <select name="block" value={formData.block} onChange={handleChange}>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>

      <input type="text" name="location" placeholder="Job Location" value={formData.location} onChange={handleChange} required />

      <label>Job Type</label>
      <select name="jobType" value={formData.jobType} onChange={handleChange}>
        <option value="Zero">Zero</option>
        <option value="Dream">Dream</option>
        <option value="Non-Dream">Non-Dream</option>
      </select>

      <input type="text" name="openingFor" placeholder="Opening For (e.g. CSE, IT)" value={formData.openingFor} onChange={handleChange} />

      <input type="number" name="maxCgpa" placeholder="Max CGPA" step="0.1" value={formData.maxCgpa} onChange={handleChange} required />
      <input type="number" name="minArrears" placeholder="Min Arrears" value={formData.minArrears} onChange={handleChange} required />
      <input type="number" name="rounds" placeholder="No. of Rounds" value={formData.rounds} onChange={handleChange} required />

      {message && (
        <p className={`form-message ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </p>
      )}

      <button type="submit" disabled={submitting || userRole !== "coordinator"}>
        {submitting ? "Adding..." : "➕ Add Company"}
      </button>

      {userRole !== "coordinator" && (
        <p className="form-message error">
          ❌ Only coordinators can access this form.
        </p>
      )}
    </form>
  );
};

export default AddCompanyForm;
