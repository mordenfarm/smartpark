import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { Card, Button } from './ui';
import type { Reservation } from '../types';

const NotificationsPage: React.FC = () => {
    const { user, db } = useAppContext();
    const { notifications, reservations, markNotificationAsRead } = db;

    useEffect(() => {
        if (user) {
            notifications.forEach(n => {
                if (!n.read) {
                    markNotificationAsRead(n.id);
                }
            });
        }
    }, [user, notifications, markNotificationAsRead]);

    const handleMarkAsLeft = (resId: string) => {
        db.markReservationAsCompleted(resId);
        alert('You have successfully marked the parking as left.');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            {notifications.map(n => (
                <Card key={n.id} className="mb-2">
                    <p>{n.message}</p>
                </Card>
            ))}
            {reservations.filter(r => r.status === 'active').map(res => {
                const lot = db.parkingLots.find(l => l.lotId === res.lotId);
                const timeLeft = res.endTime - Date.now();
                const progress = Math.max(0, (1 - timeLeft / (res.durationHours * 60 * 60 * 1000)) * 100);

                return (
                    <Card key={res.resId} className="mb-4">
                        <h2 className="text-xl font-bold">Reservation Approved</h2>
                        <p><strong>Lot:</strong> {lot?.name}</p>
                        <p><strong>Slot:</strong> {res.slotId}</p>
                        <div className="my-2">
                            <p>Time Left: {`${Math.floor(timeLeft / (1000 * 60 * 60 * 24))}d ${Math.floor((timeLeft / (1000 * 60 * 60)) % 24)}h ${Math.floor((timeLeft / 1000 / 60) % 60)}m`}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                        <Button onClick={() => handleMarkAsLeft(res.resId)}>Mark as Left</Button>
                    </Card>
                );
            })}
        </div>
    );
};

export default NotificationsPage;