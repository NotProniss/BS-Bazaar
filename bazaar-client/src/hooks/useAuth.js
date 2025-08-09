import { useState, useEffect } from 'react';

export function useAuth() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setLoggedInUser(payload.username);
        setLoggedInUserId(payload.id);
      } catch (err) {
        localStorage.removeItem("jwtToken");
        setLoggedInUser(null);
        setLoggedInUserId(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setLoggedInUser(null);
    setLoggedInUserId(null);
  };

  return {
    loggedInUser,
    loggedInUserId,
    setLoggedInUser,
    setLoggedInUserId,
    logout,
    isLoggedIn: !!loggedInUser
  };
}
