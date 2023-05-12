import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Patient from "./pages/patients/Patient";
import Staff from "./pages/staffs/Staff";
import Appointment from "./pages/appointments/Appointment";
import Chart from "./chart";
import Report from "./pages/reports/Report";
import WriteReport from "./pages/reports/WriteReport";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/patient" element={<Patient />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/chart" element={<Chart />} />
      <Route path="/report" element={<Report />} />
      <Route path="/writereport" element={<WriteReport />} />
    </Routes>
  );
}

export default App;
