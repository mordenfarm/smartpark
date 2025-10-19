```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMockDatabase, MockDatabase } from '../hooks/useMockDatabase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, getUserProfile, doSignOut } from '../services/auth';
import type { User } from '../types';

interface AppContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => void;
  db: ReturnType<typeof useMockDatabase>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const db = useMockDatabase();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await doSignOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const value = { user, firebaseUser, loading, logout, db };

  useEffect(() => {
    (window as any).db = db;
    (window as any).clearUsers = db.clearUsers;
  }, [db]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```