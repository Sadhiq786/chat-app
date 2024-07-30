import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage} from "firebase/storage";
import { deleteField } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMyL-iG0kjN1sGMMqQRh_7KRhZ5GnhqP8",
  authDomain: "chat-e0185.firebaseapp.com",
  projectId: "chat-e0185",
  storageBucket: "chat-e0185.appspot.com",
  messagingSenderId: "37091012426",
  appId: "1:37091012426:web:b4b35b5b6224a02a56dbb3"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();  
export const storage = getStorage();
export const db=getFirestore();