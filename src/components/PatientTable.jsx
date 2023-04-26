import React from "react";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
const PatientTable = ({ patient }) => {
  const deletePatient = async (id) => {
    const patientsDoc = doc(db, "patients", id);
    await deleteDoc(patientsDoc);
  };
  return (
    <div style={{ textAlign: "center" }}>
      <table width="100%">
        <tr textAlign="center">
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
        <tr textAlign="center">
          <td>{patient.name}</td>
          <td>{patient.age}</td>
          <td>{patient.gender}</td>
          <td>
            <a href="/updatepatient">
              <button>Update Patient</button>
            </a>
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
