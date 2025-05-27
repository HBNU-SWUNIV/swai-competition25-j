import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserHome from './pages/UserHome';
import OrderPage from './pages/OrderPage';

const UserApp: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<UserHome />} />
      <Route path="order" element={<OrderPage />} />
      {/* 추가 사용자 라우트는 여기에 작성 */}
    </Routes>
  );
};

export default UserApp;
