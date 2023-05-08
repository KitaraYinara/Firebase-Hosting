import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import ReportDataService from "../services/report.services";

const ReportsList = ({ getReportId }) => {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    getReports();
  }, []);

  const getReports = async () => {
    const data = await ReportDataService.getAllReports();
    console.log(data.docs);
    setReports(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const deleteHandler = async (id) => {
    await ReportDataService.deleteReport(id);
    getReports();
  };
  return (
    <>
      <div className="mb-2">
        <Button variant="dark edit" onClick={getReports}>
          Refresh List
        </Button>
      </div>

      {/* <pre>{JSON.stringify(reports, undefined, 2)}</pre>} */}
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Patient Name</th>
            <th>Report Diagonistic</th>
            <th>Report Note</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((doc, index) => {
            return (
              <tr key={doc.id}>
                <td>{index + 1}</td>
                <td>{new Date(doc.date).toLocaleDateString()}</td>
                <td>{doc.name}</td>
                <td>{doc.reportDiag}</td>
                <td>{doc.reportNote}</td>
                <td>
                  <Button
                    variant="secondary"
                    className="edit"
                    onClick={(e) => getReportId(doc.id)}
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export default ReportsList;
