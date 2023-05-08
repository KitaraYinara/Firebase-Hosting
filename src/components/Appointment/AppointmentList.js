import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import AppointmentDataService from "../../services/appointment.services";

const AppointmentsList = ({ getAppointmentId }) => {
  const [appointments, setAppointments] = useState([]);
  useEffect(() => {
    getAppointments();
  }, []);

  const getAppointments = async () => {
    const data = await AppointmentDataService.getAllAppointments();
    console.log(data.docs);
    setAppointments(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const deleteHandler = async (id) => {
    await AppointmentDataService.deleteAppointment(id);
    getAppointments();
  };
  return (
    <>
      <div className="mb-2">
        <Button variant="dark edit" onClick={getAppointments}>
          Refresh List
        </Button>
      </div>

      {/* <pre>{JSON.stringify(appointments, undefined, 2)}</pre>} */}
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
          {appointments.map((doc, index) => {
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
                    onClick={(e) => getAppointmentId(doc.id)}
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

export default AppointmentsList;
