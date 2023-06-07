import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import "./Test.css";
import Navigation from "../../components/Navigation/Navigation";
import Papa from "papaparse";
import { collection, doc, getDoc, query, onSnapshot } from "firebase/firestore";

function PatientTestPage() {
  const { patientId } = useParams();
  const [tests, setTests] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      const testsCollectionRef = collection(db, "patients", patientId, "tests");
      const testsQuery = query(testsCollectionRef);

      const unsubscribe = onSnapshot(testsQuery, (snapshot) => {
        const testList = snapshot.docs.map((doc) => ({
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
      const patientDocRef = doc(db, "patients", patientId);
      const patientDoc = await getDoc(patientDocRef);

      if (patientDoc.exists()) {
        const patientData = patientDoc.data();
        setPatientName(patientData.name);
      }
    };

    fetchTests();
    fetchPatientName();
  }, [patientId]);

  const routeToReport = (testId) => {
    console.log(testId);
    window.location.href = `/report/${patientId}/${testId}`;
  };

  const routeToPatients = () => {
    window.location.href = "/patient";
  };
  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.addEventListener("change", function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        const fileContent = e.target.result;

        Papa.parse(fileContent, {
          complete: function (results) {
            const data = results.data;
            const headerRow = data[0];
            const pulseRateIndex = headerRow.indexOf("Pulse Rate");
            const oxygenLevelIndex = headerRow.indexOf("Oxygen Level");
            const motionIndex = headerRow.indexOf("Motion");
            const timestampIndex = headerRow.indexOf("Time");
            const dateIndex = headerRow.indexOf("Date");

            // Extracting the columns
            const pulseRateColumn = data
              .slice(1)
              .map((row) => handleNaN(Number(row[pulseRateIndex])));
            const oxygenLevelColumn = data
              .slice(1)
              .map((row) => handleNaN(Number(row[oxygenLevelIndex])));
            const motionColumn = data
              .slice(1)
              .map((row) => handleNaN(Number(row[motionIndex])));
            const timestampColumn = data
              .slice(1)
              .map((row) => row[timestampIndex]);
            const dateColumn = data.slice(1).map((row) => row[dateIndex]);

            function handleNaN(value) {
              return isNaN(value) ? 0 : value;
            }
          },
        });
        setFileUploaded(true);
      };
      reader.readAsText(file);
    });
    input.click();
  };

  return (
    <div>
      <Navigation />
      <h1 className="pageheader">Patient: {patientName}</h1>
      <button id="file-input" onClick={handleFileImport}>
        Import CSV File
      </button>
      {tests.length === 0 ? (
        <h2 className="loading">Loading tests...</h2>
      ) : (
        <div>
          <table className="testtable">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>DateTime</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>{test.datetime}</td>
                  <td>
                    <button
                      variant="primary"
                      className="view"
                      onClick={(e) => routeToReport(test.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="currentColor"
                        class="bi bi-view-list"
                        viewBox="0 0 22 18"
                      >
                        <path d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z" />
                      </svg>
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            variant="primary"
            className="back"
            onClick={(e) => routeToPatients()}
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
            Back to Patients
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientTestPage;
