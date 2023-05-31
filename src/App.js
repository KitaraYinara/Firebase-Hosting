import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Patient from "./pages/patients/Patient";
import Staff from "./pages/staffs/Staff";
import Chart from "./chart";
import PatientTestPage from "./components/Test/PatientTestPage";
import ReportPage from "./components/Report/ReportPage";
import o2Report from "./pages/result/MainReport"
import "bootstrap/dist/css/bootstrap.min.css";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/patient" element={<Patient />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/chart" element={<Chart />} />
      <Route path="/patients/:patientId/tests" element={<PatientTestPage />} />
      <Route path="/report/:patientId/:testId" element={<ReportPage />} />
      <Route path ="/o2Report" element ={<o2Report/>} />
      
    </Routes>
  );
}

export default App;
