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

  const deleteHandler = async (id) => {
    await TestDataService.deleteTest(id);
    getTests();
  };
  return (
    <>
      <div className="mb-2">
        <Button variant="dark edit" onClick={getTests}>
          Refresh List
        </Button>
      </div>

      {/* <pre>{JSON.stringify(tests, undefined, 2)}</pre>} */}
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Patient's Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((doc, index) => {
            return (
              <tr key={doc.id}>
                <td>{index + 1}</td>
                <td>{doc.name}</td>
                <td>{new Date(doc.date).toLocaleDateString()}</td>
                <td>{doc.time}</td>
                <td>{doc.note}</td>
                <td>
                  <Button
                    variant="secondary"
                    className="edit"
                    onClick={(e) => getTestId(doc.id)}
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
