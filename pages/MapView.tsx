import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { ParkingLot, Slot } from '../types';
import { MapComponent, ParkingLotDetail, ReservationModal } from '../components/AppComponents';
import { Button } from '../components/ui';
import { LatLngExpression } from 'leaflet';

const MapView: React.FC = () => {
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);

    useEffect(() => {
        const fetchParkingLots = async () => {
            const querySnapshot = await getDocs(collection(db, "parkingLots"));
            const lots = querySnapshot.docs.map(doc => ({ lotId: doc.id, ...doc.data() })) as ParkingLot[];
            setParkingLots(lots);
        };

        const fetchSlots = async () => {
            const querySnapshot = await getDocs(collection(db, "slots"));
            const slotsData = querySnapshot.docs.map(doc => ({ slotId: doc.id, ...doc.data() })) as Slot[];
            setSlots(slotsData);
        };

        fetchParkingLots();
        fetchSlots();
    }, []);

    const [mapView, setMapView] = useState<'lots' | 'slots'>('lots');
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([-20.0744, 30.8329]);
    const [mapZoom, setMapZoom] = useState(14);

    const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
    const [focusedLot, setFocusedLot] = useState<ParkingLot | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [isReserveModalOpen, setReserveModalOpen] = useState(false);

    const slotsForFocusedLot = useMemo(() => {
        return focusedLot ? slots.filter(slot => slot.lotId === focusedLot.lotId) : [];
    }, [focusedLot, slots]);

    const handleSelectLot = (lot: ParkingLot) => {
        setSelectedLot(lot);
        setMapCenter([lot.coordinates.lat, lot.coordinates.lng]);
        setMapZoom(16);
    };

    const handleViewBays = (lot: ParkingLot) => {
        setFocusedLot(lot);
        setSelectedLot(null);
        setMapView('slots');
        setMapZoom(19);
        setMapCenter([lot.coordinates.lat, lot.coordinates.lng]);
    };

    const handleSelectSlot = (slot: Slot) => {
        if(slot.status === 'free'){
            setSelectedSlot(slot);
            setReserveModalOpen(true);
        } else {
            alert("This bay is currently occupied.");
        }
    };

    const handleCloseModal = () => {
        setReserveModalOpen(false);
        setSelectedSlot(null);
    };

    const handleBackToLotsView = () => {
        setMapView('lots');
        setFocusedLot(null);
        setSelectedLot(null);
        setMapZoom(14);
        setMapCenter([-20.0744, 30.8329]);
    };

    return (
        <div className="home-page">
            <MapComponent
                parkingLots={parkingLots}
                slots={slotsForFocusedLot}
                mapView={mapView}
                onSelectLot={handleSelectLot}
                onSelectSlot={handleSelectSlot}
                center={mapCenter}
                zoom={mapZoom}
            />
            {mapView === 'slots' && (
                <div className="absolute top-4 left-4 z-10 animate-fadeIn">
                    <Button onClick={handleBackToLotsView} variant="secondary">
                        <span className="material-symbols-outlined mr-2">arrow_back</span>
                        View All Parking Lots
                    </Button>
                </div>
            )}
            <ParkingLotDetail lot={selectedLot} onClose={() => setSelectedLot(null)} onViewBays={handleViewBays} />
            <ReservationModal
                isOpen={isReserveModalOpen}
                onClose={handleCloseModal}
                slot={selectedSlot}
                lot={focusedLot}
            />
        </div>
    );
};

export default MapView;