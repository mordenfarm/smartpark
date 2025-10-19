import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { Card, Input, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
    const { user, db, logout } = useAppContext();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    if (!user) {
        return <div className="p-4">Loading settings...</div>;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (displayName.trim() !== user.displayName) {
            await db.updateUser(user.uid, { displayName: displayName.trim() });
            alert('Profile updated successfully!');
            // Note: In a real app, you might need to refresh the user context
        }
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="settings-page p-4 md:p-6 lg:p-8 animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <Input id="displayName" label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    <Input id="email" label="Email" value={user.email || ''} disabled />
                    <Button type="submit">Save Changes</Button>
                </form>
            </Card>

            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Change Password</h2>
                <p className="text-muted-foreground mb-4">For security, password changes are handled through a secure process.</p>
                <Button variant="secondary" onClick={() => alert("Password change feature coming soon!")}>
                    Change Password
                </Button>
            </Card>

            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Appearance</h2>
                 <div className="flex items-center space-x-4">
                    <p>Theme:</p>
                    <Button variant={theme === 'light' ? 'primary' : 'secondary'} onClick={() => handleThemeChange('light')}>Light</Button>
                    <Button variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={() => handleThemeChange('dark')}>Dark</Button>
                </div>
            </Card>

             <Card>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Account</h2>
                <Button variant="danger" onClick={handleLogout}>
                    Logout
                </Button>
            </Card>
        </div>
    );
};

export default SettingsPage;
