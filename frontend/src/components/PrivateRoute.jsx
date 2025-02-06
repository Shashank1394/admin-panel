import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return token ? <Outlet /> : <Navigate to="/login" />;
}
