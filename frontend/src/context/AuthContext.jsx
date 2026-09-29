import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const getRoleDefaultPath = (role) => {
  const r = (role || '').toLowerCase();
  switch (r) {
    case 'admin': return '/admin';
    case 'teacher': return '/teacher';
    case 'student': return '/student';
    case 'accountant': return '/accountant';
    case 'driver': return '/driver';
    case 'gate':
    case 'gate_guard': return '/gate';
    default: return '/admin';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('campus360_token');
    const savedUser = localStorage.getItem('campus360_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('campus360_token');
        localStorage.removeItem('campus360_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('campus360_token', res.token);
        localStorage.setItem('campus360_user', JSON.stringify(res.user));
        const appRole = res.user.role === 'gate' ? 'GATE_GUARD' : (res.user.role ? res.user.role.toUpperCase() : 'ADMIN');
        localStorage.setItem('campus360_role', appRole);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err) {
      return { success: false, message: 'Server unreachable or error during login.' };
    }
  };

  const quickLogin = async (role) => {
    try {
      const res = await api.post('/auth/quick-login', { role });
      if (res.success && res.token) {
        localStorage.setItem('campus360_token', res.token);
        localStorage.setItem('campus360_user', JSON.stringify(res.user));
        const appRole = res.user.role === 'gate' ? 'GATE_GUARD' : (res.user.role ? res.user.role.toUpperCase() : 'ADMIN');
        localStorage.setItem('campus360_role', appRole);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Quick login failed.' };
    } catch (err) {
      return { success: false, message: 'Error triggering quick login.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('campus360_token');
    localStorage.removeItem('campus360_user');
    localStorage.removeItem('campus360_role');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        quickLogin,
        logout,
        getRoleDefaultPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
