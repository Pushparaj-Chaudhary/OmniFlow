import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week) automatic logout threshold

const isSessionExpired = (userData) => {
  if (!userData) return true;

  // 1. Check login timestamp (max 1 week session)
  if (userData.loginTimestamp && Date.now() - userData.loginTimestamp > ONE_WEEK_MS) {
    return true;
  }

  // 2. Decode JWT payload expiration if token exists
  if (userData.token) {
    try {
      const payloadBase64 = userData.token.split('.')[1];
      if (payloadBase64) {
        const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const decoded = JSON.parse(decodedJson);
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return true;
        }
      }
    } catch (err) {
      console.error('Error decoding token expiry:', err);
    }
  }

  return false;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Check local storage for user/token and enforce 1-week auto-logout
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (isSessionExpired(parsedUser)) {
          logout();
        } else {
          setUser(parsedUser);
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userWithTimestamp = {
      ...userData,
      loginTimestamp: userData.loginTimestamp || Date.now(),
    };
    setUser(userWithTimestamp);
    localStorage.setItem('user', JSON.stringify(userWithTimestamp));
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

