import React, { useState, useEffect, FC } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme, useAppContext } from '../App';
import { Card, Button, Modal, Input, Spinner } from './ui';
import type { ParkingLot, Reservation, User, Slot } from '../types';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { greenIcon, redIcon, blueIcon, greenSlotIcon, redSlotIcon } from '../services/mapIcons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Theme Toggle Component
export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors">
      <span className="material-symbols-outlined">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

// Header Component
export const Header: React.FC = () => {
    const { user, logout } = useAppContext();
    const navigate = useNavigate();

    return (
        <header className="bg-[var(--md-sys-color-surface)] shadow-md sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                    <span className="material-symbols-outlined text-3xl text-[var(--md-sys-color-primary)]">local_parking</span>
                    <h1 className="text-xl font-bold">SmartPark Masvingo</h1>
                </div>
                <div className="flex items-center space-x-4">
                     {user && (
                        <>
                            <NavLink to="/" className={({isActive}) => `text-sm font-medium ${isActive ? 'text-[var(--md-sys-color-primary)]' : 'hover:text-[var(--md-sys-color-primary)]'}`}>Map</NavLink>
                            <NavLink to="/profile" className={({isActive}) => `text-sm font-medium ${isActive ? 'text-[var(--md-sys-color-primary)]' : 'hover:text-[var(--md-sys-color-primary)]'}`}>Profile</NavLink>
                            {user.role === 'admin' && <NavLink to="/admin" className={({isActive}) => `text-sm font-medium ${isActive ? 'text-[var(--md-sys-color-primary)]' : 'hover:text-[var(--md-sys-color-primary)]'}`}>Admin</NavLink>}
                        </>
                    )}
                    <ThemeToggle />
                    {user ? (
                        <Button onClick={logout} variant="secondary">Logout</Button>
                    ) : (
                        <Button onClick={() => navigate('/login')}>Login / Signup</Button>
                    )}
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

const LocationMarker: FC = () => { /* ... unchanged ... */ }

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
        <div className="h-full w-full relative">
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
        <div className={`absolute top-20 right-0 z-10 w-full max-w-sm p-4 transition-transform duration-500 ease-in-out ${lot ? 'translate-x-0' : 'translate-x-full'}`}>
            {lot && <Card className="shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h2 className="text-2xl font-bold mb-2 text-[var(--md-sys-color-primary)]">{lot.name}</h2>
                <div className="space-y-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    <p className="flex items-center"><span className="material-symbols-outlined mr-2">attach_money</span>${lot.ratePerHour.toFixed(2)} / hour</p>
                    <p className="flex items-center"><span className="material-symbols-outlined mr-2">event_seat</span>
                        <span className={lot.availableSlots > 0 ? 'text-green-500' : 'text-red-500'}>
                            {lot.availableSlots} / {lot.totalSlots} slots available
                        </span>
                    </p>
                </div>
                <Button onClick={() => onViewBays(lot)} className="w-full mt-6">View Bays</Button>
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
            // Reset state on open
            setStep(user ? 'PLATE_INPUT' : 'LOGIN_PROMPT');
            setDuration(1);
            setPlateNumber('');
        }
    }, [isOpen, user]);

    useEffect(() => {
        // If user logs in while modal is open, move to next step
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
            vehicleId: plateNumber, // Using plate number as vehicleId
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
                        <p className="mb-4">Please log in or sign up to continue with your reservation.</p>
                        <Button onClick={() => {
                            // In a real app, you'd navigate or show a login overlay.
                            // Here we just simulate logging in the mock user.
                            login('john@example.com', 'password');
                        }}>Login with Google (Mock)</Button>
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
                        <p>Reserving <strong>{slot.bayNumber}</strong> for vehicle <strong>{plateNumber}</strong>.</p>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">Parking Duration: <strong>{duration} hour(s)</strong></label>
                            <input type="range" id="duration" min="1" max="8" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full h-2 bg-[var(--md-sys-color-surface-variant)] rounded-lg appearance-none cursor-pointer mt-1"/>
                        </div>
                        <Card className="bg-[var(--md-sys-color-surface-container)]">
                             <div className="flex justify-between font-bold text-lg"><span>Total Cost:</span> <span>${totalCost.toFixed(2)}</span></div>
                        </Card>
                         <p className="text-xs text-center text-[var(--md-sys-color-on-surface-variant)]">Payment will be processed via ZB Pay (mocked).</p>
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button onClick={() => setStep('PLATE_INPUT')} variant="tertiary">Back</Button>
                            <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700 text-white">Pay with Ecocash</Button>
                        </div>
                    </div>
                );
            case 'PROCESSING':
                return <div className="flex flex-col items-center justify-center h-48"><Spinner /><p className="mt-4 text-lg">Processing Payment...</p></div>;
            case 'SUCCESS':
                return <div className="flex flex-col items-center justify-center h-48 text-center"><span className="material-symbols-outlined text-6xl text-green-500">check_circle</span><p className="mt-4 text-lg">Reservation Confirmed!</p><p>Your spot at {slot.bayNumber} is secure.</p></div>;
            case 'ERROR':
                 return <div className="flex flex-col items-center justify-center h-48 text-center"><span className="material-symbols-outlined text-6xl text-red-500">error</span><p className="mt-4 text-lg">Payment Failed</p><p>Please try again.</p></div>;
        }
    };

    return <Modal isOpen={isOpen} onClose={onClose} title={`Reserve at ${lot.name}`}>{renderContent()}</Modal>;
}

// Admin Dashboard
export const AdminDashboard: React.FC = () => {
    const { db } = useAppContext();
    const { adminStats } = db;

    const PIE_COLORS = ['#4A55E0', '#5B5D72', '#77536D', '#8A8894'];

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card><h3 className="text-lg font-semibold">Total Revenue</h3><p className="text-3xl font-bold mt-2">${adminStats.totalRevenue.toFixed(2)}</p></Card>
                <Card><h3 className="text-lg font-semibold">Active Users</h3><p className="text-3xl font-bold mt-2">{adminStats.activeUsers}</p></Card>
                <Card><h3 className="text-lg font-semibold">Today's Bookings</h3><p className="text-3xl font-bold mt-2">{adminStats.todaysBookings}</p></Card>
                <Card><h3 className="text-lg font-semibold">Overall Occupancy</h3><p className="text-3xl font-bold mt-2">{adminStats.overallOccupancy}%</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-96 p-4">
                    <h3 className="text-lg font-semibold mb-4">Parking Lot Occupancy</h3>
                     <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={adminStats.occupancyDistribution} cx="50%" cy="50%" labelLine={false} outerRadius="80%" fill="#8884d8" dataKey="value" nameKey="name" label>
                                {adminStats.occupancyDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'var(--md-sys-color-surface-container-high)', border: '1px solid var(--md-sys-color-outline)' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="h-96 p-4">
                    <h3 className="text-lg font-semibold mb-4">Recent Reservations</h3>
                    <div className="overflow-y-auto h-[85%]">
                        {db.reservations.slice(0, 10).map(res => {
                            const lot = db.parkingLots.find(l => l.lotId === res.lotId);
                            const user = db.users.find(u => u.uid === res.userId);
                            return (
                                <div key={res.resId} className="text-sm p-2 rounded-md bg-[var(--md-sys-color-surface-container)] mb-2">
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
