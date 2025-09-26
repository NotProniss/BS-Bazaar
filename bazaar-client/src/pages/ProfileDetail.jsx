import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ItemCard from '../components/ItemCard';
import config from '../config';

const ProfileDetail = ({ loggedInUser, startEditing, deleteListing, darkMode }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.API_URL}/profile/${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Profile not found');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.profile);
      setListings(data.listings || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Format currency for display with icons
  const formatCurrency = (totalCopper) => {
    const platinum = Math.floor(totalCopper / 1000000000);
    const gold = Math.floor((totalCopper % 1000000000) / 1000000);
    const silver = Math.floor((totalCopper % 1000000) / 1000);
    const copper = totalCopper % 1000;
    
    const parts = [];
    if (platinum > 0) {
      parts.push(
        <span key="platinum" className="inline-flex items-center gap-1">
          {platinum}
          <img src="/assets/Platinum.png" alt="Platinum" className="w-4 h-4" />
        </span>
      );
    }
    if (gold > 0) {
      parts.push(
        <span key="gold" className="inline-flex items-center gap-1">
          {gold}
          <img src="/assets/Gold.png" alt="Gold" className="w-4 h-4" />
        </span>
      );
    }
    if (silver > 0) {
      parts.push(
        <span key="silver" className="inline-flex items-center gap-1">
          {silver}
          <img src="/assets/Silver.png" alt="Silver" className="w-4 h-4" />
        </span>
      );
    }
    if (copper > 0 || parts.length === 0) {
      parts.push(
        <span key="copper" className="inline-flex items-center gap-1">
          {copper}
          <img src="/assets/Copper.png" alt="Copper" className="w-4 h-4" />
        </span>
      );
    }
    
    return (
      <div className="inline-flex flex-wrap items-center gap-2">
        {parts}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex flex-col`}>
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex flex-col`}>
        <Helmet>
          <title>Profile Not Found | BS Bazaar</title>
          <meta name="description" content="The requested profile could not be found." />
        </Helmet>
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="mb-6">{error || 'The profile you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex flex-col`}>
      <Helmet>
        <title>{profile.username}'s Profile | BS Bazaar</title>
        <meta name="description" content={`View ${profile.username}'s profile and listings on BS Bazaar. ${listings.length} active listings.`} />
        <meta property="og:title" content={`${profile.username}'s Profile | BS Bazaar`} />
        <meta property="og:description" content={`View ${profile.username}'s profile and listings on BS Bazaar. ${listings.length} active listings.`} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${profile.username}'s Profile | BS Bazaar`} />
        <meta name="twitter:description" content={`View ${profile.username}'s profile and listings on BS Bazaar. ${listings.length} active listings.`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className={`p-6 rounded-2xl shadow-lg mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-500">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={`${profile.username}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-yellow-600'}`}>
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}>
                  {profile.username}
                </h1>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>User ID: #{userId}</p>
                  <p>Member since: {stats?.joinDate || (profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown')}</p>
                  <p>Status: {stats?.lastActive || 'Online now'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          {stats && (
            <div className={`p-6 rounded-2xl shadow-lg mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {stats.totalListings}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Total Listings
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {formatCurrency(stats.totalValue)}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Total Value
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {stats.activeBuyListings}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Buy Orders
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {stats.activeSellListings}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Sell Orders
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings Section */}
          <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}>
              {profile.username}'s Listings
            </h2>
            
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {profile.username} doesn't have any active listings yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <ItemCard
                    key={listing.id}
                    listing={listing}
                    item={listing.item}
                    type={listing.type}
                    platinum={Math.floor(listing.price / 1000000000)}
                    gold={Math.floor((listing.price % 1000000000) / 1000000)}
                    silver={Math.floor((listing.price % 1000000) / 1000)}
                    copper={listing.price % 1000}
                    quantity={listing.quantity}
                    IGN={listing.IGN}
                    notes={listing.notes}
                    combatLevel={listing.combatLevel || ""}
                    combatStrength={listing.combatStrength || ""}
                    rarity={listing.rarity || ""}
                    combatDmgType={listing.combatDmgType || ""}
                    combatDmgPercent={listing.combatDmgPercent || ""}
                    priceDisplayMode={listing.priceMode}
                    combatCategory={listing.combatCategory || ""}
                    combatImpact={listing.combatImpact || ""}
                    combatCryonae={listing.combatCryonae || ""}
                    combatArborae={listing.combatArborae || ""}
                    combatTempestae={listing.combatTempestae || ""}
                    combatInfernae={listing.combatInfernae || ""}
                    combatNecromae={listing.combatNecromae || ""}
                    loggedInUser={loggedInUser}
                    darkMode={darkMode}
                    isListing={true}
                    onEdit={
                      loggedInUser && listing.seller &&
                      listing.seller.trim().toLowerCase() === loggedInUser.trim().toLowerCase()
                        ? () => startEditing(listing)
                        : undefined
                    }
                    onDelete={
                      loggedInUser && listing.seller &&
                      listing.seller.trim().toLowerCase() === loggedInUser.trim().toLowerCase()
                        ? () => deleteListing(listing.id)
                        : undefined
                    }
                    timestamp={listing.timestamp}
                    seller={listing.seller}
                    sellerAvatar={listing.sellerAvatar}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
