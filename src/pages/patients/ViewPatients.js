import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Navigation from "../../components/Navigation/Navigation";

const ViewPatients = () => {
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(0);
  const [newGender, setNewGender] = useState("");
  const [patients, setPatients] = useState([]);
  const patientsCollectionRef = collection(db, "patients");
  const createPatient = async () => {
    await addDoc(patientsCollectionRef, {
      name: newName,
      age: Number(newAge),
      gender: newGender,
    });
  };
  const incrementAge = async (id, age) => {
    const newFields = { age: age + 1 };
    const userDoc = doc(db, "users", id);
    await updateDoc(userDoc, newFields);
  };
  const deletePatient = async (id) => {
    const patientsDoc = doc(db, "patients", id);
    await deleteDoc(patientsDoc);
  };
  useEffect(() => {
    const getPatients = async () => {
      const data = await getDocs(patientsCollectionRef);
      setPatients(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getPatients();
  }, []);
  return (
    <>
      <Navigation />
      <div className="container">
        <h1 className="main-title">View Patients</h1>
        <input
          placeholder="Name"
          onChange={(e) => {
            setNewName(e.target.value);
          }}
        ></input>
        <input
          type="number"
          placeholder="Age"
          onChange={(e) => {
            setNewAge(e.target.value);
          }}
        ></input>
        <input
          placeholder="Gender"
          onChange={(e) => {
            setNewGender(e.target.value);
          }}
        ></input>
        <button onClick={createPatient}>Create Patient</button>
        {patients.map((patient) => {
          return (
            <div>
              <h1>Name: {patient.name}</h1>
              <h1>Age: {patient.age}</h1>
              <h1>Gender: {patient.gender}</h1>
              <button
                onClick={() => {
                  incrementAge(patient.id, patient.age);
                }}
              >
                Increment age
              </button>
              <button
                onClick={() => {
                  deletePatient(patient.id);
                }}
              >
                Delete Patient
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ViewPatients;
