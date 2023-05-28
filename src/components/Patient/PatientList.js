import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import PatientDataService from "../../services/patient.services";
import { query, onSnapshot } from "firebase/firestore";
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
      <div className="mb-2">
        <Button variant="dark edit" onClick={getPatients}>
          Refresh List
        </Button>
      </div>

      <Table striped bordered hover size="sm">
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
                <Button
                  variant="secondary"
                  className="edit"
                  onClick={(e) => getPatientId(patient.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="delete"
                  onClick={(e) => deleteHandler(patient.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="primary"
                  className="view"
                  onClick={(e) => routeToTest(patient.id)}
                >
                  Show Tests
                </Button>

                {/* <Link to={`/patients/${patient.id}/tests`}>Show Tests</Link> */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default PatientsList;
