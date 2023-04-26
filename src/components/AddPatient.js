import React, { useState, useEffect } from "react";
import { Form, Alert, InputGroup, Button, ButtonGroup } from "react-bootstrap";
import PatientDataService from "../services/patient.services";

const AddPatient = ({ id, setPatientId }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState();
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState({ error: false, msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (name === "" || age === "") {
      setMessage({ error: true, msg: "All fields are mandatory!" });
      return;
    }
    const newPatient = {
      name,
      age,
      gender,
    };
    console.log(newPatient);

    try {
      if (id !== undefined && id !== "") {
        await PatientDataService.updatePatient(id, newPatient);
        setPatientId("");
        setMessage({ error: false, msg: "Updated successfully!" });
      } else {
        await PatientDataService.addPatients(newPatient);
        setMessage({ error: false, msg: "New Patient added successfully!" });
      }
    } catch (err) {
      setMessage({ error: true, msg: err.message });
    }

    setName("");
    setAge(0);
    setGender("");
  };

  const editHandler = async () => {
    setMessage("");
    try {
      const docSnap = await PatientDataService.getPatient(id);
      console.log("the record is :", docSnap.data());
      setName(docSnap.data().name);
      setAge(docSnap.data().age);
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
          <Form.Group className="mb-3" controlId="formPatientName">
            <InputGroup>
              <InputGroup.Text id="formPatientName">Name</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Patient Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPatientAge">
            <InputGroup>
              <InputGroup.Text id="formPatientAge">Age</InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Patient Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPatientGender">
            <InputGroup>
              <InputGroup.Text id="formPatientGender">Gender</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Patient Gender"
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

export default AddPatient;
