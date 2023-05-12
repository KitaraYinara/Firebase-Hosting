import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9eWHeLXxKO938_nwS6FdVvnUqN_NXVoQ",
  authDomain: "fir-authentication-96cd6.firebaseapp.com",
  projectId: "fir-authentication-96cd6",
  storageBucket: "fir-authentication-96cd6.appspot.com",
  messagingSenderId: "140073163102",
  appId: "1:140073163102:web:0a9b1ad84ab1d0308497cf",
  databaseURL: "https://fir-authentication-96cd6-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
export const db = getFirestore(app);
export const db1 = firebase.initializeApp(firebaseConfig, "second_db").database();
