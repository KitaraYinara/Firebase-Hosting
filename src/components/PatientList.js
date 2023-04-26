import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import PatientDataService from "../services/patient.services";

const PatientsList = ({ getPatientId }) => {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    getPatients();
  }, []);

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

      {/* <pre>{JSON.stringify(patients, undefined, 2)}</pre>} */}
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Patient Name</th>
            <th>Patient Age</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((doc, index) => {
            return (
              <tr key={doc.id}>
                <td>{index + 1}</td>
                <td>{doc.name}</td>
                <td>{doc.age}</td>
                <td>{doc.gender}</td>
                <td>
                  <Button
                    variant="secondary"
                    className="edit"
                    onClick={(e) => getPatientId(doc.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="delete"
                    onClick={(e) => deleteHandler(doc.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export default PatientsList;
