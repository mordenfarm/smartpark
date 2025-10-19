export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'user' | 'admin';
}

export interface ParkingLot {
  lotId: string;
  name: string;
  coordinates: { lat: number; lng: number };
  totalSlots: number;
  availableSlots: number;
  ratePerHour: number;
}

export interface Slot {
  slotId: string;
  lotId: string;
  bayNumber: string;
  status: 'free' | 'occupied' | 'reserved';
  coordinates: { lat: number; lng: number };
}

export interface Reservation {
  resId: string;
  userId: string;
  vehicleId: string; // Plate number for now
  lotId: string;
  slotId: string;
  startTime: number;
  endTime: number;
  durationHours: number;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface Vehicle {
    vehicleId: string;
    userId: string;
    plateNumber: string;
    make: string;
    color: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}