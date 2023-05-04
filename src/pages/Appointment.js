import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AddAppointment from "../../components/AddAppointment";
import AppointmentsList from "../../components/AppointmentList";
import Navigation from "../../components/Navigation/Navigation";

const Appointment = () => {
  const [appointmentId, setAppointmentId] = useState("");

  const getAppointmentIdHandler = (id) => {
    console.log("The ID of document to be edited: ", id);
    setAppointmentId(id);
  };
  return (
    <>
      <Navigation></Navigation>
      <Container style={{ width: "400px" }}>
        <Row>
          <Col>
            <AddAppointment id={appointmentId} setAppointmentId={setAppointmentId} />
          </Col>
        </Row>
      </Container>
      <Container>
        <Row>
          <Col>
            <AppointmentsList getAppointmentId={getAppointmentIdHandler} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Appointment;
