import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import PatientDataService from "../../services/patient.services";
import "./Patient.css";
const AddPatient = ({ id, setPatientId }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState();
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState({ error: false, msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (name === "" || age === "" || gender === "") {
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
        <form onSubmit={handleSubmit}>
          <div className="addupdateform">
            <div className="mb-3" controlId="formPatientName">
              <fieldset>
                <label id="formPatientName">Name: </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Patient Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </fieldset>
            </div>

            <div className="mb-3" controlId="formPatientAge">
              <fieldset>
                <label id="formPatientAge">Age: </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Patient Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </fieldset>
            </div>
            <div className="mb-3" controlId="formPatientGender">
              <fieldset>
                <label id="formPatientGender">Gender: </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Patient Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </fieldset>
            </div>
            <div className="d-grid gap-2">
              <button type="Submit" className="Submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-plus-lg"
                  viewBox="0 0 22 18"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
                  />
                </svg>
                Add &emsp;|&emsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-pencil-square"
                  viewBox="0 0 22 18"
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path
                    fill-rule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                  />
                </svg>
                Update
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddPatient;
