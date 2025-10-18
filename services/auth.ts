import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
import { User } from '../types';

const googleProvider = new GoogleAuthProvider();

/**
 * Creates the admin user if it has not been created before.
 * It uses a flag in Firestore to ensure it only runs once.
 */
const initializeAdminUser = async () => {
  const flagRef = doc(db, 'meta', 'admin-created-flag');
  const flagDoc = await getDoc(flagRef);

  if (!flagDoc.exists()) {
    console.log("Admin creation flag not found. Attempting to create admin user...");
    const adminEmail = 'admin@example.com';
    const adminPassword = '123';

    try {
      // Create the user in Firebase Auth. This also signs the new user in.
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const user = userCredential.user;

      // Store additional user data in Firestore.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: 'admin',
        role: 'admin',
        createdAt: serverTimestamp(),
        photoURL: null,
      });

      // Set the flag to prevent this from running again.
      await setDoc(flagRef, { initialized: true, timestamp: serverTimestamp() });

      console.log('Admin user created successfully and flag set.');

      // Sign out the newly created admin user so the app starts in a clean state for the actual user.
      await signOut(auth);

    } catch (error: any) {
       if (error.code === 'auth/email-already-in-use') {
         // This can happen if admin was created in Auth but the flag failed to set.
         // We assume the setup is complete and just set the flag to prevent future runs.
         await setDoc(flagRef, { initialized: true, timestamp: serverTimestamp(), recovered: true });
         console.log("Admin user already exists in Auth. Setting flag to recover state.");
       } else {
        // For any other error (e.g., network, security rules), we log it.
        console.error('An unexpected error occurred during admin user creation:', error);
       }
    }
  }
};

// Call this function when the app initializes.
// We wrap it in a self-executing function to catch any top-level errors.
(async () => {
  try {
    await initializeAdminUser();
  } catch (error) {
    console.error("Failed to initialize admin user:", error);
  }
})();


export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    photoURL: null,
    role: 'user',
    createdAt: serverTimestamp(),
  });

  return user;
};

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'user',
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

export const doSignOut = async (): Promise<void> => {
  return await signOut(auth);
};

export const onAuthChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    // Convert Firestore timestamp to a number for client-side use
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      data.createdAt = data.createdAt.toDate().getTime();
    }
    return data as User;
  }
  return null;
};