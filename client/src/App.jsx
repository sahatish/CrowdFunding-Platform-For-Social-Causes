import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DonorDashboard from './pages/DonorDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Role-Based Dashboards */}
              <Route
                path="/donor"
                element={
                  <ProtectedRoute allowedRoles={['donor', 'admin']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <div>
                <p className="font-extrabold text-white text-lg tracking-tight bg-gradient-to-r from-brand-400 to-emerald-300 bg-clip-text text-transparent">
                  HopeFund Platform
                </p>
                <p className="text-xs text-slate-500 mt-1">Empowering communities to raise funds securely & transparently.</p>
              </div>
              <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} HopeFund Social Crowdfunding. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
