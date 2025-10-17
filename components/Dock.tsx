import React from 'react';
import { NavLink } from 'react-router-dom';
import './Dock.css';

const Dock: React.FC = () => {
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
            <NavLink to="/admin" className="dock-item">
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span className="dock-label">Admin</span>
            </NavLink>
        </nav>
    );
};

export default Dock;