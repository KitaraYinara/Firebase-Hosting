import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import AddPatient from "../../components/Patient/AddPatient";
import PatientsList from "../../components/Patient/PatientList";
import Navigation from "../../components/Navigation/Navigation";

const Patient = () => {
  const [patientId, setPatientId] = useState("");

  const getPatientIdHandler = (id) => {
    console.log("The ID of document to be edited: ", id);
    setPatientId(id);
  };
  return (
    <div className="container">
      <Navigation></Navigation>

      <AddPatient id={patientId} setPatientId={setPatientId} />

      <PatientsList getPatientId={getPatientIdHandler} />
    </div>
  );
};

export default Patient;
