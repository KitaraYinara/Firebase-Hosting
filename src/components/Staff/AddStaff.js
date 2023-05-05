import React, { useState, useEffect } from "react";
import { Form, Alert, InputGroup, Button, ButtonGroup } from "react-bootstrap";
import StaffDataService from "../../services/staff.services";

const AddStaff = ({ id, setStaffId }) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [phonenum, setPhonenum] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ error: false, msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (name === "" || gender === "" || phonenum === "" || email === "") {
      setMessage({ error: true, msg: "All fields are mandatory!" });
      return;
    }
    const newStaff = {
      name,
      phonenum,
      email,
      gender,
    };
    console.log(newStaff);

    try {
      if (id !== undefined && id !== "") {
        await StaffDataService.updateStaff(id, newStaff);
        setStaffId("");
        setMessage({ error: false, msg: "Updated successfully!" });
      } else {
        await StaffDataService.addStaffs(newStaff);
        setMessage({ error: false, msg: "New Staff added successfully!" });
      }
    } catch (err) {
      setMessage({ error: true, msg: err.message });
    }

    setName("");
    setGender("");
    setPhonenum("");
    setEmail("");
  };

  const editHandler = async () => {
    setMessage("");
    try {
      const docSnap = await StaffDataService.getStaff(id);
      console.log("the record is :", docSnap.data());
      setName(docSnap.data().name);
      setPhonenum(docSnap.data().phonenum);
      setEmail(docSnap.data().email);
      setGender(docSnap.data().gender);
    } catch (err) {
      setMessage({ error: true, msg: err.message });
    }
  };

  useEffect(() => {
    console.log("The id here is : ", id);
    if (id !== undefined && id !== "") {
      editHandler();
    }
  }, [id]);
  return (
    <>
      <div className="p-4 box">
        {message?.msg && (
          <Alert
            variant={message?.error ? "danger" : "success"}
            dismissible
            onClose={() => setMessage("")}
          >
            {message?.msg}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formStaffName">
            <InputGroup>
              <InputGroup.Text id="formStaffName">Name</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Staff Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formStaffPhonenum">
            <InputGroup>
              <InputGroup.Text id="formStaffPhonenum">
                Phone Number
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Staff Phone Number"
                value={phonenum}
                onChange={(e) => setPhonenum(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formStaffEmail">
            <InputGroup>
              <InputGroup.Text id="formEmail">Email</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Staff Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formStaffGender">
            <InputGroup>
              <InputGroup.Text id="formStaffGender">Gender</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Staff Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <div className="d-grid gap-2">
            <Button variant="primary" type="Submit">
              Add/ Update
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default AddStaff;
