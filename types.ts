export interface Slot {
  slotId: string;
  lotId: string;
  bayNumber: string;
  coordinates: { lat: number; lng: number };
  status: 'free' | 'occupied';
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: 'user' | 'admin';
  photoURL?: string | null;
  createdAt?: number; // timestamp
  activeVehicleId?: string | null;
  theme?: 'light' | 'dark';
}

export interface Vehicle {
  vehicleId: string;
  userId: string;
  plateNumber: string;
  make: string;
  color: string;
  token: string;
  active: boolean;
  createdAt: number; // timestamp
}

export interface ParkingLot {
  lotId: string;
  name:string;
  city: string;
  coordinates: { lat: number; lng: number };
  totalSlots: number;
  availableSlots: number;
  ratePerHour: number;
  status: 'active' | 'inactive';
  createdAt: number; // timestamp
}

export interface Reservation {
  resId: string;
  userId: string;
  vehicleId: string; // This will now be the plate number from the modal
  lotId: string;
  slotId: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  durationHours: number;
  amount: number;
  currency: 'ZWL' | 'USD';
  status: 'pending' | 'active' | 'completed' | 'expired' | 'violated' | 'cancelled';
  paymentId: string | null;
  createdAt: number; // timestamp
}

export interface Payment {
  payId: string;
  resId: string;
  userId: string;
  amount: number;
  currency: 'ZWL';
  status: 'initiated' | 'success' | 'failed' | 'pending';
  provider: 'ZB_PAY_MOCK';
  providerRef: string;
  createdAt: number; // timestamp
}