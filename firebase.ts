import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyBKTht4AlCrjRgKjvjIgKA2-3toC30MAHM",
  authDomain: "privy-example-auth.firebaseapp.com",
  projectId: "privy-example-auth",
  storageBucket: "privy-example-auth.appspot.com",
  messagingSenderId: "692827837593",
  appId: "1:692827837593:web:dec8533d1e2490c4409408",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log(db);

export { db };
