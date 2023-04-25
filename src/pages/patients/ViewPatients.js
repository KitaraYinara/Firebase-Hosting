import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import Navigation from "../../components/Navigation/Navigation";
import PatientTable from "../../components/PatientTable";
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
      <div>
        <h1 className="main-title">View Patients</h1>
        <div class="container">
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
        </div>
        <br></br>
        {patients.map((patient) => {
          return (
            <div>
              <PatientTable patient={patient}></PatientTable>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ViewPatients;
