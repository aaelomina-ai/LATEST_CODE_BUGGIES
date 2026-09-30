import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase";

const USERNAME_MIN = 2;
const USERNAME_MAX = 16;

function validateUsername(raw) {
  const username = (raw || "").trim();
  if (username.length < USERNAME_MIN) {
    throw new Error(`Username must be at least ${USERNAME_MIN} characters.`);
  }
  if (username.length > USERNAME_MAX) {
    throw new Error(`Username must be ${USERNAME_MAX} characters or fewer.`);
  }
  if (!/^[a-zA-Z0-9_ ]+$/.test(username)) {
    throw new Error("Username can only contain letters, numbers, spaces, and underscores.");
  }
  return username;
}

export async function enterWithUsername(rawUsername) {
  const username = validateUsername(rawUsername);

  let user = auth.currentUser;
  if (!user) {
    const credential = await signInAnonymously(auth);
    user = credential.user;
  }

  await updateProfile(user, { displayName: username });

  await set(ref(db, `players/${user.uid}`), {
    username,
    updatedAt: Date.now(),
  });

  return { user: auth.currentUser };
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function logOut() {
  return signOut(auth);
}