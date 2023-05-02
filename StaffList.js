import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import StaffDataService from "../services/staff.services";

const StaffsList = ({ getStaffId }) => {
  const [staffs, setStaffs] = useState([]);
  useEffect(() => {
    getStaffs();
  }, []);

  const getStaffs = async () => {
    const data = await StaffDataService.getAllStaffs();
    console.log(data.docs);
    setStaffs(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const deleteHandler = async (id) => {
    await StaffDataService.deleteStaff(id);
    getStaffs();
  };
  return (
    <>
      <div className="mb-2">
        <Button variant="dark edit" onClick={getStaffs}>
          Refresh List
        </Button>
      </div>

      {/* <pre>{JSON.stringify(staffs, undefined, 2)}</pre>} */}
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Staff Name</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((doc, index) => {
            return (
              <tr key={doc.id}>
                <td>{index + 1}</td>
                <td>{doc.name}</td>
                <td>{doc.phonenum}</td>
                <td>{doc.email}</td>
                <td>{doc.gender}</td>
                <td>
                  <Button
                    variant="secondary"
                    className="edit"
                    onClick={(e) => getStaffId(doc.id)}
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

export default StaffsList;
