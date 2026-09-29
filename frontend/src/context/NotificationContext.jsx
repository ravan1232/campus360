import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('campus360_token');
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        markAsRead,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      toasts: [],
      addToast: (message, type = 'info', title = '') => {
        console.log(`[Toast ${type}]: ${title ? title + ' - ' : ''}${message}`);
      },
      removeToast: () => {},
      fetchNotifications: () => {},
      markAsRead: () => {}
    };
  }
  return context;
};
