import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import "../index.css";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./authentication.css"

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate("");

  const signUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigate("/login");
        //console.log(userCredential)
        // ...
      })
      .catch((error) => {
        //console.log(error)
      });
  };

  return (
    <>
      <Navigation />
      <div className="container-signin"
       style={{
            backgroundImage: `url("https://s1.1zoom.me/b5050/357/Eyes_medicine_Glance_547947_1920x1080.jpg")`, // Use the filename directly as the URL
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            width: "100%",
            padding: "0 2rem",
            margin: "0 auto",
          }}>
        <section class="wrapper">
          <div class="heading">
            <h1 class="text text-large">
              <strong>Register</strong>
            </h1>
            <p class="text text-normal">
              Already a User?{" "}
              <span>
                <a href="/login" class="text text-links">
                  Log in
                </a>
              </span>
            </p>
          </div>
          <form onSubmit={signUp}>
            <div class="input-control">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                class="input-field"
              ></input>
            </div>
            <div class="input-control">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                class="input-field"
              ></input>
            </div>

            <button
              type="submit"
              name="submit"
              class="input-submit"
              value="Sign Up"
            >
              Submit
            </button>
          </form>
        </section>
      </div>
      <div className="bottom-page">
        <p>&copy; 2023 SleepEasy Centre. All rights reserved.</p>
      </div>
    </>
  );
};

export default Signup;
