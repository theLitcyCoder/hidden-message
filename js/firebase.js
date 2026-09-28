// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxUEnZEKuWWNdnmxwXJGXpb2WSbr6WVXg",
  authDomain: "hidden-message-c357e.firebaseapp.com",
  projectId: "hidden-message-c357e",
  storageBucket: "hidden-message-c357e.firebasestorage.app",
  messagingSenderId: "830944474062",
  appId: "1:830944474062:web:c5c7e00b9dbe6b2b44f19f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);