import React from "react";
import Navigation from "../components/Navigation/Navigation";
import "./Home.css";

const Home = () => {
  return (
    <div className="container">
      <Navigation />
      <div className="title-section">
        <h1 className="sleepeasy">SleepEasy</h1>
        <h2 className="title">Patient & Report Management System</h2>
      </div>
      <div className="bottom-brand">
        <p>&copy; 2023 SleepEasy Centre. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Home;
