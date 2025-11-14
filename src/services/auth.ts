import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { app, db } from "@/services/firebase-config";
import type { User } from '@/types';

export const auth = getAuth(app);

export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, { displayName });

  const newUser: User = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName!,
    photoURL: user.photoURL,
    role: 'user', // Default role
  };

  await setDoc(doc(db, "users", user.uid), newUser);
  return newUser;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return await getUserProfile(userCredential.user.uid);
};

const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
        const newUser: User = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName!,
            photoURL: user.photoURL,
            role: 'user',
        };
        await setDoc(doc(db, "users", user.uid), newUser);
        return newUser;
    }
    return userDoc.data() as User;
};

export const doSignOut = (): Promise<void> => {
  return signOut(auth);
};

export const getUserProfile = async (uid: string): Promise<User> => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        return userDoc.data() as User;
    }
    throw new Error("User profile not found");
};

export { onAuthStateChanged };
export type { FirebaseUser };