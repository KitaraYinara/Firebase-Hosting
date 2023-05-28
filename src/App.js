import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Patient from "./pages/patients/Patient";
import Staff from "./pages/staffs/Staff";
import Test from "./pages/tests/Test";
import Chart from "./chart";
import Report from "./pages/reports/Report";
import WriteReport from "./pages/reports/WriteReport";
import PatientsLists from "./PatientsLists";
import PatientTestPage from "./PatientTestPage";
import ReportPage from "./ReportPage";
import "bootstrap/dist/css/bootstrap.min.css";
import './PatientsLists.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/patient" element={<Patient />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/test" element={<Test />} />
      <Route path="/chart" element={<Chart />} />
      <Route path="/report" element={<Report />} />
      <Route path="/writereport" element={<WriteReport />} />
      <Route path="/patients" element={<PatientsLists />} />
      <Route path="/patients/:patientId/tests" element={<PatientTestPage />} />
      <Route path="/report/:patientId/:testId" element={<ReportPage />} /> 
    </Routes>
  );
}

export default App;
