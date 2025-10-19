import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { Card, Button } from '../components/ui';

// Countdown Timer and Progress Bar Component
const ReservationTimer: React.FC<{ startTime: number, endTime: number }> = ({ startTime, endTime }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const totalDuration = endTime - startTime;
    const elapsedTime = now - startTime;
    const progress = Math.min((elapsedTime / totalDuration) * 100, 100);

    const timeLeftMs = Math.max(0, endTime - now);
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    return (
        <div>
            <div className="flex justify-between text-sm font-medium mb-1">
                <span>Time Left</span>
                <span>{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
            </div>
            <div className="w-full bg-surface-hover rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const NotificationsPage: React.FC = () => {
    const { user, db } = useAppContext();

    if (!user) {
        return <div className="p-4">Loading notifications...</div>;
    }

    const activeReservations = db.getReservationsForUser(user.uid).filter(r => r.status === 'active');

    const handleMarkAsLeft = async (reservationId: string) => {
        if (window.confirm("Are you sure you want to mark this parking as complete?")) {
            await db.completeReservation(reservationId);
            // In a real app, state would update automatically via context/subscription
            // For this mock setup, a forced re-render or component state update might be needed
            // but given the current structure, AppContext provider's value change should trigger it.
            alert("Parking session completed!");
        }
    };

    return (
        <div className="notifications-page p-4 md:p-6 lg:p-8 animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">Notifications</h1>

            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-primary">directions_car</span>
                    Active Reservations
                </h2>
                {activeReservations.length > 0 ? (
                    <div className="space-y-6">
                        {activeReservations.map(res => {
                            const lot = db.getLotById(res.lotId);
                            return (
                                <div key={res.resId} className="p-4 rounded-lg bg-surface-hover">
                                    <h3 className="font-bold text-lg">{lot?.name || 'Unknown Lot'}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">Lot: {lot?.name}, Bay: {res.slotId.split('-').pop()}</p>
                                    <ReservationTimer startTime={res.startTime} endTime={res.endTime} />
                                    <Button
                                        onClick={() => handleMarkAsLeft(res.resId)}
                                        className="w-full mt-4"
                                    >
                                        Mark as Left
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>You have no active reservations.</p>
                )}
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-primary">notifications</span>
                    General
                </h2>
                <div className="space-y-4">
                    {/* Example Notification */}
                    <div className="flex items-start">
                        <div className="notification-icon-general">
                            <span className="material-symbols-outlined">campaign</span>
                        </div>
                        <div>
                            <p className="font-semibold">System Announcement</p>
                            <p className="text-sm text-muted-foreground">Welcome to SmartPark Masvingo! We are excited to have you.</p>
                        </div>
                    </div>
                     <div className="flex items-start">
                        <div className="notification-icon-promo">
                            <span className="material-symbols-outlined">local_offer</span>
                        </div>
                        <div>
                            <p className="font-semibold">Special Offer!</p>
                            <p className="text-sm text-muted-foreground">Get 10% off on your next 5 bookings. Use code: SMART10</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default NotificationsPage;
