import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import './ViewCompanies.css';

const ViewCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', minCgpa: '', maxArrears: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    try {
      const snap = await getDocs(collection(db, 'companies'));
      setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies.');
    }
  };

  const logAction = async (action, data) => {
    try {
      await addDoc(collection(db, 'actions'), {
        action,
        data,
        timestamp: Timestamp.now()
      });
    } catch (err) {
      console.error('Error logging action:', err);
    }
  };

  const deleteCompany = async (id) => {
    const companyToDelete = companies.find(c => c.id === id);
    const confirmDelete = window.confirm(`Are you sure you want to delete "${companyToDelete.name}"?`);

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'companies', id));
      await logAction('deleted_company', companyToDelete);
      setMessage('Company deleted successfully!');
      setError('');
      fetchCompanies();
    } catch (err) {
      console.error(err);
      setError('Failed to delete company.');
      setMessage('');
    }
  };

  const saveEdit = async () => {
    if (!editData.name || !editData.minCgpa || !editData.maxArrears) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await updateDoc(doc(db, 'companies', editId), {
        ...editData,
        minCgpa: parseFloat(editData.minCgpa),
        maxArrears: parseInt(editData.maxArrears)
      });
      await logAction('edited_company', { id: editId, ...editData });
      setEditId(null);
      setEditData({ name: '', minCgpa: '', maxArrears: '' });
      setMessage('Company updated successfully!');
      setError('');
      fetchCompanies();
    } catch (err) {
      console.error(err);
      setError('Failed to update company.');
      setMessage('');
    }
  };

  const startEdit = (company) => {
    setEditId(company.id);
    setEditData({
      name: company.name || '',
      minCgpa: company.minCgpa?.toString() || '',
      maxArrears: company.maxArrears?.toString() || ''
    });
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <div className="view-companies-container">
      <h2>Company List</h2>

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

      {companies.map(company => (
        <div key={company.id} className="company-card">
          {editId === company.id ? (
            <div className="edit-form">
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                placeholder="Company Name"
              />
              <input
                type="number"
                value={editData.minCgpa}
                onChange={e => setEditData({ ...editData, minCgpa: e.target.value })}
                placeholder="Min CGPA"
              />
              <input
                type="number"
                value={editData.maxArrears}
                onChange={e => setEditData({ ...editData, maxArrears: e.target.value })}
                placeholder="Max Arrears"
              />
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
