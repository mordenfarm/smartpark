import React from 'react';
import { Card } from './ui';

const NotificationsPage: React.FC = () => {
    // Mock data for now
    const notifications = [
        { id: 1, message: "Your reservation for Lot A, Bay 5 is confirmed.", time: "10 minutes ago", read: false },
        { id: 2, message: "Admin has sent an announcement.", time: "1 hour ago", read: true },
        { id: 3, message: "Your parking time is about to expire.", time: "2 hours ago", read: true },
    ];

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <Card>
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b ${!notif.read ? 'font-bold' : ''}`}>
                        <p>{notif.message}</p>
                        <p className="text-sm text-gray-500">{notif.time}</p>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default NotificationsPage;