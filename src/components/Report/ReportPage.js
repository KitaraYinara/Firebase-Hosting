import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  query,
  onSnapshot,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ExcelJS from "exceljs";
import './ReportPage.css';

function ReportPage() {
  const { patientId, testId } = useParams();
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; 
  const [showAllData, setShowAllData] = useState(false);

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
          timestamp: doc.data().timestamp.toDate(), 
          bpm: doc.data().bpm,
          spO2: doc.data().spO2,
          motion: doc.data().motion,
        })).sort((a, b) => a.timestamp - b.timestamp); // Sort the sensor data by timestamp
        setSensorData(sensorDataList);
        setCurrentPage(0); 
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

  const handleDownloadExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sensor Data");
    const headers = ["Timestamp", "Pulse Rate", "Oxygen Level", "Motion"];
    worksheet.addRow(headers);

    sensorData.forEach((data) => {
      const row = [
        data.timestamp.toLocaleString(),
        data.bpm,
        data.spO2,
        data.motion,
      ];
      worksheet.addRow(row);
    });

    const fileName = `SensorData_Test${testId}.xlsx`;
    workbook.xlsx.writeBuffer().then((buffer) => {
      const data = new Blob([buffer], { type: "application/octet-stream" });

      if (navigator.msSaveBlob) {
        // For IE 10+
        navigator.msSaveBlob(data, fileName);
      } else {
        // For other browsers
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(data);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    });
  };

  const handleShowAllData = () => {
    setShowAllData(true);
  };

  const handleGoBack = () => {
    setShowAllData(false);
  };

  const handlePageChange = (direction) => {
    const maxPage = Math.floor((sensorData.length - 1) / pageSize);
    if (direction === "prev" && currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    } else if (direction === "next" && currentPage < maxPage) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); 
  };

  const startIdx = currentPage * pageSize;
  const endIdx = startIdx + pageSize;
  const currentPageData = sensorData.slice(startIdx, endIdx);
  const maxPage = Math.floor((sensorData.length - 1) / pageSize);

  return (
    <div>
      <h1>
        Report for Patient: {patientName}, Test ID: {testId}
      </h1>
      <button onClick={handleDownloadExcel}>Download Excel</button>
      {!showAllData && (
        <button onClick={handleShowAllData}>Show All Data</button>
      )}
      {showAllData && (
        <button onClick={handleGoBack}>Back</button>
      )}
      {sensorData.length === 0 ? (
        <p>Loading sensor data...</p>
      ) : (
        <div>
          {showAllData ? (
            <div className="line-chart-container">
              <LineChart width={1900} height={800} data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTimestamp} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bpm" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="spO2" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="motion" stroke="#ffc658" strokeWidth={2} dot={false} />
              </LineChart>
            </div>
          ) : (
            <div className="line-chart-container">
              <LineChart width={1900} height={800} data={currentPageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTimestamp} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bpm" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="spO2" stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="motion" stroke="#ffc658" strokeWidth={2} dot={false} />
              </LineChart>
            </div>
          )}
          <div>
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 0}
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === maxPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
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
    </>
  );
}

export default ReportPage;
