import React, { useState } from 'react';
import { fetchOrderStart } from '../utils/orderApi';
import { useNavigate } from 'react-router-dom';

const UserHome: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOrderStart = async () => {
    setLoading(true);
    const result = await fetchOrderStart();
    setLoading(false);
    if (result) {
      navigate('/user/order', { state: result });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 32 }}>팀 J 키오스크 서비스</h1>
      <button onClick={handleOrderStart} disabled={loading} style={{ fontSize: '1.3rem', padding: '16px 48px', borderRadius: 12, background: '#4f8cff', color: '#fff', border: 'none', fontWeight: 600, boxShadow: '0 2px 12px rgba(79,140,255,0.08)', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? '요청 중...' : '주문 시작'}
      </button>
    </div>
  );
};

export default UserHome;
