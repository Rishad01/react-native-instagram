import { initializeApp,getApps } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAzlF5SABxxwK55qB5isdR5eZFQTn8R22o",
    authDomain: "instagram-demo-2a4d8.firebaseapp.com",
    projectId: "instagram-demo-2a4d8",
    storageBucket: "instagram-demo-2a4d8.appspot.com",
    messagingSenderId: "940541141788",
    appId: "1:940541141788:web:2d41ce2f7f7a1b7e1c90d9",
    measurementId: "G-MSS9NFX1VC"
  };
  

// Initialize Firebase
let app;
if (!getApps().length) {
    app=initializeApp(firebaseConfig);
  }
// Export Firebase auth for use in other components
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth,db,storage };
