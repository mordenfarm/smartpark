import React from 'react';
import { NavLink } from 'react-router-dom';
import './Dock.css';

const Dock: React.FC = () => {
    return (
        <nav className="dock">
            <NavLink to="/" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined">home</span>
                <span className="dock-text">Home</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined">person</span>
                <span className="dock-text">Profile</span>
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined">notifications</span>
                <span className="dock-text">Notifications</span>
                <span className="notification-badge">3</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined">settings</span>
                <span className="dock-text">Settings</span>
            </NavLink>
        </nav>
    );
};

export default Dock;