import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import GovernmentHeader from './components/GovernmentHeader';
import Login from './pages/Login';
import Register from './pages/Register';
import UnifiedDashboard from './pages/UnifiedDashboard';
import GravityHero from './components/landing/GravityHero';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const persistUser = (u, token) => {
    if (token) localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogin = async (payload) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      persistUser(data.user, data.token);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (payload) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      // New OTP Flow: Check if verification is needed
      if (data.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          userId: data.userId,
          message: data.message
        };
      }

      // Old Flow / Immediate Success fallback
      persistUser(data.user, data.token);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const location = useLocation();
  const hideNavbarRoutes = ['/land-intelligence', '/']; // Hide on Landing and Map
  // Actually Landing has its own Header? GravityHero usually takes full screen.
  // The user might want Navbar on Landing?
  // Let's hide ONLY on /land-intelligence for now as requested.

  return (
    <div className="font-sans antialiased text-gray-800 bg-geoPaper min-h-screen flex flex-col">
      <GovernmentHeader />
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Navbar
          onLoginClick={() => navigate('/login')}
          onLogout={handleLogout}
          isLoggedIn={!!user}
          user={user}
        />
      )}

      <Routes>
        {/* Replace old Landing with GravityHero */}
        <Route path="/" element={<GravityHero onEnterDashboard={() => navigate('/land-intelligence')} />} />

        <Route path="/login" element={<Login onLogin={handleLogin} onLoginSuccess={(u) => setUser(u)} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />

        {/* New Map Intelligence Dashboard (Public for Demo, or secure if needed) */}
        <Route path="/land-intelligence" element={<UnifiedDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
