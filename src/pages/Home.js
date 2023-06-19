import React from "react";
import Navigation from "../components/Navigation/Navigation";
import "./Home.css";
import doctorImage from './doctor.jpg';

const Home = () => {
  return (
    <>
      <Navigation />
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js"></script>
      <body>
        <section className="question">
          <div className="container">
            <h2>Need help with Obstructive Sleep Apnea (OSA) ?</h2>
            <p>Don't worry because your sleep coach is here to assist you</p>
            <p>Our main mission is to assist patients with Obstructive Sleep Apnea at cheaper costs & at their own pace</p>
          </div>
        </section>

        <section className="photo-description">
          <div className="container">
            <div className="photo">
              <img src={doctorImage} alt="Doctor" />
            </div>
            <div className="description">
              <h3><b>Meet your Sleep Coach: Dr. Eugene Baey</b></h3>
              <p>Founder, and Sleep and Respiratory Coach of SleepEasy Centre, Dr. Eugene Baey has more than 20 years of clinical experience with patients with Obstructive and Central Sleep Apnea and even Complex Sleep Apnea. His Vision and Mission of SleepEasy Centre is to assist patients and walk their CPAP/ BIPAP journey with them.  Patient Centric and Passion for Patients journey with Pap Therapy.</p>
              <p>Working with Only Ethical, Honest and Sincere Physicians, We endeavor to provide/ render the Best Service and in turn treat them and monitor every patient as they walk through the doors of our Centre.</p>
              <p>We believe that Sleep Apnea should be approached as a multidisciplinary issue. With a concentration in Metabolic Syndromes (eg High Blood Pressure). Prevention of Stroke, Heart attacks, Dementia, Alzheimer Disease,  type 2 Diabettes and High Blood Pressure are our speciality).</p>
              <p>With a high level of dedication, we believe that every patient is different and Special, providing every patient with different perspectives and advice to allow for better care. </p>
              <p>Contact us today to book an Appointment, to allow our Sleep Coach, Eugene Baey, to give and Tailor the Best Program for you.</p>
            </div>
          </div>
        </section>

        <footer>
          <div className="container">
            <div className="social-media">
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-twitter"></i>
              <i className="fab fa-instagram"></i>
              <i className="fab fa-whatsapp"></i>
              <i className="fab fa-telegram"></i>
            </div>
            <p>&copy; 2023 SleepEasy Centre. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </>
  );
};

export default Home;
