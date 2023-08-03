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
        Upload CSV
      </label>
      <input
        type="file"
        id="file-input"
        // className="csvinput"
        onClick={handleFileImport}
      />

      {tests.length === 0 ? (
        <h2 className="loading">Loading tests...</h2>
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
