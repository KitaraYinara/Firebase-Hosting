import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ViewPatients from "./pages/patients/ViewPatients";
import UpdatePatients from "./pages/patients/UpdatePatients";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/patient" element={<ViewPatients />} />
      <Route path="/updatepatient" element={<UpdatePatients />} />
    </Routes>
  );
}

export default App;
