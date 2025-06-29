import { Routes, Route } from 'react-router-dom';
import App from './App';
import AuthSuccess from './AuthSuccess'; // 👈 import this

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth-success" element={<AuthSuccess />} /> {/* 👈 Add this */}
    </Routes>
  );
};

export default AppRouter;