import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../App';
import './Dock.css';

const Dock: React.FC = () => {
    const { db } = useAppContext();
    const unreadNotifications = db.notifications.filter(n => !n.read).length;

    return (
        <nav className="dock-container">
            <NavLink to="/" className="dock-item" end>
                <span className="material-symbols-outlined">home</span>
                <span className="dock-label">Home</span>
            </NavLink>
            <NavLink to="/profile" className="dock-item">
                <span className="material-symbols-outlined">person</span>
                <span className="dock-label">Profile</span>
            </NavLink>
            <NavLink to="/notifications" className="dock-item">
                <span className="material-symbols-outlined">notifications</span>
                <span className="dock-label">Notifications</span>
                {unreadNotifications > 0 && (
                    <span className="notification-badge">{unreadNotifications}</span>
                )}
            </NavLink>
            <NavLink to="/settings" className="dock-item">
                <span className="material-symbols-outlined">settings</span>
                <span className="dock-label">Settings</span>
            </NavLink>
        </nav>
    );
};

export default Dock;