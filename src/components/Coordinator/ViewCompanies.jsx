import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './ViewCompanies.css'; // 👈 CSS file

const ViewCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', minCgpa: '', maxArrears: '' });

  const fetchCompanies = async () => {
    const snap = await getDocs(collection(db, 'companies'));
    setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const logAction = async (action, data) => {
    await addDoc(collection(db, 'actions'), {
      action,
      data,
      timestamp: Timestamp.now()
    });
  };

  const deleteCompany = async (id) => {
    const companyToDelete = companies.find(c => c.id === id);
    await deleteDoc(doc(db, 'companies', id));
    await logAction('deleted_company', companyToDelete);
    fetchCompanies();
  };

  const startEdit = (company) => {
    setEditId(company.id);
    setEditData({ name: company.name, minCgpa: company.minCgpa, maxArrears: company.maxArrears });
  };

  const saveEdit = async () => {
    await updateDoc(doc(db, 'companies', editId), editData);
    await logAction('edited_company', { id: editId, ...editData });
    setEditId(null);
    fetchCompanies();
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="view-companies-container">
      <h2>Company List</h2>
      {companies.map(company => (
        <div key={company.id} className="company-card">
          {editId === company.id ? (
            <div className="edit-form">
              <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="Company Name" />
              <input value={editData.minCgpa} onChange={e => setEditData({ ...editData, minCgpa: e.target.value })} placeholder="Min CGPA" />
              <input value={editData.maxArrears} onChange={e => setEditData({ ...editData, maxArrears: e.target.value })} placeholder="Max Arrears" />
              <button className="save-btn" onClick={saveEdit}>Save</button>
            </div>
          ) : (
            <>
              <h4>{company.name}</h4>
              <p>Min CGPA: {company.minCgpa}</p>
              <p>Max Arrears: {company.maxArrears}</p>
              <div className="btn-group">
                <button className="delete-btn" onClick={() => deleteCompany(company.id)}>Delete</button>
                <button className="edit-btn" onClick={() => startEdit(company)}>Edit</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewCompanies;
