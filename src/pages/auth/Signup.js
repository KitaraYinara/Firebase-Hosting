import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import "../index.css";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
      <div className="container-signin">
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
    </>
  );
};

export default Signup;
