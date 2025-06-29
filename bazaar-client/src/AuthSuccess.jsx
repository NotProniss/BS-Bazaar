import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('jwtToken', token);
      // Optionally show a message for a moment before redirecting
      setTimeout(() => navigate('/'), 500);
    } else {
      console.warn('Token missing in URL');
      setTimeout(() => navigate('/'), 1000);
    }
  }, [location, navigate]);

  return <p className="text-center mt-10 text-lg text-gray-700">Logging in...</p>;
};

export default AuthSuccess;
