import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import './StudentProfileForm.css';

const StudentProfileForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    className: '',
    department: '',
    course: '',
    semester: '',
    cgpa: '',
    tenthMarks: '',
    twelfthMarks: '',
    gap: '',
    arrears: ''
  });

  const [user, setUser] = useState(null);

  // Track login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check if profile already exists
  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          onComplete(); // Skip form if profile exists
        }
      }
    };
    checkProfile();
  }, [user, onComplete]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await setDoc(doc(db, 'profiles', user.uid), formData);
      alert("Profile saved successfully.");
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error.message);
      alert("Failed to save profile.");
    }
  };

  return (
    <div className="page-wrapper">
      <form className="student-profile-form" onSubmit={handleSubmit}>
        <h2>Student Profile</h2>
        {Object.entries(formData).map(([key]) => (
          <div key={key} className="form-group">
            <label htmlFor={key}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              id={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={`Enter ${key.replace(/([A-Z])/g, ' ').toLowerCase()}`}
              className="form-input"
              required
            />
          </div>
        ))}
        <button type="submit" className="submit-btn">Save Profile</button>
      </form>
    </div>
  );
};

export default StudentProfileForm;
