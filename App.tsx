import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import Dock from './components/Dock';
import { Header } from './components/AppComponents';
import './components/Dock.css';


const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a more sophisticated loading spinner
    }

    return (
        <div className="app-container">
            <Header />
            <main className="app-content">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
                </Routes>
            </main>
            {user && <Dock />}
        </div>
    )
};

// --- MAIN APP ---
const App: React.FC = () => (
    <HashRouter>
        <AppRoutes />
    </HashRouter>
);

export default App;