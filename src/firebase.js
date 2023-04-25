// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9eWHeLXxKO938_nwS6FdVvnUqN_NXVoQ",
  authDomain: "fir-authentication-96cd6.firebaseapp.com",
  projectId: "fir-authentication-96cd6",
  storageBucket: "fir-authentication-96cd6.appspot.com",
  messagingSenderId: "140073163102",
  appId: "1:140073163102:web:0a9b1ad84ab1d0308497cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }