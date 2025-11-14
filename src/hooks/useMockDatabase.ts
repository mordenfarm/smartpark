import { useState, useEffect } from 'react';
import { ParkingLot, Slot, Reservation, User } from '../types';

const initialParkingLots: ParkingLot[] = [
    { lotId: 'A1', name: 'Main Street Lot', coordinates: { lat: -20.0744, lng: 30.8329 }, totalSlots: 50, availableSlots: 25, ratePerHour: 1.50 },
    { lotId: 'B2', name: 'City Center Garage', coordinates: { lat: -20.0755, lng: 30.8310 }, totalSlots: 100, availableSlots: 10, ratePerHour: 2.00 },
    { lotId: 'C3', name: 'Library Parking', coordinates: { lat: -20.0730, lng: 30.8350 }, totalSlots: 30, availableSlots: 30, ratePerHour: 1.00 },
];

const generateSlots = (lot: ParkingLot): Slot[] => {
    const slots: Slot[] = [];
    for (let i = 1; i <= lot.totalSlots; i++) {
        const isOccupied = i > lot.availableSlots;
        slots.push({
            slotId: `${lot.lotId}-${i}`,
            lotId: lot.lotId,
            bayNumber: `A${i}`,
            status: isOccupied ? 'occupied' : 'free',
            coordinates: {
                lat: lot.coordinates.lat + (Math.random() - 0.5) * 0.001,
                lng: lot.coordinates.lng + (Math.random() - 0.5) * 0.001
            }
        });
    }
    return slots;
};

const initialSlots: Slot[] = initialParkingLots.flatMap(generateSlots);

export const useMockDatabase = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>(initialParkingLots);
    const [slots, setSlots] = useState<Slot[]>(initialSlots);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [notifications, setNotifications] = useState([
        { id: '1', userId: '1', message: 'Your reservation for Lot A is confirmed.', read: false, timestamp: new Date() },
        { id: '2', userId: '1', message: 'Your reservation is expiring in 15 minutes.', read: true, timestamp: new Date(Date.now() - 3600000) },
    ]);
    const [vehicles, setVehicles] = useState([
        { vehicleId: 'V1', userId: '1', plateNumber: 'ABC 123', make: 'Toyota', color: 'Blue' }
    ]);

    const getSlotsForLot = (lotId: string) => slots.filter(slot => slot.lotId === lotId);

    const createReservation = async (reservation: Omit<Reservation, 'resId' | 'status'>) => {
        const newReservation: Reservation = {
            ...reservation,
            resId: `res-${Date.now()}`,
            status: 'confirmed'
        };
        setReservations(prev => [...prev, newReservation]);
        setSlots(prev => prev.map(s => s.slotId === newReservation.slotId ? { ...s, status: 'occupied' } : s));
        setParkingLots(prev => prev.map(p => p.lotId === newReservation.lotId ? { ...p, availableSlots: p.availableSlots - 1 } : p));
        return newReservation;
    };

    const getReservationsForUser = (userId: string) => {
        return reservations.filter(r => r.userId === userId);
    }

    const getVehiclesForUser = (userId: string) => {
        return vehicles.filter(v => v.userId === userId);
    }

    const clearUsers = () => {
        setUsers([]);
    }

    const adminStats = {
        totalRevenue: reservations.reduce((sum, r) => sum + r.amount, 0),
        activeUsers: users.length,
        todaysBookings: reservations.filter(r => new Date(r.startTime).toDateString() === new Date().toDateString()).length,
        overallOccupancy: Math.round((slots.filter(s => s.status === 'occupied').length / slots.length) * 100),
        occupancyDistribution: parkingLots.map(lot => ({
            name: lot.name,
            value: lot.totalSlots - lot.availableSlots
        }))
    };

    return { users, parkingLots, slots, reservations, notifications, vehicles, getSlotsForLot, createReservation, getReservationsForUser, getVehiclesForUser, adminStats, clearUsers };
};

export type MockDatabase = ReturnType<typeof useMockDatabase>;