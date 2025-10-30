// Import the functions you need from the SDKs you need
import 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKn4kliB56NQFs6zU7pLCwcDMVdJnriBE",
  authDomain: "lxroseinc.firebaseapp.com",
  projectId: "lxroseinc",
  storageBucket: "lxroseinc.appspot.com",
  messagingSenderId: "272684292542",
  appId: "1:272684292542:web:b020bcc575da8cd77901ef",
  measurementId: "G-B296M6B2DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore
export { db };
