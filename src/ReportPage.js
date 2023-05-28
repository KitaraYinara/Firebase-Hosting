import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { collection, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function ReportPage() {
  const { patientId, testId } = useParams();
  const [sensorData, setSensorData] = useState([]);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const fetchSensorData = () => {
      const sensorsCollectionRef = collection(db, 'patients', patientId, 'tests', testId, 'sensors');
      const sensorsQuery = query(sensorsCollectionRef);

      const unsubscribe = onSnapshot(sensorsQuery, snapshot => {
        const sensorDataList = snapshot.docs.map(doc => ({
          timestamp: doc.data().timestamp.toDate().toLocaleString(),
          bpm: doc.data().bpm,
          spO2: doc.data().spO2,
          motion: doc.data().motion,
        }));
        setSensorData(sensorDataList);
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

    fetchSensorData();
    fetchPatientName();
  }, [patientId, testId]);

  return (
    <div>
      <h1>Report for Patient: {patientName}, Test ID: {testId}</h1>
      {sensorData.length === 0 ? (
        <p>Loading sensor data...</p>
      ) : (
        <LineChart width={1900} height={800} data={sensorData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="bpm" stroke="#8884d8" />
          <Line type="monotone" dataKey="spO2" stroke="#82ca9d" />
          <Line type="monotone" dataKey="motion" stroke="#ffc658" />
        </LineChart>
      )}
    </div>
  );
}

export default ReportPage;
