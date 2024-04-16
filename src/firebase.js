import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage} from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBkKOV2iIjbVM68648ji5L71Pdi9AtdsuI",
  authDomain: "chat-2e771.firebaseapp.com",
  projectId: "chat-2e771",
  storageBucket: "chat-2e771.appspot.com",
  messagingSenderId: "1048635614391",
  appId: "1:1048635614391:web:95a901e81b5a49d44b1932"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();  
export const storage = getStorage();
export const db=getFirestore()