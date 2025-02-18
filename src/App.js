import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Patient from "./pages/patients/Patient";
import PatientTestPage from "./components/Test/PatientTestPage";
import GraphPage from "./components/Graph/GraphPage";
import MainReport from "./pages/report/O2Report";
import SleepReport from "./pages/report/SleepReport";
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
      <Route path="/patient" element={<PrivateRoute element={<Patient />} />} />
      <Route
        path="/patients/:patientId/tests"
        element={<PrivateRoute element={<PatientTestPage />} />}
      />
      <Route
        path="/graph/:patientId/:testId"
        element={<PrivateRoute element={<GraphPage />} />}
      />
      <Route
        path="/mainreport/"
        element={<PrivateRoute element={<MainReport />} />}
      />
      <Route
        path="/mainreport/:patientId/:testId"
        element={<PrivateRoute element={<MainReport />} />}
      />
      <Route
        path="/sleepreport/:patientId/:testId"
        element={<PrivateRoute element={<SleepReport />} />}
      />
      <Route
        path="/sleepreport"
        element={<PrivateRoute element={<SleepReport />} />}
      />
    </Routes>
  );
};

export default App;
