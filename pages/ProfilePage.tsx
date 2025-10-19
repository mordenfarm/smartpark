import React from 'react';
import { useAppContext } from '../App';
import { Card } from '../components/ui';

const ProfilePage: React.FC = () => {
    const { user, db } = useAppContext();

    if (!user) {
        return <div className="p-4">Loading user profile...</div>;
    }

    const userReservations = db.getReservationsForUser(user.uid);

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const calculateDuration = (startTime: number, endTime: number) => {
        const durationMs = endTime - startTime;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="profile-page p-4 md:p-6 lg:p-8 animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">User Details</h2>
                <div className="space-y-2">
                    <p><strong>Name:</strong> {user.displayName || 'N/A'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Reservation History</h2>
                {userReservations.length > 0 ? (
                    <div className="space-y-4">
                        {userReservations.map(res => {
                            const lot = db.getLotById(res.lotId);
                            return (
                                <div key={res.resId} className="reservation-history-item">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{lot?.name || 'Unknown Lot'}</h3>
                                            <p className="text-sm text-muted-foreground">Plate: {res.vehicleId}</p>
                                        </div>
                                        <div className={`status-badge ${res.status}`}>{res.status}</div>
                                    </div>
                                    <div className="mt-2 text-sm space-y-1">
                                       <p><strong>From:</strong> {formatTimestamp(res.startTime)}</p>
                                       <p><strong>To:</strong> {formatTimestamp(res.endTime)}</p>
                                       <p><strong>Duration:</strong> {calculateDuration(res.startTime, res.endTime)}</p>
                                       <p><strong>Cost:</strong> ${res.amount.toFixed(2)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>You have no past reservations.</p>
                )}
            </Card>
        </div>
    );
};

export default ProfilePage;
