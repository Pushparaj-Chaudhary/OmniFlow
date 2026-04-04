import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import FlatManager from './pages/FlatManager';
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
  return user ? children : <Navigate to="/login" />;
};

import MainLayout from './components/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Dashboard defaultTypeFilter="" /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Dashboard defaultTypeFilter="Note" /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Dashboard defaultTypeFilter="Task" /></ProtectedRoute>} />
            <Route path="/routines" element={<ProtectedRoute><Dashboard defaultTypeFilter="Routine" /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/flatmanager/*" element={<ProtectedRoute><FlatManager /></ProtectedRoute>} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
