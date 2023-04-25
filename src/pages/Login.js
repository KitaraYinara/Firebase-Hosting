import React, { useState } from "react";
import Navigation from "../components/Navigation/Navigation";
import "./index.css"
import { auth, app } from "../firebase"
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";


const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate('');

    const signIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            navigate("/")
            //console.log(userCredential)
        // ...
        })
        .catch((error) => {
            //console.log(error)
        });
    }

    return (
      <>
      <Navigation/>
        <div className = "container-signin">
        <section class = "wrapper">
        <div class = "heading">
                <h1 class="text text-large"><strong>Sign In</strong></h1>
                <p class="text text-normal">New User? <span><a href="/signup" class="text text-links">Create an account</a></span>
                </p>
          </div>
          <form onSubmit={signIn}>
          <div class="input-control">
  
              <input
                  type="email" placeholder="Enter your email" value={email} onChange = {(e)=> setEmail(e.target.value)} class="input-field">
              </input>
          </div>
          <div class="input-control">
  
              <input
                  type="password" placeholder="Enter your password" value={password} onChange = {(e)=> setPassword(e.target.value)} class="input-field">
              </input>
          </div>
  
  
            <button type="submit" name="submit" class="input-submit" value="Sign In">Sign In</button>
          </form>
          </section>
      </div>
    </>
  
  
    );
  };
  
  export default Login;