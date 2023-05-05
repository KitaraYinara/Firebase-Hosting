import React, { useState, useEffect } from "react";
import { Form, Alert, InputGroup, Button, ButtonGroup } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppointmentDataService from "../../services/appointment.services";

const AddAppointment = ({ id, setAppointmentId }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("0900");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState({ error: false, msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (name === "" || date === "" || time === "" || note === "") {
      setMessage({ error: true, msg: "All fields are mandatory!" });
      return;
    }
    if (isNaN(date.getTime())) {
      setMessage({ error: true, msg: "Invalid date!" });
      return;
    }
    const dateString = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
    const newAppointment = {
      name,
      date: dateString,
      time,
      note,
    };
    console.log(newAppointment);

    try {
      if (id !== undefined && id !== "") {
        await AppointmentDataService.updateAppointment(id, newAppointment);
        setAppointmentId("");
        setMessage({ error: false, msg: "Updated successfully!" });
      } else {
        await AppointmentDataService.addAppointments(newAppointment);
        setMessage({
          error: false,
          msg: "New Appointment added successfully!",
        });
      }
    } catch (err) {
      setMessage({ error: true, msg: err.message });
    }

    setName("");
    setDate(new Date());
    setTime("0900");
    setNote("");
  };

  const editHandler = async () => {
    setMessage("");
    try {
      const docSnap = await AppointmentDataService.getAppointment(id);
      console.log("the record is :", docSnap.data());
      setName(docSnap.data().name);
      setDate(new Date(docSnap.data().date));
      setTime(docSnap.data().time);
      setNote(docSnap.data().note);
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
  const timeOptions = [];
  const startTime = new Date();
  startTime.setHours(9, 0, 0, 0); // set start time to 9:00 AM
  const endTime = new Date();
  endTime.setHours(18, 0, 0, 0); // set end time to 6:00 PM
  let currentTime = new Date(startTime);
  while (currentTime <= endTime) {
    timeOptions.push(
      <option
        key={currentTime.toISOString()}
        value={currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      >
        {currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </option>
    );
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }
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
          <Form.Group className="mb-3" controlId="formAppointmentName">
            <InputGroup>
              <InputGroup.Text id="formAppointmentName">Name</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Patient's Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAppointmentDate">
            <InputGroup>
              <InputGroup.Text id="formAppointmentAge">Date</InputGroup.Text>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="dd/MM/yyyy"
                className="form-control"
                type="text"
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formAppointmentTime">
            <InputGroup>
              <InputGroup.Text id="formAppointmentTime">Time</InputGroup.Text>
              <Form.Select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-label="Select appointment time"
              >
                {timeOptions}
              </Form.Select>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAppointmentNote">
            <InputGroup>
              <InputGroup.Text id="formAppointmentNote">Notes</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Notes"
                value={note}
                onChange={(e) => setNote(e.target.value)}
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

export default AddAppointment;
