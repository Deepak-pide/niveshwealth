
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBGPL9oIZ1o0hQEYlC-Y_1vL6Hx5YtFlqA",
    authDomain: "niveshpro.firebaseapp.com",
    projectId: "niveshpro",
    storageBucket: "niveshpro.appspot.com",
    messagingSenderId: "801180386301",
    appId: "1:801180386301:web:fe11b99f1eae9b6a9d4f94"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
