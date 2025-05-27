import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHome from './pages/home/components/AdminHome';

const AdminApp: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<AdminHome />} />
    </Routes>
  );
};

export default AdminApp;
