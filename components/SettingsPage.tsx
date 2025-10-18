import React, { useState } from 'react';
import { useAppContext } from '../App';
import { Input, Button, Card } from './ui';

const SettingsPage: React.FC = () => {
    const { user, logout } = useAppContext();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { updateUser, changePassword } = useAppContext().db;

    const handleUpdateProfile = () => {
        if (user) {
            updateUser({ ...user, displayName });
            alert('Profile updated successfully!');
        }
    };

    const handleChangePassword = () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (user) {
            changePassword(user.uid, password);
            alert('Password changed successfully!');
        }
    };

    const handleThemeChange = (theme: 'light' | 'dark') => {
        if (user) {
            updateUser({ ...user, theme });
            alert(`Theme changed to ${theme}`);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <Card className="mb-4">
                <h2 className="text-xl font-bold mb-2">Profile Settings</h2>
                <div className="space-y-4">
                    <Input id="displayName" label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    <Button onClick={handleUpdateProfile}>Update Profile</Button>
                </div>
            </Card>
            <Card className="mb-4">
                <h2 className="text-xl font-bold mb-2">Change Password</h2>
                <div className="space-y-4">
                    <Input id="password" label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Input id="confirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Button>Change Password</Button>
                </div>
            </Card>
            <Card className="mb-4">
                <h2 className="text-xl font-bold mb-2">Theme</h2>
                <div className="flex space-x-4">
                    <Button onClick={() => handleThemeChange('light')}>Light Mode</Button>
                    <Button onClick={() => handleThemeChange('dark')}>Dark Mode</Button>
                </div>
            </Card>
            <Button onClick={logout} variant="secondary">Logout</Button>
        </div>
    );
};

export default SettingsPage;