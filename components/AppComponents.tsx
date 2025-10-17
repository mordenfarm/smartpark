import React, { useState, useEffect, FC } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Modal, Input, Spinner } from './ui';
import type { ParkingLot, Slot } from '../types';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { greenIcon, redIcon, greenSlotIcon, redSlotIcon } from '../services/mapIcons';
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
                        icon={lot.freeSlots > 0 ? greenIcon : redIcon}
                        eventHandlers={{ click: () => onSelectLot(lot) }}
                    >
                        <Popup><b>{lot.name}</b><br/>{lot.freeSlots} / {lot.totalSlots} available.</Popup>
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
// Temporarily disabled until connected to Firestore
export const ReservationModal: React.FC<any> = () => null;

// Admin Dashboard
// Temporarily disabled until connected to Firestore
export const AdminDashboard: React.FC<any> = () => null;