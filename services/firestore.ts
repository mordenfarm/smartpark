import { db } from './firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Reservation, Slot } from '../types';

export const createReservation = async (reservation: Omit<Reservation, 'reservationId' | 'status'>) => {
    try {
        const reservationWithStatus: Reservation = {
            ...reservation,
            reservationId: '', // Firestore will generate an ID
            status: 'active',
        };
        const docRef = await addDoc(collection(db, "reservations"), reservationWithStatus);

        // Update the reservation with the generated ID
        await updateDoc(doc(db, "reservations", docRef.id), {
            reservationId: docRef.id
        });

        // Update the slot status to 'occupied'
        await updateDoc(doc(db, "slots", reservation.slotId), {
            status: 'occupied'
        });

        return { success: true, reservationId: docRef.id };
    } catch (error) {
        console.error("Error creating reservation: ", error);
        return { success: false, error };
    }
};