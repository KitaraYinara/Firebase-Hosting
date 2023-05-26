import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AddTest from "../../components/Test/AddTest";
import TestsList from "../../components/Test/TestList";
import Navigation from "../../components/Navigation/Navigation";

const Test = () => {
  const [testId, setTestId] = useState("");

  const getTestIdHandler = (id) => {
    console.log("The ID of document to be edited: ", id);
    setTestId(id);
  };
  return (
    <>
      <Navigation></Navigation>
      {/* <Container style={{ width: "400px" }}>
        <Row>
          <Col>
            <AddTest id={testId} setTestId={setTestId} />
          </Col>
        </Row>
      </Container> */}
      <Container>
        <Row>
          <Col>
            <TestsList getTestId={getTestIdHandler} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Test;
