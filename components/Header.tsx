import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">SmartPark</Link>
      </div>
      <nav>
        {user ? (
          <>
            <Link to="/admin">Admin</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={() => signOut(auth)}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;