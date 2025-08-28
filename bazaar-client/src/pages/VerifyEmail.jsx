import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail = ({ darkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlError = searchParams.get('error');

    if (urlStatus === 'success') {
      setStatus('success');
      setMessage('Email verified successfully! You can now log in with your email and password.');
    } else if (urlStatus === 'already-verified') {
      setStatus('info');
      setMessage('This email address has already been verified.');
    } else if (urlError === 'missing-token') {
      setStatus('error');
      setMessage('Verification link is missing required information.');
    } else if (urlError === 'invalid-token') {
      setStatus('error');
      setMessage('Invalid or expired verification link. Please request a new verification email.');
    } else if (urlError === 'server-error') {
      setStatus('error');
      setMessage('Server error occurred during verification. Please try again later.');
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' };
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
              Email Verification
            </h1>
            <p className="text-sm" style={{
              color: darkMode ? '#F5E6A3' : '#6B4E3D'
            }}>
              BS-Bazaar Marketplace
            </p>
          </div>

          <div className="text-center">
            <div className="mb-6 p-4 rounded-lg" style={{
              background: getStatusColor().bg,
              border: `1px solid ${getStatusColor().border}`,
              color: getStatusColor().color
            }}>
              <div className="text-4xl mb-3">{getStatusIcon()}</div>
              <p className="font-medium">{message}</p>
            </div>

            <div className="space-y-3">
              {status === 'success' && (
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2 px-4 rounded font-medium transition-all duration-300"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(184, 134, 11, 0.8) 100%)'
                      : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                    color: darkMode ? '#1A1A2E' : 'white',
                  }}
                >
                  Continue to Login
                </button>
              )}

              {(status === 'error' || status === 'info') && (
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2 px-4 rounded font-medium transition-all duration-300"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(184, 134, 11, 0.8) 100%)'
                      : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                    color: darkMode ? '#1A1A2E' : 'white',
                  }}
                >
                  Back to Home
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{
              color: darkMode ? '#F5E6A3' : '#6B4E3D',
              opacity: 0.7
            }}>
              Need help? Contact support through our Discord community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
