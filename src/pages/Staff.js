import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AddStaff from "../../components/AddStaff";
import StaffsList from "../../components/StaffList";
import Navigation from "../../components/Navigation/Navigation";

const Staff = () => {
  const [staffId, setStaffId] = useState("");

  const getStaffIdHandler = (id) => {
    console.log("The ID of document to be edited: ", id);
    setStaffId(id);
  };
  return (
    <>
      <Navigation></Navigation>
      <Container style={{ width: "400px" }}>
        <Row>
          <Col>
            <AddStaff id={staffId} setStaffId={setStaffId} />
          </Col>
        </Row>
      </Container>
      <Container>
        <Row>
          <Col>
            <StaffsList getStaffId={getStaffIdHandler} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Staff;