import { useState } from "react";
import { Row, Col } from "react-bootstrap";
import AddStaff from "../../components/Staff/AddStaff";
import StaffsList from "../../components/Staff/StaffList";
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
      <div>
        <Row>
          <Col>
            <AddStaff id={staffId} setStaffId={setStaffId} />
          </Col>
        </Row>
      </div>
      <div>
        <Row>
          <Col>
            <StaffsList getStaffId={getStaffIdHandler} />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Staff;
