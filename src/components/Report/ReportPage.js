import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, doc, getDoc, query, onSnapshot } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function ReportPage() {
  const { patientId, testId } = useParams();
  const [sensorData, setSensorData] = useState([]);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const fetchSensorData = () => {
      const sensorsCollectionRef = collection(
        db,
        "patients",
        patientId,
        "tests",
        testId,
        "sensors"
      );
      const sensorsQuery = query(sensorsCollectionRef);

      const unsubscribe = onSnapshot(sensorsQuery, (snapshot) => {
        const sensorDataList = snapshot.docs.map((doc) => ({
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
      const patientDocRef = doc(db, "patients", patientId);
      const patientDoc = await getDoc(patientDocRef);

      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        setPatientName(patientData.name);
      }
    };

    fetchSensorData();
    fetchPatientName();
  }, [patientId, testId]);
  const routeToTests = () => {
    window.location.href = `/patients/${patientId}/tests`;
  };
  const routeToMainReport = () => {
    window.location.href = `/mainreport/${patientId}/${testId}`;
  };
  return (
    <>
      <div>
        <h1 className="pageheader">
          Report for Patient: {patientName}, Test ID: {testId}
        </h1>
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
      </div>{" "}
      <button
        variant="primary"
        className="back"
        onClick={(e) => routeToTests()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="currentColor"
          class="bi bi-arrow-return-left"
          viewBox="0 0 22 18"
        >
          <path
            fill-rule="evenodd"
            d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"
          />
        </svg>
        Back to Tests
      </button>
      <button
        variant="primary"
        className="view"
        onClick={(e) => routeToMainReport()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="currentColor"
          class="bi bi-arrow-right"
          viewBox="0 0 22 18"
        >
          <path
            fill-rule="evenodd"
            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
          />
        </svg>
        Main Report
      </button>
    </>
  );
}

export default ReportPage;
