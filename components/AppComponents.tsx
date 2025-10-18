import React, { useState, useEffect, FC } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createReservation } from '../services/firestore';
import { Card, Button, Modal, Input, Spinner } from './ui';
import type { ParkingLot, Slot } from '../types';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { greenIcon, redIcon, greenSlotIcon, redSlotIcon } from '../services/mapIcons';
import { auth } from '../services/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AppComponents.css';

// Header Component
export const Header: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    }

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
                            {/* Add admin link based on user role from firestore */}
                        </>
                    )}
                    {user ? (
                        <Button onClick={handleLogout} variant="secondary">Logout</Button>
                    ) : (
                        <Button onClick={() => navigate('/login')}>Login</Button>
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
                        icon={(lot.totalSlots - (lot.occupiedSlots || 0)) > 0 ? greenIcon : redIcon}
                        eventHandlers={{ click: () => onSelectLot(lot) }}
                    >
                        <Popup><b>{lot.name}</b><br/>{(lot.totalSlots - (lot.occupiedSlots || 0))} / {lot.totalSlots} available.</Popup>
                    </Marker>
                ))}
                {mapView === 'slots' && slots.map(slot => (
                     <Marker
                        key={slot.slotId}
                        position={[slot.coordinates.lat, slot.coordinates.lng]}
                        icon={slot.status === 'free' ? greenSlotIcon : redSlotIcon}
                        eventHandlers={{ click: () => onSelectSlot(slot) }}
                    >
                        <Popup>{slot.slotNumber} - {slot.status}</Popup>
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
                    <p><span className="material-symbols-outlined">attach_money</span>${(lot.ratePerHour || 0).toFixed(2)} / hour</p>
                    <p><span className="material-symbols-outlined">event_seat</span>
                        <span className={(lot.totalSlots - (lot.occupiedSlots || 0)) > 0 ? 'text-green-500' : 'text-red-500'}>
                            {(lot.totalSlots - (lot.occupiedSlots || 0))} / {lot.totalSlots} slots available
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
    const { user } = useAuth();
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
        if(!user || !slot) return;
        setStep('PROCESSING');

        const reservationData = {
            userId: user.uid,
            slotId: slot.slotId,
            startTime: new Date(),
            endTime: new Date(Date.now() + duration * 60 * 60 * 1000),
        };

        const result = await createReservation(reservationData);

        if (result.success) {
            setStep('SUCCESS');
        } else {
            setStep('ERROR');
        }
    };

    const totalCost = (lot.ratePerHour || 0) * duration;

    const navigate = useNavigate();
    const renderContent = () => {
        switch (step) {
            case 'LOGIN_PROMPT':
                return (
                    <div className="text-center">
                        <p className="mb-4">Please log in or sign up to continue.</p>
                        <Button onClick={() => navigate('/login')}>Login</Button>
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
                        <p>Reserving <strong>{slot.slotNumber}</strong> for <strong>{plateNumber}</strong>.</p>
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
// Temporarily disabled until connected to Firestore
export const AdminDashboard: React.FC<any> = () => null;