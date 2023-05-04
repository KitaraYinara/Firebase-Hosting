import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Patient from "./pages/patients/Patient";
import Staff from "./pages/staffs/Staff";
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
    </Routes>
  );
}

export default App;
