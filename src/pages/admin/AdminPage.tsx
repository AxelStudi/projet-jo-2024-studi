
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  // Redirect to the dashboard
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminPage;
