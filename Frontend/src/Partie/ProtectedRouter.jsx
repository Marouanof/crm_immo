import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const roleRedux = useSelector((state) => state.auth.role);
  const roleStorage = localStorage.getItem('role');
  const role = roleRedux || roleStorage;

  if (!role) {
    // Pas de rôle => pas connecté
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Connecté mais rôle non autorisé
    return <Navigate to="/invalide_page" replace />;
  }

  // Connecté + rôle autorisé
  return children;
};

export default ProtectedRoute;
