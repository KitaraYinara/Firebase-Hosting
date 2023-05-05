import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
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
    <>
      <Navigation></Navigation>
      <Container style={{ width: "400px" }}>
        <Row>
          <Col>
            <AddPatient id={patientId} setPatientId={setPatientId} />
          </Col>
        </Row>
      </Container>
      <Container>
        <Row>
          <Col>
            <PatientsList getPatientId={getPatientIdHandler} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Patient;
