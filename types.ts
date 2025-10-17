export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ParkingLot {
  lotId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalSlots: number;
  freeSlots: number;
}

export interface Slot {
  slotId: string;
  lotId: string;
  slotNumber: string;
  status: 'free' | 'occupied' | 'reserved';
  vehicleId?: string;
  reservationTime?: Date;
}

export interface Reservation {
  reservationId: string;
  userId: string;
  slotId: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'expired' | 'cancelled';
}