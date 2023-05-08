import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
//import AddReport from "../../components/AddReport";
import ReportsList from "../../components/ReportList";
import Navigation from "../../components/Navigation/Navigation";

const Report = () => {
  const [reportId, setReportId] = useState("");

  const getReportIdHandler = (id) => {
    console.log("The ID of document to be edited: ", id);
    setReportId(id);
  };
  return (
    <>
      <Navigation></Navigation>
      <Container>
        <Row>
          <Col>
            <ReportsList getReportId={getReportIdHandler} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Report;