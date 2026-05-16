import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "", // TODO: paste your Firebase apiKey
  authDomain: "", // TODO: paste your Firebase authDomain
  projectId: "", // TODO: paste your Firebase projectId
  storageBucket: "", // TODO: paste your Firebase storageBucket
  messagingSenderId: "", // TODO: paste your Firebase messagingSenderId
  appId: "", // TODO: paste your Firebase appId
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Add your Firebase config in src/firebase.js before signing in.");
  }
  return signInWithPopup(auth, provider);
}
