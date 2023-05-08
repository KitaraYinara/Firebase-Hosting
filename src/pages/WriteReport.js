import { useState } from "react";
import { Container, Row, Col,Button } from "react-bootstrap";
import AddReport from "../../components/AddReport";
//import ReportsList from "../../components/ReportList";
import Navigation from "../../components/Navigation/Navigation";

const Report = () => {
  const [reportId, setReportId] = useState("");

  //const getReportIdHandler = (id) => {
    //console.log("The ID of document to be edited: ", id);
    //setReportId(id);
  //};
  return (
    <>
      <Navigation></Navigation>
      <Container style={{ width: "400px" }}>
        <Row>
          <Col>
            <AddReport id={reportId} setReportId={setReportId} />
            
          </Col>
        </Row>
      </Container>

      
    </>
  );
};

export default Report;