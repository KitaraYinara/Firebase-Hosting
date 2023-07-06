import React from "react";
import Navigation from "../components/Navigation/Navigation";
import "./Home.css";

const Home = () => {
  return (
    <div>
      <Navigation />
      <div className="title-section">
        <h1 className="sleepeasy">SleepEasy</h1>
        <h2 className="title">Patient & Report Management System</h2>
      </div>
    </div>
  );
};

export default Home;
