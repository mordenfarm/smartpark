import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ParkingLot, Reservation, User, Vehicle, Payment, Slot } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Seed Data
const initialParkingLots: ParkingLot[] = [
  { lotId: 'lot1', name: 'TM Pick n Pay', city: 'Masvingo', coordinates: { lat: -20.0744, lng: 30.8329 }, totalSlots: 20, availableSlots: 15, ratePerHour: 2, status: 'active', createdAt: Date.now() },
  { lotId: 'lot2', name: 'OK Supermarket', city: 'Masvingo', coordinates: { lat: -20.0712, lng: 30.8315 }, totalSlots: 15, availableSlots: 5, ratePerHour: 1.5, status: 'active', createdAt: Date.now() },
  { lotId: 'lot3', name: 'Great Zimbabwe University', city: 'Masvingo', coordinates: { lat: -20.0631, lng: 30.8402 }, totalSlots: 40, availableSlots: 40, ratePerHour: 1, status: 'active', createdAt: Date.now() },
  { lotId: 'lot4', name: 'Masvingo Polytechnic', city: 'Masvingo', coordinates: { lat: -20.0900, lng: 30.8455 }, totalSlots: 30, availableSlots: 0, ratePerHour: 1.2, status: 'active', createdAt: Date.now() },
];

const adminUser: User = { uid: 'admin01', name: 'Admin', email: 'admin@smartpark.io', role: 'admin', theme: 'dark', createdAt: Date.now(), activeVehicleId: null };
const regularUser: User = { uid: 'user01', name: 'John Doe', email: 'john@example.com', role: 'user', theme: 'light', createdAt: Date.now(), activeVehicleId: 'v1' };

const generateInitialSlots = (lots: ParkingLot[]): Slot[] => {
    let allSlots: Slot[] = [];
    lots.forEach(lot => {
        let occupiedCount = lot.totalSlots - lot.availableSlots;
        for (let i = 1; i <= lot.totalSlots; i++) {
            const angle = (i / lot.totalSlots) * 2 * Math.PI;
            const lat = lot.coordinates.lat + 0.0005 * Math.cos(angle);
            const lng = lot.coordinates.lng + 0.0005 * Math.sin(angle) / Math.cos(lot.coordinates.lat * Math.PI / 180);
            
            allSlots.push({
                slotId: `slot-${lot.lotId}-${i}`,
                lotId: lot.lotId,
                bayNumber: `Bay ${i}`,
                coordinates: { lat, lng },
                status: occupiedCount > 0 ? 'occupied' : 'free',
            });
            if(occupiedCount > 0) occupiedCount--;
        }
    });
    return allSlots;
};

export const useMockDatabase = () => {
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>(initialParkingLots);
    const [slots, setSlots] = useState<Slot[]>(() => generateInitialSlots(initialParkingLots));
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [users, setUsers] = useState<User[]>([adminUser, regularUser]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);

    const createUser = (name: string, email: string): User => {
        const newUser: User = {
            uid: uuidv4(),
            name,
            email,
            role: 'user',
            theme: 'light',
            createdAt: Date.now(),
            activeVehicleId: null
        };
        setUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const createReservation = useCallback((res: Omit<Reservation, 'resId' | 'createdAt' | 'paymentId'>) => {
        return new Promise<Reservation>((resolve) => {
            const newReservation: Reservation = { ...res, resId: uuidv4(), createdAt: Date.now(), paymentId: null };
            setReservations(prev => [...prev, newReservation]);

            const newPayment: Payment = {
                payId: uuidv4(),
                resId: newReservation.resId,
                userId: newReservation.userId,
                amount: newReservation.amount,
                currency: 'ZWL',
                status: 'initiated',
                provider: 'ZB_PAY_MOCK',
                providerRef: `zb-${uuidv4().slice(0, 8)}`,
                createdAt: Date.now()
            };
            setPayments(prev => [...prev, newPayment]);

            console.log("Netlify Function 'zbpay-initiate' would be called here.");

            setTimeout(() => {
                console.log("Netlify Function 'zbpay-webhook' would trigger this update.");
                setPayments(prev => prev.map(p => p.payId === newPayment.payId ? { ...p, status: 'success' } : p));
                const finalReservation = { ...newReservation, status: 'active' as const, paymentId: newPayment.payId };
                setReservations(prev => prev.map(r => r.resId === newReservation.resId ? finalReservation : r));
                setSlots(prev => prev.map(slot => slot.slotId === newReservation.slotId ? { ...slot, status: 'occupied' } : slot));
                setParkingLots(prev => prev.map(lot => lot.lotId === newReservation.lotId ? { ...lot, availableSlots: Math.max(0, lot.availableSlots - 1) } : lot));
                resolve(finalReservation);
            }, 2500);
        });
    }, []);

    const getSlotsForLot = useCallback((lotId: string) => {
        return slots.filter(s => s.lotId === lotId);
    }, [slots]);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Netlify Scheduled Function 'autoRelease' is running...");
            const now = Date.now();
            let lotsToUpdate: { [key: string]: number } = {};

            const updatedReservations = reservations.map(res => {
                if (res.status === 'active' && res.endTime <= now) {
                    lotsToUpdate[res.lotId] = (lotsToUpdate[res.lotId] || 0) + 1;
                    setSlots(prev => prev.map(s => s.slotId === res.slotId ? { ...s, status: 'free' } : s));
                    return { ...res, status: 'completed' };
                }
                return res;
            });

            if (Object.keys(lotsToUpdate).length > 0) {
                setReservations(updatedReservations);
                setParkingLots(prevLots =>
                    prevLots.map(lot =>
                        lotsToUpdate[lot.lotId]
                            ? { ...lot, availableSlots: Math.min(lot.totalSlots, lot.availableSlots + lotsToUpdate[lot.lotId]) }
                            : lot
                    )
                );
            }
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [reservations]);
    
    const adminStats = useMemo(() => {
        const totalRevenue = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
        const todaysBookings = reservations.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length;
        const totalSlots = parkingLots.reduce((sum, lot) => sum + lot.totalSlots, 0);
        const availableSlots = parkingLots.reduce((sum, lot) => sum + lot.availableSlots, 0);
        const overallOccupancy = totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0;
        
        const occupancyDistribution = parkingLots.map(lot => ({
            name: lot.name,
            value: lot.totalSlots - lot.availableSlots,
        }));

        return {
            totalRevenue,
            activeUsers: users.filter(u => u.role === 'user').length,
            todaysBookings,
            overallOccupancy: Math.round(overallOccupancy),
            occupancyDistribution
        };
    }, [payments, reservations, users, parkingLots]);

    return {
        parkingLots,
        reservations,
        users,
        vehicles,
        payments,
        slots,
        createUser,
        createReservation,
        getSlotsForLot,
        getReservationsForUser: (userId: string) => reservations.filter(r => r.userId === userId).sort((a, b) => b.createdAt - a.createdAt),
        getVehiclesForUser: (userId: string) => vehicles.filter(v => v.userId === userId),
        adminStats,
    };
};
