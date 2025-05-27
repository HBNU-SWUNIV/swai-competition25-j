import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import AdminApp from './admin/AdminApp';
import UserApp from './user/UserApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/user/*" element={<UserApp />} />
        <Route path="/" element={<div style={{textAlign: 'center', marginTop: '3em', fontSize: '1.5em'}}>ai contest 팀 j의 작품입니다</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
