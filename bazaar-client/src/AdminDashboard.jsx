import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://bs-bazaar.com';

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

  useEffect(() => {
    fetchListings();
    fetchAdmins();
  }, []);

  const fetchListings = () => {
    axios.get(`${BACKEND_URL}/listings`)
      .then(res => setListings(res.data))
      .catch(err => {
        console.error(err);
        setHasError(true);
      });
  };

  const fetchAdmins = () => {
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
  };

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
    <div style={{ borderTop: '2px solid #ccc', marginTop: '2rem', paddingTop: '1rem' }}>
      <h2>Admin Dashboard</h2>

      {hasError && <p style={{ color: 'red' }}>Error loading admin data.</p>}

      <section>
        <h3>All Listings</h3>
        <ul>
          {listings.map(listing => (
            <li key={listing.id}>
              {listing.item} — {listing.quantity} @ {listing.price} ({listing.type}) by {listing.seller}
              <button onClick={() => deleteListing(listing.id)} style={{ marginLeft: '1rem' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Manage Admins</h3>
        <ul>
          {admins.map(admin => (
            <li key={admin.id}>
              {admin.id}
              <button onClick={() => removeAdmin(admin.id)} style={{ marginLeft: '1rem' }}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder="New admin Discord ID"
          value={newAdminId}
          onChange={(e) => setNewAdminId(e.target.value)}
        />
        <button onClick={addAdmin}>Add Admin</button>
      </section>
    </div>
  );
}

export default AdminDashboard;
