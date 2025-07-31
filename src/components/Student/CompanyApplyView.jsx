import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import './CompanyApplyView.css'; // Add this import

const CompanyApplyView = () => {
  const [companies, setCompanies] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      setStudentProfile(profileSnap.data());

      const companySnap = await getDocs(collection(db, 'companies'));
      const companyList = companySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(companyList);
    };
    if (user) fetchData();
  }, [user]);

  const isEligible = (company) => {
    const { cgpa, arrears } = studentProfile || {};
    return (
      parseFloat(cgpa) >= parseFloat(company.minCgpa || 0) &&
      parseInt(arrears || 0) <= parseInt(company.maxArrears || 0)
    );
  };

  const handleApply = async (companyId) => {
    await setDoc(doc(db, `companies/${companyId}/appliedStudents`, user.uid), {
      studentId: user.uid,
    });

    await setDoc(doc(db, `appliedCompanies/${user.uid}/companies`, companyId), {
      companyId: companyId,
    });

    alert("Applied successfully!");
  };

  return (
    <div className="company-view-container">
      <h3 className="company-title">Available Companies</h3>
      <div className="company-list">
        {companies.map(company => (
          <div key={company.id} className="company-card">
            <h4>{company.name}</h4>
            <p><strong>Required CGPA:</strong> {company.minCgpa}</p>
            <p><strong>Max Arrears Allowed:</strong> {company.maxArrears}</p>
            <button
              className="apply-btn"
              onClick={() => handleApply(company.id)}
              disabled={!studentProfile || !isEligible(company)}
            >
              {isEligible(company) ? 'Apply' : 'Not Eligible'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyApplyView;
