import React from "react";
import { db } from "../firebase";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
const PatientTable = ({ patient }) => {
  const deletePatient = async (id) => {
    const patientsDoc = doc(db, "patients", id);
    await deleteDoc(patientsDoc);
  };
  return (
    <div style={{ textAlign: "center", border: "1px solid" }}>
      <table width="100%">
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Increment age</th>
          <th>Delete</th>
        </tr>
        <tr>
          <td>{patient.name}</td>
          <td>{patient.age}</td>
          <td>{patient.gender}</td>
          <td>
            <button>Edit Patient</button>
          </td>
          <td>
            <button
              onClick={() => {
                deletePatient(patient.id);
              }}
            >
              Delete Patient
            </button>
          </td>
        </tr>
      </table>
    </div>
  );
};

export default PatientTable;
