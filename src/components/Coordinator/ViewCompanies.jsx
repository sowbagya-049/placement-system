import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ViewCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', minCgpa: '', maxArrears: '' });

  const fetchCompanies = async () => {
    const snap = await getDocs(collection(db, 'companies'));
    setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const deleteCompany = async (id) => {
    await deleteDoc(doc(db, 'companies', id));
    fetchCompanies();
  };

  const startEdit = (company) => {
    setEditId(company.id);
    setEditData({ name: company.name, minCgpa: company.minCgpa, maxArrears: company.maxArrears });
  };

  const saveEdit = async () => {
    await updateDoc(doc(db, 'companies', editId), editData);
    setEditId(null);
    fetchCompanies();
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div>
      <h3>Company List</h3>
      {companies.map(company => (
        <div key={company.id} style={{ border: '1px solid gray', margin: '10px', padding: '10px' }}>
          {editId === company.id ? (
            <div>
              <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
              <input value={editData.minCgpa} onChange={e => setEditData({ ...editData, minCgpa: e.target.value })} />
              <input value={editData.maxArrears} onChange={e => setEditData({ ...editData, maxArrears: e.target.value })} />
              <button onClick={saveEdit}>Save</button>
            </div>
          ) : (
            <>
              <h4>{company.name}</h4>
              <p>Min CGPA: {company.minCgpa}</p>
              <p>Max Arrears: {company.maxArrears}</p>
              <button onClick={() => deleteCompany(company.id)}>Delete</button>
              <button onClick={() => startEdit(company)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewCompanies;
