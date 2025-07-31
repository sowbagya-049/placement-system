import React, { useState } from "react";
import AddCompanyForm from "../components/Coordinator/AddCompanyForm";
import ViewCompanies from "../components/Coordinator/ViewCompanies";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import './CoordinatorDashboard.css';

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('add');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="coordinator-dashboard">
      <header className="coordinator-header">
        <h2>Coordinator Dashboard</h2>
        <nav className="coordinator-nav">
          <button
            className={activeTab === 'add' ? 'active' : ''}
            onClick={() => setActiveTab('add')}
          >
            Add Company
          </button>
          <button
            className={activeTab === 'view' ? 'active' : ''}
            onClick={() => setActiveTab('view')}
          >
            View Companies
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="coordinator-main">
        {activeTab === 'add' && <AddCompanyForm />}
        {activeTab === 'view' && <ViewCompanies />}
      </main>
    </div>
  );
};

export default CoordinatorDashboard;
