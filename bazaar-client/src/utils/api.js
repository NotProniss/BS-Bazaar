import axios from 'axios';


// Utility to join API URLs safely (prevents double slashes)
export function joinApiUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "/api";

export const api = {
  // Listings
  fetchListings: async () => {
    const res = await axios.get(`${BACKEND_URL}/listings`);
    return res.data;
  },

  createListing: async (listingData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axios.post(`${BACKEND_URL}/listings`, listingData, config);
    return res.data;
  },

  updateListing: async (id, listingData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await axios.put(`${BACKEND_URL}/listings/${id}`, listingData, config);
    return res.data;
  },

  deleteListing: async (id, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    await axios.delete(`${BACKEND_URL}/listings/${id}`, config);
  },

  // Admin
  checkAdminStatus: async (token) => {
    const res = await fetch(`${BACKEND_URL}/is-admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data.isAdmin === true;
  }
};

export { BACKEND_URL };
