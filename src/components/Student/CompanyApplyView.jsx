import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import './CompanyApplyView.css';

const CompanyApplyView = () => {
  const [companies, setCompanies] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [appliedCompanyIds, setAppliedCompanyIds] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch student profile
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      setStudentProfile(profileSnap.data());

      // Fetch companies
      const companySnap = await getDocs(collection(db, 'companies'));
      const companyList = companySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(companyList);

      // Fetch already applied companies
      const appliedSnap = await getDocs(collection(db, `appliedCompanies/${user.uid}/companies`));
      const appliedIds = appliedSnap.docs.map(doc => doc.id);
      setAppliedCompanyIds(appliedIds);
    };

    fetchData();
  }, [user]);

  const isEligible = (company) => {
    const { cgpa, arrears } = studentProfile || {};
    return (
      parseFloat(cgpa) >= parseFloat(company.minCgpa || 0) &&
      parseInt(arrears || 0) <= parseInt(company.maxArrears || 0)
    );
  };

  const handleApply = async (companyId) => {
    if (!user) return;

    await setDoc(doc(db, `companies/${companyId}/appliedStudents`, user.uid), {
      studentId: user.uid,
    });

    await setDoc(doc(db, `appliedCompanies/${user.uid}/companies`, companyId), {
      companyId: companyId,
    });

    setAppliedCompanyIds(prev => [...prev, companyId]);
    alert("Applied successfully!");
  };

  return (
    <div className="company-view-container">
      <h3 className="company-title">Available Companies</h3>
      <div className="company-list">
        {companies.map(company => {
          const alreadyApplied = appliedCompanyIds.includes(company.id);
          const eligible = isEligible(company);

          return (
            <div key={company.id} className="company-card">
              <h4>{company.name}</h4>
              <p><strong>Required CGPA:</strong> {company.minCgpa}</p>
              <p><strong>Max Arrears Allowed:</strong> {company.maxArrears}</p>

              <button
                className="apply-btn"
                onClick={() => handleApply(company.id)}
                disabled={alreadyApplied || !eligible}
              >
                {alreadyApplied ? 'Applied' : eligible ? 'Apply' : 'Not Eligible'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompanyApplyView;
