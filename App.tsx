import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMockDatabase } from './hooks/useMockDatabase';
import type { User, ParkingLot, Reservation, Slot } from './types';
import { Header, MapComponent, ParkingLotDetail, ReservationModal, AdminDashboard } from './components/AppComponents';
import { Input, Button, Card } from './components/ui';
import { LatLngExpression } from 'leaflet';

// --- CONTEXTS ---
// ThemeProvider removed as requested for a single dark theme. Styles are now handled globally.

type AppContextType = {
    user: User | null;
    login: (email: string, pass: string) => User | null;
    signup: (name: string, email: string) => User | null;
    logout: () => void;
    db: ReturnType<typeof useMockDatabase>;
};
const AppContext = createContext<AppContextType | undefined>(undefined);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within an AppProvider");
    return context;
};
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const db = useMockDatabase();
    const [user, setUser] = useState<User | null>(null);

    const login = (email: string, pass: string): User | null => {
        const foundUser = db.users.find(u => u.email === email);
        if (foundUser) { setUser(foundUser); return foundUser; }
        return null;
    };
    
    const signup = (name: string, email: string): User | null => {
        if(db.users.find(u => u.email === email)) {
            alert("An account with this email already exists.");
            return null;
        }
        const newUser = db.createUser(name, email);
        setUser(newUser);
        return newUser;
    }

    const logout = () => setUser(null);
    
    const value = { user, login, signup, logout, db };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// --- PAGES ---

const HomePage: React.FC = () => {
    const { db } = useAppContext();
    
    const [mapView, setMapView] = useState<'lots' | 'slots'>('lots');
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([-20.0744, 30.8329]);
    const [mapZoom, setMapZoom] = useState(14);
    
    const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
    const [focusedLot, setFocusedLot] = useState<ParkingLot | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [isReserveModalOpen, setReserveModalOpen] = useState(false);

    const slotsForFocusedLot = useMemo(() => {
        return focusedLot ? db.getSlotsForLot(focusedLot.lotId) : [];
    }, [focusedLot, db]);

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
                parkingLots={db.parkingLots}
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

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login, signup, user } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
      if(user) navigate(from, { replace: true });
    }, [user, navigate, from]);

    const handleAuthAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            const loggedInUser = login(email, password);
            if (!loggedInUser) alert("Login failed. Check credentials.");
        } else {
            signup(name, email);
        }
    };
    
    return (
        <div className="auth-page">
            <Card className="w-full max-w-md auth-card">
                <div className="auth-tabs">
                    <button onClick={() => setIsLogin(true)} className={`auth-tab ${isLogin ? 'active' : ''}`}>Login</button>
                    <button onClick={() => setIsLogin(false)} className={`auth-tab ${!isLogin ? 'active' : ''}`}>Sign Up</button>
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <form onSubmit={handleAuthAction} className="space-y-6">
                    {!isLogin && <Input id="name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required />}
                    <Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Button type="submit" className="w-full">{isLogin ? 'Login' : 'Sign Up'}</Button>
                    <Button type="button" variant="secondary" className="w-full" onClick={() => login('john@example.com', 'pw')}>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                      Sign In with Google (Mock)
                    </Button>
                </form>
            </Card>
        </div>
    );
};

const ProfilePage: React.FC = () => { return <div className="p-4">Profile Page</div>; };

// --- ROUTING ---
interface ProtectedRouteProps { children: React.ReactNode; allowedRoles?: ('user' | 'admin')[]; }
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user } = useAppContext();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

import Dock from './components/Dock';
import './components/Dock.css';

const AppRoutes = () => (
    <div className="app-container">
        <Header />
        <main className="app-content">
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </main>
        <Dock />
    </div>
);

// --- MAIN APP ---
const App: React.FC = () => (
    <AppProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
    </AppProvider>
);

export default App;