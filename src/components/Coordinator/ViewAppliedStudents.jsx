import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import './ViewCompanies.css';
import { saveAs } from 'file-saver';

const ViewAppliedStudents = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [appliedStudents, setAppliedStudents] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'companies'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies.');
      }
    };

    fetchCompanies();
  }, []);

  // Fetch students for selected company
  const handleViewStudents = async (companyId, companyName) => {
  setSelectedCompanyId(companyId);
  setSelectedCompanyName(companyName);

  try {
    const studentsSnapshot = await getDocs(
      collection(db, `companies/${companyId}/appliedStudents`)
    );

    const studentData = await Promise.all(
      studentsSnapshot.docs.map(async (studentDoc) => {
        const studentId = studentDoc.id;

        // ✅ Fetch from 'profiles' instead of 'users'
        const profileRef = doc(db, 'profiles', studentId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          return {
            id: studentId,
            name: profileData.name || 'N/A',
            email: profileData.email || 'N/A',
            department: profileData.department || 'N/A',
          };
        } else {
          return {
            id: studentId,
            name: 'Unknown',
            email: 'N/A',
            department: 'N/A',
          };
        }
      })
    );

    setAppliedStudents(studentData);
    setMessage('');
    setError('');
  } catch (err) {
    console.error('Error fetching applied students:', err);
    setError('Failed to load applied students.');
    setAppliedStudents([]);
  }
};


  // Export to CSV
  const exportToCSV = () => {
    if (appliedStudents.length === 0) return;

    const headers = ['Student ID', 'Name', 'Email', 'Department'];
    const rows = appliedStudents.map((student) => [
      student.id,
      student.name || 'N/A',
      student.email || 'N/A',
      student.department || 'N/A',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((item) => `"${item}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${selectedCompanyName}_Applied_Students.csv`);
  };

  return (
    <div className="view-companies-container">
      <h2 style={{ color: 'black' }}>Applied Students List</h2>

      {message && (
        <div className="success-message">
          {message}
          <button onClick={() => setMessage('')} className="close-btn">×</button>
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {companies.map((company) => (
        <div key={company.id} className="company-card">
          <h4>{company.name}</h4>
          <p>Designation: {company.designation}</p>
          <button onClick={() => handleViewStudents(company.id, company.name)}>
            View Applied Students
          </button>
        </div>
      ))}

      {selectedCompanyId && (
        <div className="students-list">
          <h3>
            Applied Students for <span style={{ color: '#0077cc' }}>{selectedCompanyName}</span>
          </h3>
          {appliedStudents.length > 0 ? (
            <>
              <button className="download-btn" onClick={exportToCSV}>Download CSV</button>
              <ul>
                {appliedStudents.map((student) => (
                  <li key={student.id}>
                    <strong>{student.name}</strong> — {student.email} ({student.department})
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No students have applied yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewAppliedStudents;
