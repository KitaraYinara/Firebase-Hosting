import React, { useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import "../index.css";
import { Alert } from "react-bootstrap";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate("");
  const [message, setMessage] = useState({ error: false, msg: "" });

  const signIn = (e) => {
    e.preventDefault();
    if (email === "" || password === "") {
      setMessage({ error: true, msg: "All fields are mandatory!" });
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigate("/");
        //console.log(userCredential)
        // ...
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <Navigation />
      <div className="container-signin"
       style={{
            backgroundImage: `url("https://img.freepik.com/free-vector/clean-medical-background_53876-97927.jpg")`, // Use the filename directly as the URL
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
              <strong>Sign In</strong>
            </h1>
            <p class="text text-normal">
              New User?{" "}
              <span>
                <a href="/signup" class="text text-links">
                  Create an account
                </a>
              </span>
            </p>
          </div>
          <form onSubmit={signIn}>
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
            {message?.msg && (
              <Alert
                variant={message?.error ? "danger" : "success"}
                dismissible
                onClose={() => setMessage("")}
              >
                {message?.msg}
              </Alert>
            )}
            <button
              type="submit"
              name="submit"
              class="input-submit"
              value="Sign In"
            >
              Sign In
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

export default Login;
