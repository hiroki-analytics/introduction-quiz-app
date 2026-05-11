import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4xJ8H6aMl0YiOxg9L56tDxnGRIcmRzz8",
  authDomain: "naitei-quiz.firebaseapp.com",
  projectId: "naitei-quiz",
  storageBucket: "naitei-quiz.firebasestorage.app",
  messagingSenderId: "697524334707",
  appId: "1:697524334707:web:5644c17ed501c32134fa06"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
