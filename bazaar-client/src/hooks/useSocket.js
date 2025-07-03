import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../utils/api';

export function useSocket(setListings) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    // Listen for real-time events
    socketRef.current.on('listingCreated', (newListing) => {
      setListings(prev => [newListing, ...prev.filter(l => l.id !== newListing.id)]);
    });
    
    socketRef.current.on('listingUpdated', (updatedListing) => {
      setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
    });
    
    socketRef.current.on('listingDeleted', (deletedId) => {
      setListings(prev => prev.filter(l => l.id !== deletedId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setListings]);

  return socketRef;
}
