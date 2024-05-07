import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, onSnapshot } from "@firebase/firestore";

// Enter the firebaseconfig below
const firebaseConfig = {
  apiKey: "AIzaSyCxEnGFEEs68ZE8Wd1aOJ5VyZ8EXMrWSek",
  authDomain: "test-8dbce.firebaseapp.com",
  projectId: "test-8dbce",
  storageBucket: "test-8dbce.appspot.com",
  messagingSenderId: "592602578836",
  appId: "1:592602578836:web:1f5990ac3b41fbaab01981",
  measurementId: "G-0T44QLJDTC"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export function subscribeToSensorData(callback) {
  const sensorsRef = collection(db, "sensors");
  onSnapshot(sensorsRef, (querySnapshot) => {
    const sensorData = querySnapshot.docs.map((doc) => ({
      timestamp: doc.data().timestamp,
      bpm: doc.data().bpm,
      spO2: doc.data().spO2,
      motion: doc.data().motion,
    }));
    callback(sensorData);
  });
}
