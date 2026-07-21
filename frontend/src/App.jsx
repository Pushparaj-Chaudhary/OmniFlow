import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
import FlatManager from './pages/FlatManager';
import TaskMentor from './pages/TaskMentor';
import Reports from './pages/Reports';
import { AuthProvider, useAuth } from './context/AuthContext';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const theme = user?.settings?.appearance?.theme;

    if (theme) {
      localStorage.setItem('theme', theme); // ✅ persist theme

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user]);

  if (loading) return null;
  return user ? children : <Navigate to="/landing" />;
};

/* Shows LandingPage for guests, Dashboard for logged-in users */
const SmartHome = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Dashboard defaultTypeFilter="" /> : <LandingPage />;
};

import MainLayout from './components/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/" element={<SmartHome />} />
            <Route path="/notes" element={<ProtectedRoute><Dashboard defaultTypeFilter="Note" /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Dashboard defaultTypeFilter="Task" /></ProtectedRoute>} />
            <Route path="/routines" element={<ProtectedRoute><Dashboard defaultTypeFilter="Routine" /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/flatmanager/*" element={<ProtectedRoute><FlatManager /></ProtectedRoute>} />
            <Route path="/mentor/*" element={<ProtectedRoute><TaskMentor /></ProtectedRoute>} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
