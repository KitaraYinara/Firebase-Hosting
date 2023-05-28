import React, { useEffect, useState } from "react";
import { auth, app } from "../../firebase";
import Nav from "react-bootstrap/Nav";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Authentication = () => {
  const [authenticatedUser, setauthenticatedUser] = useState("");

  useEffect(() => {
    const listenAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setauthenticatedUser(user);
      } else {
        setauthenticatedUser(null);
      }
    });
    return () => {
      listenAuth();
    };
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        //console.log("user signed out")
      })
      .catch((error) => console.log("error"));
  };

  return (
    <>
      {authenticatedUser === null ? (
        <>
          <Nav.Link href="/login">Login</Nav.Link>
          <Nav.Link href="/signup">Sign up</Nav.Link>
        </>
      ) : (
        <>
          <Nav.Link href="/" onClick={userSignOut}>
            Sign Out
          </Nav.Link>
          <Nav.Link href="/patient">Patient</Nav.Link>
          <Nav.Link href="/staff">Staff</Nav.Link>
        </>
      )}
    </>
  );
};

export default Authentication;
