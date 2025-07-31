import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';

import StudentProfileForm from '../components/Student/StudentProfileForm';
import CompanyApplyView from '../components/Student/CompanyApplyView';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [profileComplete, setProfileComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const handleComplete = () => {
    setProfileComplete(true);
    setActiveTab('companies');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="student-dashboard">
      <header className="student-header">
        <h2>Student Dashboard</h2>
        <nav className="student-nav">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
            disabled={!profileComplete && activeTab !== 'profile'}
          >
            Profile
          </button>
          <button
            className={activeTab === 'companies' ? 'active' : ''}
            onClick={() => setActiveTab('companies')}
            disabled={!profileComplete}
          >
            Companies
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="student-main">
        {activeTab === 'profile' && (
          <StudentProfileForm onComplete={handleComplete} />
        )}
        {activeTab === 'companies' && profileComplete && <CompanyApplyView />}
      </main>
    </div>
  );
};

export default StudentDashboard;
