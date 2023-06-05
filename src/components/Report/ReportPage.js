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
import ExcelJS from "exceljs";
import "./ReportPage.css";

function ReportPage() {
  const { patientId, testId } = useParams();
  const [sensorData, setSensorData] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [showAllData, setShowAllData] = useState(false);
  const [abnormalBPM, setAbnormalBPM] = useState([]);
  const [abnormalSpO2, setAbnormalSpO2] = useState([]);
  const [showAbnormalValues, setShowAbnormalValues] = useState(false);
  const handleShowAbnormalValues = () => {
    setShowAbnormalValues(!showAbnormalValues);
  };

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
        const sensorDataList = snapshot.docs
          .map((doc) => ({
            timestamp: doc.data().timestamp.toDate(),
            bpm: doc.data().bpm,
            spO2: doc.data().spO2,
            motion: doc.data().motion,
          }))
          .sort((a, b) => a.timestamp - b.timestamp); // Sort the sensor data by timestamp

        const abnormalBPMData = sensorDataList.filter(
          (data) => data.bpm < 40 || data.bpm > 50
        );
        const abnormalSpO2Data = sensorDataList.filter(
          (data) => data.spO2 < 95 || data.spO2 > 100
        );

        setAbnormalBPM(abnormalBPMData);
        setAbnormalSpO2(abnormalSpO2Data);

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

  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Date", "Time", "Pulse Rate", "Oxygen Level", "Motion"], // Updated column names
        ...sensorData.map((data) => [
          data.timestamp.toLocaleDateString(), // Get only the date part
          data.timestamp.toLocaleTimeString(), // Get only the time part
          data.bpm,
          data.spO2,
          data.motion,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SensorData_Test${testId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(timestamp).toLocaleString(undefined, options);
  };

  const startIdx = currentPage * pageSize;
  const endIdx = startIdx + pageSize;
  const currentPageData = sensorData.slice(startIdx, endIdx);
  const maxPage = Math.floor((sensorData.length - 1) / pageSize);
  const routeToTests = () => {
    window.location.href = `/patients/${patientId}/tests`;
  };
  const routeToMainReport = () => {
    window.location.href = `/mainreport/${patientId}/${testId}`;
  };
  return (
    <div>
      <h1 className="pageheader">
        Report for Patient: {patientName}, Test ID: {testId}
      </h1>
      <button className="report-btn" onClick={handleDownloadCSV}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="currentColor"
          class="bi bi-filetype-csv"
          viewBox="0 0 20 18"
        >
          <path
            fill-rule="evenodd"
            d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM3.517 14.841a1.13 1.13 0 0 0 .401.823c.13.108.289.192.478.252.19.061.411.091.665.091.338 0 .624-.053.859-.158.236-.105.416-.252.539-.44.125-.189.187-.408.187-.656 0-.224-.045-.41-.134-.56a1.001 1.001 0 0 0-.375-.357 2.027 2.027 0 0 0-.566-.21l-.621-.144a.97.97 0 0 1-.404-.176.37.37 0 0 1-.144-.299c0-.156.062-.284.185-.384.125-.101.296-.152.512-.152.143 0 .266.023.37.068a.624.624 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.2-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.551.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.122.524.082.149.2.27.352.367.152.095.332.167.539.213l.618.144c.207.049.361.113.463.193a.387.387 0 0 1 .152.326.505.505 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.249.07-.413.07-.117 0-.223-.013-.32-.04a.838.838 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM.806 13.693c0-.248.034-.46.102-.633a.868.868 0 0 1 .302-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.441 1.441 0 0 0-.489-.272 1.838 1.838 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879l-1.327 4Z"
          />
        </svg>
        Download CSV
      </button>
      <button className="report-btn" onClick={handleShowAbnormalValues}>
        {showAbnormalValues ? "Hide Abnormal Values" : "Show Abnormal Values"}
      </button>
      {showAbnormalValues && (
        <div>
          {abnormalBPM.length > 0 && (
            <div>
              <h2 className="abnormal-bpm">Abnormal BPM Values:</h2>
              <ul>
                {abnormalBPM.map((data) => (
                  <li className="abnormal-bpm" key={data.timestamp}>
                    Timestamp: {data.timestamp.toLocaleString()} - BPM:{" "}
                    {data.bpm}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {abnormalSpO2.length > 0 && (
            <div>
              <h2 className="abnormal-spO2">Abnormal SpO2 Values:</h2>
              <ul>
                {abnormalSpO2.map((data) => (
                  <li className="abnormal-spO2" key={data.timestamp}>
                    Timestamp: {data.timestamp.toLocaleString()} - SpO2:{" "}
                    {data.spO2}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {!showAllData && (
        <button className="report-btn" onClick={handleShowAllData}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            class="bi bi-graph-up"
            viewBox="0 0 20 18"
          >
            <path
              fill-rule="evenodd"
              d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"
            />
          </svg>
          Show All Data
        </button>
      )}
      {showAllData && (
        <button className="report-btn" onClick={handleGoBack}>
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
          Back
        </button>
      )}
      {sensorData.length === 0 ? (
        <p>Loading sensor data...</p>
      ) : (
        <div>
          {showAllData ? (
            <div className="line-chart-container">
              <LineChart width={1900} height={800} data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bpm"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="spO2"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="motion"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </div>
          ) : (
            <div className="line-chart-container">
              <LineChart width={1900} height={800} data={currentPageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bpm"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="spO2"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="motion"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </div>
          )}
          <div>
            <button
              className="graph-btn"
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 0}
            >
              Prev
            </button>
            <button
              className="graph-btn"
              onClick={() => handlePageChange("next")}
              disabled={currentPage === maxPage}
            >
              Next
            </button>
          </div>
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
              class="bi bi-view-list"
              viewBox="0 0 20 18"
            >
              <path d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z" />
            </svg>
            Main Report
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportPage;
