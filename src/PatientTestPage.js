import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';

function PatientTestPage() {
  const { patientId } = useParams();
  const [tests, setTests] = useState([]);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      const testsCollectionRef = collection(db, 'patients', patientId, 'tests');
      const testsQuery = query(testsCollectionRef);

      const unsubscribe = onSnapshot(testsQuery, snapshot => {
        const testList = snapshot.docs.map(doc => ({
          id: doc.id,
          datetime: doc.data().datetime.toDate().toLocaleString(),
        }));
        setTests(testList);
      });

      return () => {
        unsubscribe(); 
      };
    };

    const fetchPatientName = async () => {
      const patientDocRef = doc(db, 'patients', patientId);
      const patientDoc = await getDoc(patientDocRef);

      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        setPatientName(patientData.name);
      }
    };

    fetchTests();
    fetchPatientName();
  }, [patientId]);

  return (
    <div>
      <h1>Tests for Patient: {patientName}</h1>
      {tests.length === 0 ? (
        <p>Loading tests...</p>
      ) : (
        <table className="centered-table">
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Date taken</th>
              <th>Actions</th> 
            </tr>
          </thead>
          <tbody>
            {tests.map(test => (
              <tr key={test.id}>
                <td>{test.id}</td>
                <td>{test.datetime}</td>
                <td>
                  <Link to={`/report/${patientId}/${test.id}`}>Show Report</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientTestPage;
