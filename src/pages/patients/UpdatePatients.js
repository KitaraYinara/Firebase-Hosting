import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, updateDoc, doc } from "firebase/firestore";
import Navigation from "../../components/Navigation/Navigation";

const UpdatePatients = (name, age, gender, id) => {
  const [newName, setNewName] = useState(name);
  const [newAge, setNewAge] = useState(age);
  const [newGender, setNewGender] = useState(gender);
  const patientsCollectionRef = collection(db, "patients", id);
  const updatePatient = async (e) => {
    e.preventDefault();
    await updateDoc(patientsCollectionRef, {
      name: newName,
      age: Number(newAge),
      gender: newGender,
    });
  };
  return (
    <div className="container">
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
      <button onClick={updatePatient}>Create Patient</button>
    </div>
  );
};

export default UpdatePatients;
