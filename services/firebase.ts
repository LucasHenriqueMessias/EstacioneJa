// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVuwPQsQ86APkwGMGGcDg_oaaemopi4hY",
  authDomain: "estacioneja-88b9d.firebaseapp.com",
  projectId: "estacioneja-88b9d",
  storageBucket: "estacioneja-88b9d.firebasestorage.app",
  messagingSenderId: "440296847446",
  appId: "1:440296847446:web:de89f4aaaf20aba232e3f7",
  measurementId: "G-N0CCN7ZKJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Verifica se o ambiente suporta analytics antes de inicializar
let analytics;
if (typeof window !== "undefined" && (await isSupported())) {
  analytics = getAnalytics(app);
}

const database = getDatabase(app);

export { app, analytics, database };