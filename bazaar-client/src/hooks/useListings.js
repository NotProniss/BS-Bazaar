import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export function useListings() {
  const [listings, setListings] = useState([]);

  const fetchListings = useCallback(async () => {
    try {
      const data = await api.fetchListings();
      setListings(data);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  }, []);

  const createListing = async (listingData) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      throw new Error("You must be logged in!");
    }
    return await api.createListing(listingData, token);
  };

  const updateListing = async (id, listingData) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      throw new Error("You must be logged in!");
    }
    return await api.updateListing(id, listingData, token);
  };

  const deleteListing = async (id) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      throw new Error("You must be logged in!");
    }
    await api.deleteListing(id, token);
    await fetchListings(); // Refresh listings
  };

  return {
    listings,
    setListings,
    fetchListings,
    createListing,
    updateListing,
    deleteListing
  };
}
