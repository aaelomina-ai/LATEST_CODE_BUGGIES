// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//imp
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
//const firebaseConfig = {
  //apiKey: "AIzaSyDCj1q-PnOvM2VWZIudswfmTVPRP1X3iU8",
  //authDomain: "project-codebuggies.firebaseapp.com",
  //projectId: "project-codebuggies",
  //storageBucket: "project-codebuggies.firebasestorage.app",
  //messagingSenderId: "534620424484",
 // appId: "1:534620424484:web:1705dc14b7fed294058bb1",
  //databaseURL: "https://project-codebuggies-default-rtdb.asia-southeast1.firebasedatabase.app/"
//};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDCj1q-PnOvM2VWZIudswfmTVPRP1X3iU8",
  authDomain: "project-codebuggies.firebaseapp.com",
  projectId: "project-codebuggies",
  storageBucket: "project-codebuggies.firebasestorage.app",
  messagingSenderId: "534620424484",
  appId: "1:534620424484:web:1705dc14b7fed294058bb1",
  databaseURL: "https://project-codebuggies-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);


