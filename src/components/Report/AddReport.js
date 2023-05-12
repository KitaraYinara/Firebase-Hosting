import React, { useState, useEffect, useRef } from "react";
import { Form, Alert, InputGroup, Button, ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReportDataService from "../../services/report.services";

const AddReport = ({ id, setReportId }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [reportDiag, setReportDiag] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [message, setMessage] = useState({ error: false, msg: "" });
  const [showImage, setShowImage] = useState(false);

  const handleClick = () => {
    setShowImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (name === "" || date === "" || reportDiag === "" || reportNote === "") {
      setMessage({ error: true, msg: "All fields are mandatory!" });
      return;
    }
    const dateString = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
    const newReport = {
      name,
      date: dateString,
      reportDiag,
      reportNote,
    };
    console.log(newReport);

    try {
      if (id !== undefined && id !== "") {
        await ReportDataService.updateReport(id, newReport);
        setReportId("");
        setMessage({ error: false, msg: "Updated successfully!" });
      } else {
        await ReportDataService.addReports(newReport);
        setMessage({ error: false, msg: "New Report added successfully!" });
      }
    } catch (err) {
      setMessage({ error: true, msg: err.message });
    }
    setName("");
    setReportDiag("");
    setReportNote("");
    setDate(new Date());
  };
  const editHandler = async () => {
    setMessage("");
    try {
      const docSnap = await ReportDataService.getReport(id);
      console.log("the record is :", docSnap.data());
      setName(docSnap.data().name);
      setReportDiag(docSnap.data().reportNote);
      setDate(new Date(docSnap.data().date));
      setReportNote(docSnap.data().reportDiag);
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
          <Form.Group className="mb-3" controlId="formName">
            <InputGroup>
              <InputGroup.Text id="formName">Name</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formReportDate">
            <InputGroup>
              <InputGroup.Text id="formReportDate">Date</InputGroup.Text>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="dd/MM/yyyy"
                className="form-control"
                type="text"
              />
            </InputGroup>
          </Form.Group>

          <html>BPM:</html>

          <html>Oxygen:</html>

          <Button
            variant="secondary"
            className="edit"
            onClick={() => {
              const confirmStart = window.confirm(
                "Are you sure you want to start the test?"
              );
              if (confirmStart) {
                console.log("Test started");
              }
            }}
          >
            Start
          </Button>

          <Button
            variant="danger"
            className="end"
            onClick={() => {
              const confirmStart = window.confirm(
                "Are you sure you want to end the test?"
              );
              if (confirmStart) {
                console.log("Test end");
              }
            }}
          >
            End
          </Button>

          <Form.Group className="mb-3" controlId="formReportDiag">
            <InputGroup>
              <InputGroup.Text id="formRepotrDiag">
                Sleep Apnea Result
              </InputGroup.Text>
              <Form.Select
                value={reportDiag}
                onChange={(e) => setReportDiag(e.target.value)}
                style={{ height: "50px", width: "300px" }}
                aria-label="Select sleep apnea result grading"
              >
                <option value="Select One">Selection</option>
                <option value="Normal">
                  Normal (AHI less than 5 per hour)
                </option>
                <option value="Mild">
                  Mild (AHI between 5 and 15 per hour)
                </option>
                <option value="Moderate">
                  Moderate (AHI between 15 and 30 per hour)
                </option>
                <option value="Severe">
                  Severe (AHI greater than 30 per hour)
                </option>
              </Form.Select>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formReportNote">
            <InputGroup>
              <InputGroup.Text id="formReportNote">Notes</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Analysis"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <form onSubmit={handleSubmit}></form>
          <div className="d-grid gap-2">
            <Button variant="primary" type="Submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default AddReport;
