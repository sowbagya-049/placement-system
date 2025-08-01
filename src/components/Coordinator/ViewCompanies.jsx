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
  const [editData, setEditData] = useState({
    name: '',
    about: '',
    website: '',
    designation: '',
    ctc: '',
    bond: 'No',
    block: 'No',
    location: '',
    jobType: 'Non-Dream',
    openingFor: '',
    maxCgpa: '',
    minArrears: '',
    rounds: ''
  });
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
    const {
      name, about, website, designation, ctc,
      bond, block, location, jobType,
      openingFor, maxCgpa, minArrears, rounds
    } = editData;

    if (!name || !designation || !maxCgpa || !minArrears || !rounds) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await updateDoc(doc(db, 'companies', editId), {
        name: name.trim(),
        about: about.trim(),
        website: website.trim(),
        designation: designation.trim(),
        ctc: ctc.trim(),
        bond,
        block,
        location: location.trim(),
        jobType,
        openingFor: openingFor.trim(),
        eligibility: {
          maxCgpa: parseFloat(maxCgpa),
          minArrears: parseInt(minArrears)
        },
        rounds: parseInt(rounds)
      });

      await logAction('edited_company', { id: editId, ...editData });
      setEditId(null);
      setEditData({
        name: '',
        about: '',
        website: '',
        designation: '',
        ctc: '',
        bond: 'No',
        block: 'No',
        location: '',
        jobType: 'Non-Dream',
        openingFor: '',
        maxCgpa: '',
        minArrears: '',
        rounds: ''
      });

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
      about: company.about || '',
      website: company.website || '',
      designation: company.designation || '',
      ctc: company.ctc || '',
      bond: company.bond || 'No',
      block: company.block || 'No',
      location: company.location || '',
      jobType: company.jobType || 'Non-Dream',
      openingFor: company.openingFor || '',
      maxCgpa: company.eligibility?.maxCgpa?.toString() || '',
      minArrears: company.eligibility?.minArrears?.toString() || '',
      rounds: company.rounds?.toString() || ''
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
      <h2 style={{ color: 'black' }}>Company List</h2>

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
              <input type="text" placeholder="Company Name" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
              <textarea placeholder="About" value={editData.about} onChange={e => setEditData({ ...editData, about: e.target.value })} />
              <input type="url" placeholder="Website" value={editData.website} onChange={e => setEditData({ ...editData, website: e.target.value })} />
              <input type="text" placeholder="Designation" value={editData.designation} onChange={e => setEditData({ ...editData, designation: e.target.value })} />
              <input type="text" placeholder="CTC" value={editData.ctc} onChange={e => setEditData({ ...editData, ctc: e.target.value })} />
              <label>Bond</label>
              <select value={editData.bond} onChange={e => setEditData({ ...editData, bond: e.target.value })}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <label>Block</label>
              <select value={editData.block} onChange={e => setEditData({ ...editData, block: e.target.value })}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <input type="text" placeholder="Location" value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} />
              <label>Job Type</label>
              <select value={editData.jobType} onChange={e => setEditData({ ...editData, jobType: e.target.value })}>
                <option value="Zero">Zero</option>
                <option value="Dream">Dream</option>
                <option value="Non-Dream">Non-Dream</option>
              </select>
              <input type="text" placeholder="Opening For" value={editData.openingFor} onChange={e => setEditData({ ...editData, openingFor: e.target.value })} />
              <input type="number" placeholder="Max CGPA" value={editData.maxCgpa} onChange={e => setEditData({ ...editData, maxCgpa: e.target.value })} />
              <input type="number" placeholder="Min Arrears" value={editData.minArrears} onChange={e => setEditData({ ...editData, minArrears: e.target.value })} />
              <input type="number" placeholder="No. of Rounds" value={editData.rounds} onChange={e => setEditData({ ...editData, rounds: e.target.value })} />
              <button className="save-btn" onClick={saveEdit}>Save</button>
            </div>
          ) : (
            <>
              <h4>{company.name}</h4>
              <p>Min CGPA: {company.eligibility?.maxCgpa}</p>
              <p>Max Arrears: {company.eligibility?.minArrears}</p>
              <p>Job: {company.designation}</p>
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
