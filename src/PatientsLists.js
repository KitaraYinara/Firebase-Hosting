import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function PatientsList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const patientsCollectionRef = collection(db, 'patients');
      const patientsQuery = query(patientsCollectionRef);

      const unsubscribe = onSnapshot(patientsQuery, snapshot => {
        const patientList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPatients(patientList);
      });

      return () => {
        unsubscribe(); 
      };
    };

    fetchPatients();
  }, []);

  return (
    <div>
      <h1>Patients List</h1>
      {patients.length === 0 ? (
        <p>Loading patients...</p>
      ) : (
        <table className="centered-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>
                  <Link to={`/patients/${patient.id}/tests`}>Show Tests</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientsList;
