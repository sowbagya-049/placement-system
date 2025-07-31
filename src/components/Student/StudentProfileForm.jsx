import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  const user = auth.currentUser;

  useEffect(() => {
    const checkProfile = async () => {
      const profileRef = doc(db, 'profiles', user?.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) onComplete();
    };
    if (user) checkProfile();
  }, [user, onComplete]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, 'profiles', user.uid), formData);
    onComplete();
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
              placeholder={`Enter your ${key.replace(/([A-Z])/g, ' ').toLowerCase()}`}
              value={formData[key]}
              onChange={handleChange}
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
