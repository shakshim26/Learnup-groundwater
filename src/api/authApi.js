import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import { saveUserProfile } from "./userApi";

/* 🔐 SIGN UP */
export async function signupUser(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await saveUserProfile(res.user);
  return res.user;
}

/* 🔐 LOGIN */
export async function loginUser(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  await saveUserProfile(res.user); // refresh profile
  return res.user;
}

/* 🔐 GOOGLE LOGIN */
export async function googleLogin() {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  await saveUserProfile(res.user);
  return res.user;
}

/* 🔐 FORGOT PASSWORD */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/* 🔐 LOGOUT */
export function logoutUser() {
  return signOut(auth);
}
