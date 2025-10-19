import React, { useState, useEffect } from 'react';
import { Card, Button, ProgressBar } from './components/ui';

interface ReservationNotificationProps {
    reservation: {
        lotName: string;
        lotNumber: string;
        timeLeft: number; // in seconds
    };
    onMarkAsLeft: () => void;
}

const ReservationNotification: React.FC<ReservationNotificationProps> = ({ reservation, onMarkAsLeft }) => {
    const [timeLeft, setTimeLeft] = useState(reservation.timeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const progress = (timeLeft / reservation.timeLeft) * 100;

    return (
        <div className="reservation-notification">
            <Card>
                <h3 className="text-lg font-bold">Reservation Approved!</h3>
                <p>Lot: {reservation.lotName}, Bay: {reservation.lotNumber}</p>
                <div className="my-2">
                    <p>Time Left: {formatTime(timeLeft)}</p>
                    <ProgressBar progress={progress} />
                </div>
                <Button onClick={onMarkAsLeft}>Mark as Left</Button>
            </Card>
        </div>
    );
};

export default ReservationNotification;