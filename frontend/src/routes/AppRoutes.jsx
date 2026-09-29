import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getRoleDefaultPath } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/admin/AdminDashboard';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import AccountantDashboard from '../pages/accountant/AccountantDashboard';
import DriverDashboard from '../pages/driver/DriverDashboard';
import GateDashboard from '../pages/gate/GateDashboard';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Login */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getRoleDefaultPath(user.role)} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Role-Protected Dashboards */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/accountant/*"
        element={
          <ProtectedRoute allowedRoles={['accountant']}>
            <AccountantDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/*"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/gate/*"
        element={
          <ProtectedRoute allowedRoles={['gate']}>
            <GateDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={getRoleDefaultPath(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
