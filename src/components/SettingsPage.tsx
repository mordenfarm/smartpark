import React from 'react';
import { Card, Button, Input } from './ui';
import { useAppContext } from '../contexts/AppContext';

const SettingsPage: React.FC = () => {
    const { logout } = useAppContext();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <Card className="mb-4">
                <h2 className="text-xl font-bold mb-2">Account</h2>
                <div className="space-y-4">
                    <Input id="username" label="Username" type="text" defaultValue="CurrentUsername" />
                    <Input id="password" label="New Password" type="password" />
                    <Button>Update Profile</Button>
                </div>
            </Card>
            <Card className="mb-4">
                <h2 className="text-xl font-bold mb-2">Theme</h2>
                {/* Theme options can be implemented here */}
                <p>Theme selection coming soon.</p>
            </Card>
            <Card>
                <Button onClick={logout} variant="danger" className="w-full">Logout</Button>
            </Card>
        </div>
    );
};

export default SettingsPage;