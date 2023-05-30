import React, { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
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

        <form onSubmit={handleSubmit}>
          <div className="addupdateform">
            <div className="mb-3" controlId="formStaffName">
              <fieldset>
                <label id="formStaffName">Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Staff Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </fieldset>
            </div>

            <div className="mb-3" controlId="formStaffPhonenum">
              <fieldset>
                <label id="formStaffPhonenum">Phone Number</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Staff Phone Number"
                  value={phonenum}
                  onChange={(e) => setPhonenum(e.target.value)}
                />
              </fieldset>
            </div>

            <div className="mb-3" controlId="formStaffEmail">
              <fieldset>
                <label id="formEmail">Email</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Staff Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </fieldset>
            </div>

            <div className="mb-3" controlId="formStaffGender">
              <fieldset>
                <label id="formStaffGender">Gender</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Staff Gender"
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

export default AddStaff;
