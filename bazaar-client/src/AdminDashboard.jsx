import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getValidToken } from './utils/helpers';
import UserLink from './components/UserLink';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';

function AdminDashboard({ onRefreshListings, darkMode }) {
  const [listings, setListings] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newAdminId, setNewAdminId] = useState('');
  const [isAdmin, setIsAdmin] = useState(true); // assume admin unless 403 returned
  const [hasError, setHasError] = useState(false);

  const authConfig = () => {
    const token = getValidToken();
    if (!token) {
      setHasError(true);
      return null;
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchListings = () => {
    axios.get(`${BACKEND_URL}/listings`)
      .then(res => setListings(res.data))
      .catch(err => {
        console.error(err);
        setHasError(true);
      });
  };

  const fetchAdmins = useCallback(() => {
    const config = authConfig();
    if (!config) {
      setHasError(true);
      return;
    }

    axios.get(`${BACKEND_URL}/admin/users`, config)
      .then(res => {
        setAdmins(res.data.admins);
        setIsAdmin(true);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('token');
          setHasError(true);
        } else if (err.response?.status === 403) {
          console.log('User is not an admin');
          setIsAdmin(false); // hide dashboard
        } else {
          console.error('Admin fetch failed:', err);
          setHasError(true);
        }
      });
  }, []);

  useEffect(() => {
    fetchListings();
    fetchAdmins();
  }, [fetchAdmins]);

  const deleteListing = (id) => {
    axios.delete(`${BACKEND_URL}/admin/listings/${id}`, authConfig())
      .then(() => {
        fetchListings();
        onRefreshListings?.();
      })
      .catch(err => console.error(err));
  };

  const addAdmin = () => {
    if (!newAdminId) return;
    axios.post(`${BACKEND_URL}/admin/users/add`, { id: newAdminId }, authConfig())
      .then(() => {
        setNewAdminId('');
        fetchAdmins();
      })
      .catch(err => console.error(err));
  };

  const removeAdmin = (id) => {
    axios.post(`${BACKEND_URL}/admin/users/remove`, { id }, authConfig())
      .then(() => fetchAdmins())
      .catch(err => console.error(err));
  };

  // 🧼 Don't show anything if not an admin
  if (!isAdmin) return null;

  return (
    <div
      className="rounded-lg p-6 mt-8"
      style={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(42, 42, 62, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
        border: `2px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`,
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode 
          ? '0 8px 32px rgba(212, 175, 55, 0.15)'
          : '0 8px 32px rgba(184, 134, 11, 0.15)',
        color: darkMode ? '#F5E6A3' : '#6B4E3D'
      }}
    >
      <h2 
        className="text-3xl font-bold mb-6"
        style={{
          color: darkMode ? '#D4AF37' : '#B8860B',
          textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)',
          fontFamily: 'serif'
        }}
      >
        Admin Dashboard
      </h2>

      {hasError && (
        <p 
          className="mb-4 p-3 rounded"
          style={{ 
            color: '#DC2626',
            background: darkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)',
            border: '1px solid rgba(220, 38, 38, 0.3)'
          }}
        >
          Error loading admin data.
        </p>
      )}

      <section className="mb-8">
        <h3 
          className="text-xl font-semibold mb-4"
          style={{
            color: darkMode ? '#D4AF37' : '#B8860B'
          }}
        >
          Manage Admins
        </h3>
        <ul className="space-y-2 mb-4">
          {admins.map(admin => (
            <li 
              key={admin.id} 
              className="flex flex-row items-center gap-3 p-3 rounded"
              style={{
                background: darkMode 
                  ? 'rgba(26, 26, 46, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`
              }}
            >
              <button
                onClick={() => removeAdmin(admin.id)}
                className="w-8 h-8 flex items-center justify-center rounded transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2"
                style={{
                  color: '#DC2626',
                  background: darkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  focusRingColor: '#DC2626'
                }}
                aria-label="Remove admin"
              >
                ✕
              </button>
              <span>{admin.id}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New admin Discord ID"
            value={newAdminId}
            onChange={(e) => setNewAdminId(e.target.value)}
            className="border rounded px-3 py-2 flex-1 transition-all duration-300 focus:outline-none focus:ring-2"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
              color: darkMode ? '#F5E6A3' : '#6B4E3D',
              borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
              focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
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
            className="rounded px-4 py-2 font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                : 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)',
              color: darkMode ? '#1a1a2e' : '#ffffff',
              border: 'none',
              boxShadow: darkMode 
                ? '0 4px 15px rgba(212, 175, 55, 0.3)'
                : '0 4px 15px rgba(184, 134, 11, 0.3)',
              focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
            }}
            onClick={addAdmin}
          >
            Add Admin
          </button>
        </div>
      </section>

      <section>
        <h3 
          className="text-xl font-semibold mb-4"
          style={{
            color: darkMode ? '#D4AF37' : '#B8860B'
          }}
        >
          All Listings
        </h3>
        <ul className="space-y-2">
          {listings
            .sort((a, b) => a.item.localeCompare(b.item))
            .map(listing => (
            <li 
              key={listing.id} 
              className="flex flex-row items-center gap-3 p-3 rounded"
              style={{
                background: darkMode 
                  ? 'rgba(26, 26, 46, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`
              }}
            >
              <button
                onClick={() => deleteListing(listing.id)}
                className="w-8 h-8 flex items-center justify-center rounded transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2"
                style={{
                  color: '#DC2626',
                  background: darkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  focusRingColor: '#DC2626'
                }}
                aria-label="Delete listing"
              >
                ✕
              </button>
              <span>
                {listing.item} — {listing.quantity} @ {listing.price} ({listing.type}) by{' '}
                <UserLink 
                  username={listing.seller}
                  userId={listing.userId}
                  darkMode={darkMode}
                />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
