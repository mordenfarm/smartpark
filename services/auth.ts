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
 * Creates the admin user if it does not already exist.
 * This is a simplified check for a client-side app.
 */
const initializeAdminUser = async () => {
  const adminEmail = 'admin@example.com';
  const adminPassword = '123';

  try {
    // Try to sign in silently. If it works, the user exists.
    // Note: This is a workaround. A better solution involves a server-side check or custom claims.
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    await signOut(auth); // Sign out immediately after check
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // User does not exist, so create them
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: 'admin', // Corrected from 'Admin'
          role: 'admin',
          createdAt: serverTimestamp(),
        });
        console.log('Admin user created successfully.');
        await signOut(auth); // Sign out after creation
      } catch (creationError) {
        console.error('Error creating admin user:', creationError);
      }
    } else {
      // Another error occurred during the sign-in check
      console.error('Error checking for admin user:', error);
    }
  }
};

// Call this function when the app initializes
initializeAdminUser();

export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Store additional user data in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    role: 'user', // Default role
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

  // Store additional user data in Firestore if the user is new
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
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
    // Convert Firestore timestamp to number if it exists
    const data = userDoc.data();
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      data.createdAt = data.createdAt.toDate().getTime();
    }
    return data as User;
  }
  return null;
};