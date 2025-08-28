import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { joinApiUrl } from '../config';

const LoginPopup = ({ onClose, darkMode, closeSidebar, onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState('discord'); // 'discord' or 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [verificationResent, setVerificationResent] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      const response = await fetch(joinApiUrl(BACKEND_URL, '/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwtToken', data.token);
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
        onClose();
        if (closeSidebar) closeSidebar();
        window.location.reload(); // Refresh to update the login state
      } else {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(data.email);
          setShowEmailVerification(true);
          setError('');
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      const response = await fetch(joinApiUrl(BACKEND_URL, '/auth/resend-verification'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: unverifiedEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setVerificationResent(true);
      } else {
        setError(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      const response = await fetch(joinApiUrl(BACKEND_URL, '/auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSuccess(true);
        setForgotEmail('');
        setError('');
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordSuccess(false);
        }, 5000);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
    window.location.href = joinApiUrl(BACKEND_URL, '/auth/discord');
  };

  // Create a portal to render the popup at the body level
  const popupContent = (
    <div 
      className="fixed bg-black bg-opacity-50"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl shadow-2xl p-8 min-w-[320px] relative"
        style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
          border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`,
          backdropFilter: 'blur(10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 font-bold text-xl transition-all duration-300"
          style={{
            color: darkMode ? '#D4AF37' : '#B8860B'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = darkMode ? '#FFD700' : '#8B4513';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = darkMode ? '#D4AF37' : '#B8860B';
            e.target.style.transform = 'scale(1)';
          }}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 
          className="text-2xl font-bold mb-6 text-center"
          style={{
            color: darkMode ? '#D4AF37' : '#B8860B'
          }}
        >
          {showForgotPassword ? 'Reset Password' : 'Login'}
        </h2>

        {error && (
          <div 
            className="mb-4 p-3 rounded border text-center text-sm"
            style={{
              background: darkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: '#dc2626',
              color: '#dc2626'
            }}
          >
            {error}
          </div>
        )}

        {showEmailVerification && (
          <div className="mb-4 p-4 rounded-lg text-center" style={{
            background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b',
            border: '1px solid',
            color: darkMode ? '#fbbf24' : '#d97706'
          }}>
            {verificationResent ? (
              <>
                <div className="text-2xl mb-2">📧</div>
                <p className="font-medium mb-1">Verification email sent!</p>
                <p className="text-sm opacity-75">Check your email for the verification link.</p>
              </>
            ) : (
              <>
                <div className="text-2xl mb-2">⚠️</div>
                <p className="font-medium mb-2">Email not verified</p>
                <p className="text-sm mb-3">Please verify your email address before logging in.</p>
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="px-4 py-2 rounded text-sm font-medium transition-colors"
                  style={{
                    background: '#D4AF37',
                    color: 'white',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Sending...' : 'Resend verification email'}
                </button>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setShowEmailVerification(false);
                      setUnverifiedEmail('');
                      setVerificationResent(false);
                    }}
                    className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Back to login
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {showForgotPassword ? (
          <>
            {forgotPasswordSuccess ? (
              <div className="p-4 rounded-lg text-center" style={{
                background: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                borderColor: '#22c55e',
                color: '#22c55e',
                border: '1px solid'
              }}>
                <div className="text-2xl mb-2">✅</div>
                <p className="font-medium mb-1">Password reset email sent!</p>
                <p className="text-sm opacity-75">Check your email for reset instructions.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              required
              className="border rounded px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                color: darkMode ? '#F5E6A3' : '#6B4E3D',
                borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                  : 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)',
                color: darkMode ? '#1a1a2e' : '#ffffff',
                border: 'none',
                boxShadow: darkMode 
                  ? '0 4px 15px rgba(212, 175, 55, 0.3)'
                  : '0 4px 15px rgba(184, 134, 11, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.boxShadow = darkMode 
                    ? '0 6px 20px rgba(212, 175, 55, 0.4)'
                    : '0 6px 20px rgba(184, 134, 11, 0.4)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = darkMode 
                  ? '0 4px 15px rgba(212, 175, 55, 0.3)'
                  : '0 4px 15px rgba(184, 134, 11, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setForgotEmail('');
              }}
              className="text-sm transition-all duration-300"
              style={{ 
                color: darkMode ? '#D4AF37' : '#B8860B',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = darkMode ? '#FFD700' : '#8B4513';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = darkMode ? '#D4AF37' : '#B8860B';
              }}
            >
              ← Back to Login
            </button>
            </form>
            )}
          </>
        ) : (
          <>
            {/* Login Method Tabs */}
            <div className="flex mb-6 rounded-lg overflow-hidden border" style={{
              borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
            }}>
              <button
                type="button"
                onClick={() => setLoginMethod('discord')}
                className="flex-1 py-2 px-4 text-sm font-medium transition-all duration-300"
                style={{
                  background: loginMethod === 'discord' 
                    ? (darkMode ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)')
                    : 'transparent',
                  color: loginMethod === 'discord' 
                    ? (darkMode ? '#1a1a2e' : '#ffffff')
                    : (darkMode ? '#F5E6A3' : '#6B4E3D'),
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🎮 Discord
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className="flex-1 py-2 px-4 text-sm font-medium transition-all duration-300"
                style={{
                  background: loginMethod === 'email' 
                    ? (darkMode ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)')
                    : 'transparent',
                  color: loginMethod === 'email' 
                    ? (darkMode ? '#1a1a2e' : '#ffffff')
                    : (darkMode ? '#F5E6A3' : '#6B4E3D'),
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📧 Email
              </button>
            </div>

            {loginMethod === 'discord' ? (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleDiscordLogin}
                  className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300"
                  style={{ 
                    background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(88, 101, 242, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 6px 20px rgba(88, 101, 242, 0.4)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = '0 4px 15px rgba(88, 101, 242, 0.3)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  🎮 Continue with Discord
                </button>
                <p className="text-xs text-center" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                  Quick and secure login with your Discord account
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="border rounded px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                    color: darkMode ? '#F5E6A3' : '#6B4E3D',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                    e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="border rounded px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                    color: darkMode ? '#F5E6A3' : '#6B4E3D',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                    e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                      : 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)',
                    color: darkMode ? '#1a1a2e' : '#ffffff',
                    border: 'none',
                    boxShadow: darkMode 
                      ? '0 4px 15px rgba(212, 175, 55, 0.3)'
                      : '0 4px 15px rgba(184, 134, 11, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.boxShadow = darkMode 
                        ? '0 6px 20px rgba(212, 175, 55, 0.4)'
                        : '0 6px 20px rgba(184, 134, 11, 0.4)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = darkMode 
                      ? '0 4px 15px rgba(212, 175, 55, 0.3)'
                      : '0 4px 15px rgba(184, 134, 11, 0.3)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm transition-all duration-300"
                  style={{ 
                    color: darkMode ? '#D4AF37' : '#B8860B',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = darkMode ? '#FFD700' : '#8B4513';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = darkMode ? '#D4AF37' : '#B8860B';
                  }}
                >
                  Forgot your password?
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="text-sm transition-all duration-300"
                style={{ 
                  display: 'inline-block',
                  color: darkMode ? '#D4AF37' : '#B8860B',
                  textDecoration: 'underline'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = darkMode ? '#FFD700' : '#8B4513';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = darkMode ? '#D4AF37' : '#B8860B';
                }}
                onClick={() => {
                  onClose();
                  if (closeSidebar) closeSidebar();
                }}
              >
                Don't have an account? Sign up here
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Use a portal to render at the body level
  return ReactDOM.createPortal(popupContent, document.body);
};

export default LoginPopup;
