import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';

function AdminDashboard({ onRefreshListings }) {
  const [listings, setListings] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newAdminId, setNewAdminId] = useState('');
  const [isAdmin, setIsAdmin] = useState(true); // assume admin unless 403 returned
  const [hasError, setHasError] = useState(false);

  const authConfig = () => {
    const token = localStorage.getItem('jwtToken');
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
    axios.get(`${BACKEND_URL}/admin/users`, authConfig())
      .then(res => {
        setAdmins(res.data.admins);
        setIsAdmin(true);
      })
      .catch(err => {
        if (err.response?.status === 403) {
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
      style={{ borderTop: '2px solid #ccc', marginTop: '2rem', paddingTop: '1rem' }}
      className="bg-transparent text-black dark:text-white"
    >
      <h2 className="dark:text-white">Admin Dashboard</h2>

      {hasError && <p className="dark:text-white" style={{ color: 'red' }}>Error loading admin data.</p>}

      <section>
        <h3 className="dark:text-white">Manage Admins</h3>
        <ul>
          {admins.map(admin => (
            <li key={admin.id} className="dark:text-white flex flex-row items-center gap-2">
              <button
                onClick={() => removeAdmin(admin.id)}
                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors cursor-pointer border border-red-600 hover:border-red-800 dark:border-red-400 dark:hover:border-red-200 rounded w-8 h-8 flex items-center justify-center"
                aria-label="Remove admin"
              >
                ✕
              </button>
              <span>{admin.id}</span>
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder="New admin Discord ID"
          value={newAdminId}
          onChange={(e) => setNewAdminId(e.target.value)}
          className="dark:text-white dark:bg-gray-800 border rounded px-2 py-1 mb-2"
        />
        <button className="dark:text-white dark:bg-gray-700 border rounded px-3 py-1" onClick={addAdmin}>Add Admin</button>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3 className="dark:text-white">All Listings</h3>
        <ul>
          {listings
            .sort((a, b) => a.item.localeCompare(b.item))
            .map(listing => (
            <li key={listing.id} className="dark:text-white flex flex-row items-center gap-2">
              <button
                onClick={() => deleteListing(listing.id)}
                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors cursor-pointer border border-red-600 hover:border-red-800 dark:border-red-400 dark:hover:border-red-200 rounded w-8 h-8 flex items-center justify-center"
                aria-label="Delete listing"
              >
                ✕
              </button>
              <span>{listing.item} — {listing.quantity} @ {listing.price} ({listing.type}) by {listing.seller}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
