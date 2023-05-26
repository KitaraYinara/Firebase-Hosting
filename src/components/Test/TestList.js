import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import TestDataService from "../../services/test.services";

const TestsList = ({ getTestId }) => {
  const [tests, setTests] = useState([]);
  useEffect(() => {
    getTests();
  }, []);

  const getTests = async () => {
    const data = await TestDataService.getAllTests();
    console.log(data.docs);
    setTests(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  return (
    <>
      {/* <pre>{JSON.stringify(tests, undefined, 2)}</pre>} */}
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((doc, index) => {
            return (
              <tr key={doc.id}>
                <td>{index + 1}</td>
                <td>{new Date(doc.date).toLocaleDateString()}</td>
                <td>
                  <Button variant="primary" as={Link} to="/writereport">
                    Create Report
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

export default TestsList;
