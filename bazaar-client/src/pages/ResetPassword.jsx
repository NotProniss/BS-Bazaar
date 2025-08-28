import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { joinApiUrl } from '../config';

const ResetPassword = ({ darkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      const response = await fetch(joinApiUrl(BACKEND_URL, '/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: darkMode
        ? 'linear-gradient(135deg, #16213E 0%, #0F3460 50%, #1A1A2E 100%)'
        : 'linear-gradient(135deg, #E8F4FD 0%, #B8E6FF 50%, #E8F4FD 100%)',
    }}>
      <div className="max-w-md w-full mx-4">
        <div className="p-8 rounded-lg shadow-xl" style={{
          background: darkMode
            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(15, 52, 96, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
          border: `2px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`,
        }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{
              color: darkMode ? '#D4AF37' : '#B8860B'
            }}>
              Reset Password
            </h1>
            <p className="text-sm" style={{
              color: darkMode ? '#F5E6A3' : '#6B4E3D'
            }}>
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-3 rounded" style={{
                background: darkMode ? 'rgba(40, 167, 69, 0.2)' : 'rgba(40, 167, 69, 0.1)',
                color: darkMode ? '#4CAF50' : '#28A745',
                border: `1px solid ${darkMode ? 'rgba(40, 167, 69, 0.3)' : 'rgba(40, 167, 69, 0.2)'}`
              }}>
                Password reset successfully! You can now log in with your new password.
              </div>
              <p className="text-sm" style={{
                color: darkMode ? '#F5E6A3' : '#6B4E3D'
              }}>
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded text-sm" style={{
                  background: darkMode ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)',
                  color: darkMode ? '#FF6B6B' : '#DC3545',
                  border: `1px solid ${darkMode ? 'rgba(220, 53, 69, 0.3)' : 'rgba(220, 53, 69, 0.2)'}`
                }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: darkMode ? '#F5E6A3' : '#6B4E3D'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                    color: darkMode ? '#F5E6A3' : '#333',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                    focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
                  }}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: darkMode ? '#F5E6A3' : '#6B4E3D'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                    color: darkMode ? '#F5E6A3' : '#333',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                    focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
                  }}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full py-2 px-4 rounded font-medium transition-all duration-300"
                style={{
                  background: isLoading || !token
                    ? (darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)')
                    : (darkMode 
                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(184, 134, 11, 0.8) 100%)'
                      : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'),
                  color: darkMode ? '#1A1A2E' : 'white',
                  cursor: isLoading || !token ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !token ? 0.6 : 1
                }}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm underline"
              style={{
                color: darkMode ? '#D4AF37' : '#B8860B'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
