import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import "./Test.css";
import Navigation from "../../components/Navigation/Navigation";
import Papa from "papaparse";
import * as tf from "@tensorflow/tfjs";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  onSnapshot,
} from "firebase/firestore";

function PatientTestPage() {
  const { patientId } = useParams();
  const [tests, setTests] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [model, setModel] = useState();

  const [testsWithoutPredictions, setTestsWithoutPredictions] = useState([]);
  const classes = ["BadOSA", "Healthy", "HeartFailure", "Parkinson"];

  useEffect(() => {
    const fetchTests = async () => {
      const testsCollectionRef = collection(db, "patients", patientId, "tests");
      const testsQuery = query(testsCollectionRef);

      const unsubscribe = onSnapshot(testsQuery, (snapshot) => {
        const testList = snapshot.docs.map((doc) => ({
          id: doc.id,
          datetime: doc.data().datetime.toDate().toLocaleString(),
          prediction: doc.data().prediction,
        }));
        setTests(testList);

        const testsWithoutPred = testList
          .filter((test) => !test.prediction)
          .map((test) => test.id);
        setTestsWithoutPredictions(testsWithoutPred);
      });

      return () => {
        unsubscribe();
      };
    };

    const loadModel = async () => {
      try {
        const model = await tf.loadLayersModel(
          "https://raw.githubusercontent.com/Abhi4201790/JSON-hosting/main/model.json"
        );
        setModel(model);
        console.log("Model loaded:", model);
        console.log("Model summary:");
        model.summary();

        console.log("Model weights loaded");
      } catch (error) {
        console.error("Error loading model:", error);
      }
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
    loadModel();
  }, [patientId]);

  const makePredictionCSV = (data, alldata) => {
    console.log("Making prediction:", data);
    var predictedLabels = [];
    var classes = ["BadOSA", "Healthy", "HeartFailure", "Parkinson"];
    for (var i = 0; i < data.length; i++) {
      var input = tf.tensor2d(data[i], [1, 3]);
      var predictions = model.predict(input);
      var predictedProbabilities = predictions.array();
      console.log("Predictions for row", i + 1, ":", predictedProbabilities);

      // Get the predicted class for the row
      var predictedClass = tf.argMax(predictions, 1).dataSync()[0];

      // Map the predicted class index to the actual class label
      var predictedLabel = classes[predictedClass];
      predictedLabels.push(predictedLabel);

      console.log("Predicted label for row", i + 1, ":", predictedLabel);

      // Dispose the tensors to free up memory
      input.dispose();
      predictions.dispose();
    }
    // Determine the class with the highest occurrence
    var counts = {};
    var maxCount = 0;
    var predictedClass;

    for (var j = 0; j < predictedLabels.length; j++) {
      var label = predictedLabels[j];
      counts[label] = counts[label] ? counts[label] + 1 : 1;

      if (counts[label] > maxCount) {
        maxCount = counts[label];
        predictedClass = label;
      }
    }

    // Display the predicted class on the website
    console.log("Predicted class is: " + predictedClass);
    addTest(alldata, predictedClass);
  };

  const makePrediction = async (testId) => {
    try {
      // Fetch the sensor data for the specific test ID from Firestore
      const sensorsCollectionRef = collection(
        db,
        "patients",
        patientId,
        "tests",
        testId,
        "sensors"
      );
      const sensorsQuery = query(sensorsCollectionRef);
      const sensorsSnapshot = await getDocs(sensorsQuery);
      const sensorData = sensorsSnapshot.docs.map((doc) => doc.data());

      // Prepare the input data for prediction
      const selectedData = sensorData.map((element) => [
        parseFloat(element.bpm || 0),
        parseFloat(element.spO2 || 0),
        parseFloat(element.motion || 0),
      ]);

      // Convert the input data to a tensor
      const inputTensor = tf.tensor2d(selectedData, [sensorData.length, 3]);

      // Make predictions using the loaded model
      const predictions = model.predict(inputTensor);
      const predictedProbabilities = await predictions.array();

      // Determine the predicted class for each row of data
      const predictedClasses = predictedProbabilities.map((probs) => {
        const predictedClass = tf.argMax(probs).dataSync()[0];
        return classes[predictedClass];
      });

      // Determine the most common predicted class
      const predictedClass = mode(predictedClasses);

      // Update Firestore with the predicted class
      const testDocRef = doc(db, "patients", patientId, "tests", testId);
      await updateDoc(testDocRef, { prediction: predictedClass });

      // Remove the test ID from the state
      setTestsWithoutPredictions((prevTests) =>
        prevTests.filter((test) => test !== testId)
      );
    } catch (error) {
      console.error("Error making prediction:", error);
    }
  };
  function mode(array) {
    const frequency = {};
    let maxCount = 0;
    let modeValue = null;

    for (const item of array) {
      frequency[item] = (frequency[item] || 0) + 1;

      if (frequency[item] > maxCount) {
        maxCount = frequency[item];
        modeValue = item;
      }
    }

    return modeValue;
  }

  const deleteTest = (id) => {
    const testDoc = doc(db, "patients", patientId, "tests", id);
    console.log(testDoc);
    deleteDoc(testDoc);
  };

  const addTest = (newTest, predictedClass) => {
    const testsCollectionRef = doc(
      collection(db, "patients", patientId, "tests")
    );
    // const testDateTime = newTest[1][0] + " " + newTest[1][1];
    console.log(newTest[0]["Time"]);
    const testDateTime = newTest[0]["Time"];
    console.log(testDateTime);
    const d = new Date(testDateTime);
    const test = {
      datetime: d,
      prediction: predictedClass,
    };
    console.log(testsCollectionRef.id);
    setDoc(testsCollectionRef, test);
    const AddSensor = (data, testId) => {
      console.log(data);
      console.log(testId);
      const sensorCollectionRef = collection(
        db,
        "patients",
        patientId,
        "tests",
        testId,
        "sensors"
      );
      data.forEach((element) => {
        if (element != "") {
          console.log(element);
          // const datetime = element[0] + " " + element[1];
          const datetime = element["Time"];
          console.log(datetime);
          const d = new Date(datetime);
          const snsr = {
            bpm: element["Pulse Rate"],
            motion: element["Motion"],
            spO2: element["Oxygen Level"],
            timestamp: d,
          };
          addDoc(sensorCollectionRef, snsr);
        }
      });
    };
    AddSensor(newTest, testsCollectionRef.id);
  };
  const routeToReport = (testId) => {
    console.log(testId);
    window.location.href = `/graph/${patientId}/${testId}`;
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
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            const data = results.data;
            if (data.length > 0) {
              const selectedData = data.map((row) => [
                parseFloat(row["Pulse Rate"] || 0),
                parseFloat(row["Oxygen Level"] || 0),
                parseFloat(row["Motion"] || 0),
              ]);
              makePredictionCSV(selectedData, data);
            }
          },
          error: (err) => console.log("ERROR", err),
        });
      };
      reader.readAsText(file);
    });
    input.click();
  };

  return (
    <div>
      <Navigation />
      <h1 className="pageheader">Patient: {patientName}</h1>
      <label for="file-input" class="custom-file-upload">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="24"
          fill="currentColor"
          class="bi bi-filetype-csv"
          viewBox="0 0 22 18"
        >
          <path
            fill-rule="evenodd"
            d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM3.517 14.841a1.13 1.13 0 0 0 .401.823c.13.108.289.192.478.252.19.061.411.091.665.091.338 0 .624-.053.859-.158.236-.105.416-.252.539-.44.125-.189.187-.408.187-.656 0-.224-.045-.41-.134-.56a1.001 1.001 0 0 0-.375-.357 2.027 2.027 0 0 0-.566-.21l-.621-.144a.97.97 0 0 1-.404-.176.37.37 0 0 1-.144-.299c0-.156.062-.284.185-.384.125-.101.296-.152.512-.152.143 0 .266.023.37.068a.624.624 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.2-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.551.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.122.524.082.149.2.27.352.367.152.095.332.167.539.213l.618.144c.207.049.361.113.463.193a.387.387 0 0 1 .152.326.505.505 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.249.07-.413.07-.117 0-.223-.013-.32-.04a.838.838 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM.806 13.693c0-.248.034-.46.102-.633a.868.868 0 0 1 .302-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.441 1.441 0 0 0-.489-.272 1.838 1.838 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879l-1.327 4Z"
          />
        </svg>
        Upload CSV
      </label>
      <input
        type="file"
        id="file-input"
        // className="csvinput"
        onClick={handleFileImport}
      />

      {tests.length === 0 ? (
        <h2 className="loading"style={{ color: 'black' }}>Loading Tests...</h2> 
      ) : (
        <div>
          <table className="testtable">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>DateTime</th>
                <th>AI Prediction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>{test.datetime}</td>
                  <td>
                    {test.prediction ? (
                      test.prediction
                    ) : (
                      <button
                        onClick={(e) => makePrediction(test.id)}
                        className="predict"
                      >
                        Predict
                      </button>
                    )}
                  </td>
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
                    <button
                      variant="danger"
                      className="delete"
                      onClick={(e) => deleteTest(test.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="currentColor"
                        class="bi bi-trash"
                        viewBox="0 0 22 18"
                      >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                      </svg>
                      Delete
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
