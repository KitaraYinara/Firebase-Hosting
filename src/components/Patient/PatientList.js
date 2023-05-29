import React, { useEffect, useState } from "react";
import PatientDataService from "../../services/patient.services";
import { query, onSnapshot } from "firebase/firestore";
import "./Patient.css";
const PatientsList = ({ getPatientId }) => {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    const fetchPatients = async () => {
      getPatients();
      const patientsQuery = query(getPatients());

      const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
        const patientList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(patientList);
      });

      return () => {
        unsubscribe();
      };
    };
    fetchPatients();
  }, []);
  const routeToTest = (patientId) => {
    console.log(patientId);
    window.location.href = `/patients/${patientId}/tests`;
  };

  const getPatients = async () => {
    const data = await PatientDataService.getAllPatients();
    console.log(data.docs);
    setPatients(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const deleteHandler = async (id) => {
    await PatientDataService.deletePatient(id);
    getPatients();
  };
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Patient Age</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.gender}</td>
              <td>
                <button
                  variant="primary"
                  className="view"
                  onClick={(e) => routeToTest(patient.id)}
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
                  Show Tests
                </button>
                <button
                  variant="secondary"
                  className="edit"
                  onClick={(e) => getPatientId(patient.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    fill="currentColor"
                    class="bi bi-pencil-square"
                    viewBox="0 0 22 18"
                  >
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                    <path
                      fill-rule="evenodd"
                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  variant="danger"
                  className="delete"
                  onClick={(e) => deleteHandler(patient.id)}
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
                {/* <Link to={`/patients/${patient.id}/tests`}>Show Tests</Link> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="refresh" onClick={getPatients}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="30"
          fill="currentColor"
          class="bi bi-arrow-clockwise"
          viewBox="0 0 20 18"
        >
          <path
            fill-rule="evenodd"
            d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"
          />
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
        </svg>
        Refresh List
      </button>
    </>
  );
};

export default PatientsList;
