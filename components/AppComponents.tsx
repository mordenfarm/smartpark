import React, { useState, useEffect, FC } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { Card, Button, Modal, Input, Spinner } from './ui';
import type { ParkingLot, Slot } from '../types';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { greenIcon, redIcon, greenSlotIcon, redSlotIcon } from '../services/mapIcons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AppComponents.css';

// Helper for Avatar
const Avatar: React.FC<{ user: { displayName: string | null, email: string | null, photoURL?: string | null } }> = ({ user }) => {
    const getInitials = () => {
        if (user.displayName) {
            return user.displayName.charAt(0).toUpperCase();
        }
        if (user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return '?';
    };

    return (
        <div className="avatar">
            {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="avatar-image" />
            ) : (
                <span className="avatar-initials">{getInitials()}</span>
            )}
        </div>
    );
};


// Header Component
export const Header: React.FC = () => {
    const { user, logout } = useAppContext();
    const navigate = useNavigate();

    return (
        <header className="header">
            <nav className="header-nav">
                <div className="header-brand">
                    <span className="material-symbols-outlined header-logo">local_parking</span>
                    <h1 className="header-title">SmartPark</h1>
                </div>
                <div className="header-links">
                     {user && (
                        <>
                            <NavLink to="/" className={({isActive}) => `header-link ${isActive ? 'active' : ''}`}>Map</NavLink>
                            <NavLink to="/profile" className={({isActive}) => `header-link ${isActive ? 'active' : ''}`}>Profile</NavLink>
                            {user.role === 'admin' && <NavLink to="/admin" className={({isActive}) => `header-link ${isActive ? 'active' : ''}`}>Admin</NavLink>}
                        </>
                    )}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Avatar user={user} />
                                <Button onClick={logout} variant="secondary">Logout</Button>
                            </>
                        ) : (
                            <Button onClick={() => navigate('/login')}>Login</Button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

// Map Control Components
const RecenterView: FC<{center: LatLngExpression, zoom: number}> = ({center, zoom}) => {
    const map = useMap();
     useEffect(() => {
         map.flyTo(center, zoom, { animate: true, duration: 1 });
     }, [center, zoom, map]);
     return null;
}

const LocationMarker: FC = () => { /* ... unchanged ... */ return null}

// Map Component
interface MapComponentProps {
    parkingLots: ParkingLot[];
    slots: Slot[];
    mapView: 'lots' | 'slots';
    onSelectLot: (lot: ParkingLot) => void;
    onSelectSlot: (slot: Slot) => void;
    center: LatLngExpression;
    zoom: number;
}
export const MapComponent: React.FC<MapComponentProps> = ({ parkingLots, slots, mapView, onSelectLot, onSelectSlot, center, zoom }) => {
    return (
        <div className="map-container">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full z-0">
                <RecenterView center={center} zoom={zoom}/>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <LocationMarker />
                {mapView === 'lots' && parkingLots.map(lot => (
                    <Marker
                        key={lot.lotId}
                        position={[lot.coordinates.lat, lot.coordinates.lng]}
                        icon={lot.availableSlots > 0 ? greenIcon : redIcon}
                        eventHandlers={{ click: () => onSelectLot(lot) }}
                    >
                        <Popup><b>{lot.name}</b><br/>{lot.availableSlots} / {lot.totalSlots} available.</Popup>
                    </Marker>
                ))}
                {mapView === 'slots' && slots.map(slot => (
                     <Marker
                        key={slot.slotId}
                        position={[slot.coordinates.lat, slot.coordinates.lng]}
                        icon={slot.status === 'free' ? greenSlotIcon : redSlotIcon}
                        eventHandlers={{ click: () => onSelectSlot(slot) }}
                    >
                        <Popup>{slot.bayNumber} - {slot.status}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

// ParkingLot Detail Panel
interface ParkingLotDetailProps {
    lot: ParkingLot | null;
    onClose: () => void;
    onViewBays: (lot: ParkingLot) => void;
}
export const ParkingLotDetail: React.FC<ParkingLotDetailProps> = ({ lot, onClose, onViewBays }) => {
    return (
        <div className={`parking-lot-detail ${lot ? 'open' : ''}`}>
            {lot && <Card className="w-full">
                <button onClick={onClose} className="close-button">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="detail-title">{lot.name}</h2>
                <div className="detail-info">
                    <p><span className="material-symbols-outlined">attach_money</span>${lot.ratePerHour.toFixed(2)} / hour</p>
                    <p><span className="material-symbols-outlined">event_seat</span>
                        <span className={lot.availableSlots > 0 ? 'text-green-500' : 'text-red-500'}>
                            {lot.availableSlots} / {lot.totalSlots} slots available
                        </span>
                    </p>
                </div>
                <Button onClick={() => onViewBays(lot)} className="w-full mt-4">View Bays</Button>
            </Card>}
        </div>
    );
};


// Reservation Modal
type ReservationStep = 'PLATE_INPUT' | 'LOGIN_PROMPT' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    slot: Slot | null;
    lot: ParkingLot | null;
}
export const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, slot, lot }) => {
    const { user, login, db } = useAppContext();
    const [step, setStep] = useState<ReservationStep>('PLATE_INPUT');
    const [duration, setDuration] = useState(1);
    const [plateNumber, setPlateNumber] = useState('');

    useEffect(() => {
        if(isOpen) {
            setStep(user ? 'PLATE_INPUT' : 'LOGIN_PROMPT');
            setDuration(1);
            setPlateNumber('');
        }
    }, [isOpen, user]);

    useEffect(() => {
        if(isOpen && user && step === 'LOGIN_PROMPT') {
            setStep('PLATE_INPUT');
        }
    }, [user, isOpen, step]);

    if (!lot || !slot) return null;

    const handleProceedFromPlate = () => {
        if (plateNumber.trim().length < 3) {
            alert("Please enter a valid plate number.");
            return;
        }
        setStep('PAYMENT');
    }
    
    const handleConfirmPayment = async () => {
        if(!user) return;
        setStep('PROCESSING');
        await db.createReservation({
            userId: user.uid,
            vehicleId: plateNumber,
            lotId: lot.lotId,
            slotId: slot.slotId,
            startTime: Date.now(),
            endTime: Date.now() + duration * 60 * 60 * 1000,
            durationHours: duration,
            amount: lot.ratePerHour * duration,
            currency: 'ZWL',
            status: 'pending',
        });
        setStep('SUCCESS');
    };

    const totalCost = lot.ratePerHour * duration;

    const renderContent = () => {
        switch (step) {
            case 'LOGIN_PROMPT':
                return (
                    <div className="text-center">
                        <p className="mb-4">Please log in or sign up to continue.</p>
                        <Button onClick={() => login('john@example.com', 'password')}>Login (Mock)</Button>
                    </div>
                );
            case 'PLATE_INPUT':
                return (
                    <div className="space-y-4">
                        <Input id="plate" label="Vehicle Plate Number" value={plateNumber} onChange={e => setPlateNumber(e.target.value.toUpperCase())} required />
                        <Button onClick={handleProceedFromPlate} className="w-full">Proceed</Button>
                    </div>
                );
            case 'PAYMENT':
                return (
                     <div className="space-y-4">
                        <p>Reserving <strong>{slot.bayNumber}</strong> for <strong>{plateNumber}</strong>.</p>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium">Duration: <strong>{duration} hour(s)</strong></label>
                            <input type="range" id="duration" min="1" max="8" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1"/>
                        </div>
                        <Card className="summary-card">
                             <div className="flex justify-between font-bold text-lg"><span>Total:</span> <span>${totalCost.toFixed(2)}</span></div>
                        </Card>
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button onClick={() => setStep('PLATE_INPUT')} variant="tertiary">Back</Button>
                            <Button onClick={handleConfirmPayment}>Confirm & Pay</Button>
                        </div>
                    </div>
                );
            case 'PROCESSING':
                return <div className="flex flex-col items-center justify-center h-48"><Spinner /><p className="mt-4 text-lg">Processing...</p></div>;
            case 'SUCCESS':
                return <div className="flex flex-col items-center justify-center h-48 text-center"><span className="material-symbols-outlined text-6xl text-green-500">check_circle</span><p className="mt-4 text-lg">Reservation Confirmed!</p></div>;
            case 'ERROR':
                 return <div className="flex flex-col items-center justify-center h-48 text-center"><span className="material-symbols-outlined text-6xl text-red-500">error</span><p className="mt-4 text-lg">Payment Failed</p></div>;
        }
    };

    return <Modal isOpen={isOpen} onClose={onClose} title={`Reserve at ${lot.name}`}>{renderContent()}</Modal>;
}

// Admin Dashboard
export const AdminDashboard: React.FC = () => {
    const { db } = useAppContext();
    const { adminStats } = db;

    const PIE_COLORS = ['#9333ea', '#f472b6', '#a3a3a3', '#f5f5f5'];

    return (
        <div className="admin-dashboard">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="stats-grid">
                <Card><h3 className="stat-title">Total Revenue</h3><p className="stat-value">${adminStats.totalRevenue.toFixed(2)}</p></Card>
                <Card><h3 className="stat-title">Active Users</h3><p className="stat-value">{adminStats.activeUsers}</p></Card>
                <Card><h3 className="stat-title">Today's Bookings</h3><p className="stat-value">{adminStats.todaysBookings}</p></Card>
                <Card><h3 className="stat-title">Occupancy</h3><p className="stat-value">{adminStats.overallOccupancy}%</p></Card>
            </div>

            <div className="charts-grid">
                <Card className="chart-card">
                    <h3 className="chart-title">Occupancy Distribution</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={adminStats.occupancyDistribution} cx="50%" cy="50%" labelLine={false} outerRadius="80%" fill="#8884d8" dataKey="value" nameKey="name" label>
                                {adminStats.occupancyDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--primary-color)' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="chart-card">
                    <h3 className="chart-title">Recent Reservations</h3>
                    <div className="reservations-list">
                        {db.reservations.slice(0, 10).map(res => {
                            const lot = db.parkingLots.find(l => l.lotId === res.lotId);
                            const user = db.users.find(u => u.uid === res.userId);
                            return (
                                <div key={res.resId} className="reservation-item">
                                    <p><strong>{lot?.name}</strong> by {user?.name || 'Unknown'}</p>
                                    <p>${res.amount.toFixed(2)} - <span className="capitalize">{res.status}</span></p>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};