import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import LoginContext from '../context/LoginContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isLoggedIn } = useContext(LoginContext);
  
  // Check if user is logged in by checking localStorage token
  const token = localStorage.getItem('authToken');
  const isAuthenticated = isLoggedIn || token;

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has required role
  if (roles.length > 0) {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || !roles.includes(userRole)) {
      // Redirect to home if user doesn't have required role
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 