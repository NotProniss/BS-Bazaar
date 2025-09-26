import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const UserLink = ({ username, userId, className = '', darkMode = false, ...props }) => {
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prefer userId if available
    if (userId) {
      navigate(`/profile/${encodeURIComponent(userId)}`);
      return;
    }
    
    // If only username is available, resolve it to user ID
    if (username && username !== 'Anonymous') {
      try {
        const response = await fetch(`${config.API_URL}/user/resolve/${encodeURIComponent(username)}`);
        if (response.ok) {
          const data = await response.json();
          navigate(`/profile/${encodeURIComponent(data.userId)}`);
        } else if (response.status === 404) {
          console.log(`User profile not found for ${username}`);
          // For now, just don't navigate. In the future, could show a modal or toast
          alert(`Profile not found for ${username}. This user may not have a registered account.`);
        } else {
          console.error('Failed to resolve username to user ID');
          alert(`Unable to load profile for ${username}. Please try again later.`);
        }
      } catch (error) {
        console.error('Error resolving username:', error);
        alert(`Unable to load profile for ${username}. Please try again later.`);
      }
    }
  };

  // If no username or Anonymous, just render as text
  if (!username || username === 'Anonymous') {
    return (
      <span className={className} {...props}>
        {username || 'Anonymous'}
      </span>
    );
  }

  return (
    <span
      className={`cursor-pointer hover:underline transition-colors duration-200 ${
        darkMode 
          ? 'text-yellow-400 hover:text-yellow-300' 
          : 'text-blue-600 hover:text-blue-800'
      } ${className}`}
      onClick={handleClick}
      title={`View ${username}'s profile`}
      {...props}
    >
      {username}
    </span>
  );
};

export default UserLink;