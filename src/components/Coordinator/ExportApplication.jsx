import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import * as XLSX from 'xlsx';

const ExportApplications = () => {
  const [companies, setCompanies] = useState([]);

  const fetchCompanies = async () => {
    const snapshot = await getDocs(collection(db, 'companies'));
    setCompanies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const exportToExcel = async (companyId, companyName) => {
    const snap = await getDocs(collection(db, `companies/${companyId}/appliedStudents`));
    const students = snap.docs.map(doc => doc.data());

    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applied Students');
    XLSX.writeFile(workbook, `${companyName}-Applicants.xlsx`);
  };

  return (
    <div>
      <h3>Export Applications</h3>
      {companies.map((c) => (
        <div key={c.id} style={{ marginBottom: '10px' }}>
          <span>{c.name}</span>
          <button onClick={() => exportToExcel(c.id, c.name)} style={{ marginLeft: '10px' }}>Export</button>
        </div>
      ))}
    </div>
  );
};

export default ExportApplications;
