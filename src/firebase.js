import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyChfBLnBTsufPdXxSE2KoKLm0oPj69jxac",
  authDomain: "note-share-59c05.firebaseapp.com",
  projectId: "note-share-59c05",
  storageBucket: "note-share-59c05.appspot.com",
  messagingSenderId: "1045433906953",
  appId: "1:1045433906953:web:368e2aacfde8c4b05fc5d8",
  measurementId: "G-27ZLSG23V0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut, db, storage};
