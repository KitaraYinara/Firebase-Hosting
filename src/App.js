import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Patient from "./pages/patients/Patient";
import Staff from "./pages/staffs/Staff";
import Chart from "./chart";
import PatientTestPage from "./components/Test/PatientTestPage";
import ReportPage from "./components/Report/ReportPage";
import MainReport from "./pages/report/O2Report";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticatedUser(user);
      } else {
        setAuthenticatedUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const PrivateRoute = ({ path, element }) => {
    if (loading) {
      // Render a loading state while checking the authentication state
      return <div>Loading...</div>;
    } else if (authenticatedUser) {
      // Render the component if the user is authenticated
      return element;
    } else {
      // Redirect to the login page if the user is not authenticated
      return <Navigate to="/login" />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/patient"
        element={<PrivateRoute element={<Patient />} />}
      />
      <Route
        path="/staff"
        element={<PrivateRoute element={<Staff />} />}
      />
      <Route
        path="/chart"
        element={<PrivateRoute element={<Chart />} />}
      />
      <Route
        path="/patients/:patientId/tests"
        element={<PrivateRoute element={<PatientTestPage />} />}
      />
      <Route
        path="/report/:patientId/:testId"
        element={<PrivateRoute element={<ReportPage />} />}
      />
      <Route
        path="/mainreport/:patientId/:testId/"
        element={<PrivateRoute element={<MainReport />} />}
      />
    </Routes>
  );
};

export default App;
