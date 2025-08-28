import React from 'react';
import { Helmet } from 'react-helmet';
import ItemCard from '../components/ItemCard';
import { joinApiUrl } from '../config';

const MyProfilePage = ({
  listings = [],
  search = '',
  setSearch = () => {},
  filterType = 'all',
  setFilterType = () => {},
  filterCategory = 'all',
  setFilterCategory = () => {},
  uniqueCategories = [],
  loggedInUser = '',
  startEditing = () => {},
  deleteListing = () => {},
  darkMode = false
}) => {
  // Local sortOrder state to always default to 'new'
  const [sortOrder, setSortOrder] = React.useState('new');
  // Episode and profession filter state
  const [episodeFilter, setEpisodeFilter] = React.useState('all');
  const [professionFilter, setProfessionFilter] = React.useState('all');
  // Active tab state for profile sections
  const [activeTab, setActiveTab] = React.useState('overview');
  // Email linking form state
  const [showEmailLinkForm, setShowEmailLinkForm] = React.useState(false);
  const [emailLinkData, setEmailLinkData] = React.useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [emailLinkError, setEmailLinkError] = React.useState('');
  const [emailLinkLoading, setEmailLinkLoading] = React.useState(false);
  const [emailLinkSuccess, setEmailLinkSuccess] = React.useState('');
  
  // User data state
  const [currentUser, setCurrentUser] = React.useState(null);
  
  // Username editing state
  const [isEditingUsername, setIsEditingUsername] = React.useState(false);
  const [newUsername, setNewUsername] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [usernameLoading, setUsernameLoading] = React.useState(false);
  
  // Fetch current user data from backend
  React.useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) return;
        
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
        const res = await fetch(joinApiUrl(BACKEND_URL, '/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    }
    
    fetchUserData();
  }, []);
  
  // Fetch item data from backend API
  const [itemData, setItemData] = React.useState([]);
  React.useEffect(() => {
    async function fetchData() {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
        const res = await fetch(joinApiUrl(BACKEND_URL, '/items'));
        if (!res.ok) throw new Error('Failed to fetch item data');
        const data = await res.json();
        setItemData(data);
      } catch (err) {
        console.error('Error fetching item data:', err);
        setItemData([]);
      }
    }
    fetchData();
  }, []);

  // Ordered episode list
  const episodeOrder = [
    'Hopeport',
    'Hopeforest',
    'Mine of Mantuban',
    'Crenopolis',
    'Stonemaw Hill'
  ];
  
  const hasGlobal = itemData.some(i => i.Episode === 'Global');
  const uniqueEpisodes = ['all', ...episodeOrder.filter(ep => itemData.some(i => i.Episode === ep)), ...(hasGlobal ? ['Global'] : [])];

  // Ordered profession list
  const professionOrder = [
    'Combat',
    'Forager',
    'Fisher',
    'Chef',
    'Alchemist',
    'Gatherer',
    'Woodcutter',
    'Carpenter',
    'Miner',
    'Bonewright',
    'Blacksmith',
    'Stonemason',
    'Detective',
    'Leatherworker',
    'Merchant'
  ];
  
  const uniqueProfessions = ['all', ...professionOrder.filter(prof => [
    ...itemData.map(i => i['Profession A']),
    ...itemData.map(i => i['Profession B'])
  ].includes(prof))];

  // Only show listings for the logged-in user
  const userListings = listings.filter(listing =>
    listing.seller && loggedInUser &&
    listing.seller.trim().toLowerCase() === loggedInUser.trim().toLowerCase()
  );

  // Calculate profile statistics
  const profileStats = {
    totalListings: userListings.length,
    activeBuyListings: userListings.filter(l => l.type === 'buy').length,
    activeSellListings: userListings.filter(l => l.type === 'sell').length,
    totalValue: userListings.reduce((sum, listing) => sum + (listing.price * listing.quantity), 0),
    joinDate: 'November 2024', // This would come from user data in a real app
    lastActive: 'Online now'
  };

  // Format currency for display
  const formatCurrency = (totalCopper) => {
    const platinum = Math.floor(totalCopper / 1000000000);
    const gold = Math.floor((totalCopper % 1000000000) / 1000000);
    const silver = Math.floor((totalCopper % 1000000) / 1000);
    const copper = totalCopper % 1000;
    
    const parts = [];
    if (platinum > 0) parts.push(`${platinum}p`);
    if (gold > 0) parts.push(`${gold}g`);
    if (silver > 0) parts.push(`${silver}s`);
    if (copper > 0 || parts.length === 0) parts.push(`${copper}c`);
    
    return parts.join(' ');
  };

  // Helper functions for dropdown images
  const getEpisodeImage = (ep) => {
    if (ep === 'all') return require('../assets/wiki.png');
    try {
      return require(`../assets/${ep.replace(/\s/g, '_')}.png`);
    } catch {
      return require('../assets/wiki.png');
    }
  };

  const getProfessionImage = (prof) => {
    if (prof === 'all') return require('../assets/None.png');
    try {
      return require(`../assets/${prof.replace(/\s/g, '_')}.png`);
    } catch {
      return require('../assets/None.png');
    }
  };

  // Custom dropdown state
  const [showEpisodeDropdown, setShowEpisodeDropdown] = React.useState(false);
  const [showProfessionDropdown, setShowProfessionDropdown] = React.useState(false);

  // Tab styling helper
  const getTabStyles = (tabName) => {
    const isActive = activeTab === tabName;
    return {
      background: isActive 
        ? (darkMode 
          ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
          : 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)')
        : (darkMode 
          ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)'
          : 'linear-gradient(135deg, rgba(245, 230, 163, 0.3) 0%, rgba(248, 249, 250, 0.8) 100%)'),
      color: isActive 
        ? (darkMode ? '#1a1a2e' : '#ffffff')
        : (darkMode ? '#F5E6A3' : '#6B4E3D'),
      border: `1px solid ${darkMode ? '#D4AF37' : '#B8860B'}`,
      boxShadow: isActive 
        ? '0 4px 8px rgba(212, 175, 55, 0.4)'
        : '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  };

  return (
    <>
      <Helmet>
        <title>My Profile | BS Bazaar</title>
        <meta name="description" content="Manage your profile and listings on BS Bazaar - Brighter Shores Marketplace" />
      </Helmet>
      
      <div>
        {/* Profile Header */}
        <div 
          className="mb-8 p-6 rounded-2xl border"
          style={{
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(245, 230, 163, 0.3) 0%, rgba(248, 249, 250, 0.8) 100%)',
            borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
            boxShadow: darkMode 
              ? '0 8px 32px rgba(212, 175, 55, 0.15)'
              : '0 8px 32px rgba(184, 134, 11, 0.15)'
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Avatar */}
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                  : 'linear-gradient(135deg, #B8860B 0%, #D4AF37 100%)',
                color: darkMode ? '#1a1a2e' : '#ffffff',
                boxShadow: darkMode 
                  ? '0 4px 15px rgba(212, 175, 55, 0.3)'
                  : '0 4px 15px rgba(184, 134, 11, 0.3)'
              }}
            >
              {loggedInUser ? loggedInUser.charAt(0).toUpperCase() : 'U'}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{
                  color: darkMode ? '#D4AF37' : '#B8860B',
                  textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {loggedInUser || 'Guest User'}
              </h1>
              <div 
                className="text-sm mb-3"
                style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
              >
                <div>Member since: {profileStats.joinDate}</div>
                <div>Status: {profileStats.lastActive}</div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="text-center">
                  <div 
                    className="text-xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {profileStats.totalListings}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Total Listings
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {formatCurrency(profileStats.totalValue)}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Total Value
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {profileStats.activeBuyListings}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Buy Orders
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-xl font-bold"
                    style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                  >
                    {profileStats.activeSellListings}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                  >
                    Sell Orders
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'listings', label: '📝 My Listings', icon: '📝' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                style={getTabStyles(tab.id)}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = darkMode 
                      ? '0 4px 8px rgba(212, 175, 55, 0.2)'
                      : '0 4px 8px rgba(184, 134, 11, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div 
            className="p-6 rounded-2xl border"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(245, 230, 163, 0.3) 0%, rgba(248, 249, 250, 0.8) 100%)',
              borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
            }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
            >
              Profile Overview
            </h2>
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  🏆 Marketplace Activity
                </h3>
                <div style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                  <div className="text-sm mb-1">Total Listings: {profileStats.totalListings}</div>
                  <div className="text-sm mb-1">Most Recent: {userListings.length > 0 ? 'Today' : 'None'}</div>
                  <div className="text-sm">Status: Active Trader</div>
                </div>
              </div>

              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  💰 Trading Stats
                </h3>
                <div style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                  <div className="text-sm mb-1">Buy Orders: {profileStats.activeBuyListings}</div>
                  <div className="text-sm mb-1">Sell Orders: {profileStats.activeSellListings}</div>
                  <div className="text-sm">Total Value: {formatCurrency(profileStats.totalValue)}</div>
                </div>
              </div>

              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  🎮 Account Info
                </h3>
                <div style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                  <div className="text-sm mb-1">Member Since: {profileStats.joinDate}</div>
                  <div className="text-sm mb-1">Last Active: {profileStats.lastActive}</div>
                  <div className="text-sm">Account Type: Standard</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div>
            <h2 
              className="text-3xl font-bold text-center mb-6"
              style={{
                color: darkMode ? '#D4AF37' : '#B8860B',
                textShadow: darkMode ? '0 4px 8px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
                fontFamily: 'serif'
              }}
            >
              My Listings ({userListings.length})
            </h2>
            
            {/* Listings filters and content - same as original mylistings page */}
            <div className="mb-4 flex flex-col gap-2 md:gap-4 justify-between items-center">
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <input
                  id="search"
                  className="border rounded px-3 py-2 w-full md:w-48 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                    color: darkMode ? '#F5E6A3' : '#6B4E3D',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                    focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
                  }}
                  type="text"
                  placeholder="Search items..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                    e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <select
                  id="type"
                  className="border rounded px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                    color: darkMode ? '#F5E6A3' : '#6B4E3D',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                    focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
                  }}
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                    e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">All</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                <select
                  id="sort"
                  className="border rounded px-3 py-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                    color: darkMode ? '#F5E6A3' : '#6B4E3D',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                    focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
                  }}
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                    e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="new">Newest</option>
                  <option value="old">Oldest</option>
                  <option value="price-high">Price High → Low</option>
                  <option value="price-low">Price Low → High</option>
                  <option value="quantity-high">Quantity High → Low</option>
                  <option value="quantity-low">Quantity Low → High</option>
                </select>
              </div>
            </div>

            {/* Episode and Profession dropdowns */}
            <div className="mb-4 flex flex-col md:flex-row gap-2 justify-center items-center">
              {/* Episode Filter */}
              <div className="relative">
                <button
                  className="border rounded px-3 py-2 pr-8 min-w-[150px] flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                    color: darkMode ? '#F5E6A3' : '#6B4E3D',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                  }}
                  onClick={() => setShowEpisodeDropdown((v) => !v)}
                  onFocus={(e) => {
                    e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                    e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <img src={getEpisodeImage(episodeFilter)} alt="Episode" className="w-5 h-5" />
                  <span className="flex-1 text-left">
                    {episodeFilter === 'all' ? 'All Episodes' : episodeFilter}
                  </span>
                  <span className="absolute right-3">▼</span>
                </button>
                {showEpisodeDropdown && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
                    style={{
                      background: darkMode 
                        ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(42, 42, 62, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
                      borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {uniqueEpisodes.map(ep => (
                      <button
                        key={ep}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors"
                        style={{
                          color: darkMode ? '#F5E6A3' : '#6B4E3D'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(184, 134, 11, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                        onClick={() => {
                          setEpisodeFilter(ep);
                          setShowEpisodeDropdown(false);
                        }}
                      >
                        <img src={getEpisodeImage(ep)} alt={ep} className="w-5 h-5" />
                        <span>{ep === 'all' ? 'All Episodes' : ep}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profession Filter */}
              <div className="relative">
                <button
                  className="border rounded px-3 py-2 pr-8 min-w-[150px] flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                    color: darkMode ? '#F5E6A3' : '#6B4E3D',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                  }}
                  onClick={() => setShowProfessionDropdown((v) => !v)}
                  onFocus={(e) => {
                    e.target.style.borderColor = darkMode ? '#D4AF37' : '#B8860B';
                    e.target.style.boxShadow = `0 0 0 2px ${darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <img src={getProfessionImage(professionFilter)} alt="Profession" className="w-5 h-5" />
                  <span className="flex-1 text-left">
                    {professionFilter === 'all' ? 'All Professions' : professionFilter}
                  </span>
                  <span className="absolute right-3">▼</span>
                </button>
                {showProfessionDropdown && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
                    style={{
                      background: darkMode 
                        ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(42, 42, 62, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
                      borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {uniqueProfessions.map(prof => (
                      <button
                        key={prof}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors"
                        style={{
                          color: darkMode ? '#F5E6A3' : '#6B4E3D'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(184, 134, 11, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                        onClick={() => {
                          setProfessionFilter(prof);
                          setShowProfessionDropdown(false);
                        }}
                      >
                        <img src={getProfessionImage(prof)} alt={prof} className="w-5 h-5" />
                        <span>{prof === 'all' ? 'All Professions' : prof}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Listings Display */}
            {userListings.length === 0 ? (
              <div 
                className="text-center py-12 rounded-2xl border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(245, 230, 163, 0.3) 0%, rgba(248, 249, 250, 0.8) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                  color: darkMode ? '#F5E6A3' : '#6B4E3D'
                }}
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  No listings yet
                </h3>
                <p>Start trading by creating your first listing!</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {userListings
                  .filter(listing => {
                    // Apply all filters
                    const matchesSearch = !search || 
                      listing.item.toLowerCase().includes(search.toLowerCase()) ||
                      listing.notes.toLowerCase().includes(search.toLowerCase());
                    
                    const matchesType = filterType === 'all' || listing.type === filterType;
                    
                    const itemInfo = itemData.find(i => i.Items === listing.item) || {};
                    const matchesEpisode = episodeFilter === 'all' || itemInfo.Episode === episodeFilter;
                    
                    const professions = [itemInfo['Profession A'], itemInfo['Profession B']].filter(p => p);
                    const matchesProfession = professionFilter === 'all' || professions.includes(professionFilter);
                    
                    return matchesSearch && matchesType && matchesEpisode && matchesProfession;
                  })
                  .sort((a, b) => {
                    switch (sortOrder) {
                      case 'old':
                        return new Date(a.timestamp) - new Date(b.timestamp);
                      case 'price-high':
                        return (b.price * b.quantity) - (a.price * a.quantity);
                      case 'price-low':
                        return (a.price * a.quantity) - (b.price * b.quantity);
                      case 'quantity-high':
                        return b.quantity - a.quantity;
                      case 'quantity-low':
                        return a.quantity - b.quantity;
                      default: // 'new'
                        return new Date(b.timestamp) - new Date(a.timestamp);
                    }
                  })
                  .map(listing => {
                    const itemInfo = itemData.find(i => i.Items === listing.item) || {};
                    let professionsB = [];
                    if (itemInfo["Profession B"] && typeof itemInfo["Profession B"] === "string") {
                      professionsB = itemInfo["Profession B"].split(/[,/]/).map(p => p.trim()).filter(p => p && p !== "Combat" && p !== "None" && p !== itemInfo["Profession A"]);
                      professionsB = [...new Set(professionsB)];
                    }
                    return (
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
                        professionsB={professionsB}
                      />
                    );
                  })}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div 
            className="p-6 rounded-2xl border"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(42, 42, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(245, 230, 163, 0.3) 0%, rgba(248, 249, 250, 0.8) 100%)',
              borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
            }}
          >
            <h2 
              className="text-2xl font-bold mb-6"
              style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
            >
              Account Settings
            </h2>
            
            <div className="space-y-6">
              {/* Profile Settings */}
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  Profile Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label 
                        className="block text-sm font-medium"
                        style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                      >
                        Display Name
                      </label>
                      {!isEditingUsername && (
                        <button
                          onClick={() => {
                            setIsEditingUsername(true);
                            setNewUsername(currentUser?.username || '');
                            setUsernameError('');
                          }}
                          className="text-xs px-2 py-1 rounded transition-colors"
                          style={{
                            background: darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)',
                            color: darkMode ? '#D4AF37' : '#B8860B'
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    
                    {isEditingUsername ? (
                      <div className="space-y-2">
                        <input 
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Enter new username"
                          className="w-full px-3 py-2 border rounded"
                          style={{
                            background: darkMode 
                              ? 'rgba(26, 26, 46, 0.5)'
                              : 'rgba(248, 249, 250, 0.5)',
                            color: darkMode ? '#F5E6A3' : '#6B4E3D',
                            borderColor: usernameError 
                              ? '#dc2626' 
                              : (darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)')
                          }}
                        />
                        {usernameError && (
                          <p className="text-xs" style={{ color: '#dc2626' }}>
                            {usernameError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.handleUsernameUpdate && window.handleUsernameUpdate()}
                            disabled={usernameLoading}
                            className="px-3 py-1 text-xs rounded transition-colors"
                            style={{
                              background: darkMode ? '#D4AF37' : '#B8860B',
                              color: 'white',
                              opacity: usernameLoading ? 0.7 : 1
                            }}
                          >
                            {usernameLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingUsername(false);
                              setNewUsername('');
                              setUsernameError('');
                            }}
                            disabled={usernameLoading}
                            className="px-3 py-1 text-xs rounded transition-colors"
                            style={{
                              background: 'transparent',
                              color: darkMode ? '#F5E6A3' : '#6B4E3D',
                              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input 
                          type="text"
                          value={currentUser?.username || ''}
                          disabled
                          className="w-full px-3 py-2 border rounded"
                          style={{
                            background: darkMode 
                              ? 'rgba(26, 26, 46, 0.5)'
                              : 'rgba(248, 249, 250, 0.5)',
                            color: darkMode ? '#F5E6A3' : '#6B4E3D',
                            borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                          }}
                        />
                        <p 
                          className="text-xs mt-1"
                          style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                        >
                          Your display name as shown to other users
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Linked Email Display */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                    >
                      Linked Email
                    </label>
                    <input 
                      type="email"
                      value={currentUser?.email || 'No email linked'}
                      disabled
                      className="w-full px-3 py-2 border rounded"
                      style={{
                        background: darkMode 
                          ? 'rgba(26, 26, 46, 0.5)'
                          : 'rgba(248, 249, 250, 0.5)',
                        color: darkMode ? '#F5E6A3' : '#6B4E3D',
                        borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                      }}
                    />
                    <p 
                      className="text-xs mt-1"
                      style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                    >
                      {currentUser?.email ? 'Email verified and ready for login' : 'You can link an email below for alternative login'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                    >
                      Current Password
                    </label>
                    <input 
                      type="password"
                      placeholder="Enter your current password"
                      className="w-full px-3 py-2 border rounded transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                        color: darkMode ? '#F5E6A3' : '#6B4E3D',
                        borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
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
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                    >
                      New Password
                    </label>
                    <input 
                      type="password"
                      placeholder="Enter your new password"
                      className="w-full px-3 py-2 border rounded transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                        color: darkMode ? '#F5E6A3' : '#6B4E3D',
                        borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
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
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1"
                      style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                    >
                      Confirm New Password
                    </label>
                    <input 
                      type="password"
                      placeholder="Confirm your new password"
                      className="w-full px-3 py-2 border rounded transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                        color: darkMode ? '#F5E6A3' : '#6B4E3D',
                        borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
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
                  </div>
                  <div className="pt-2">
                    <button
                      className="px-6 py-2 rounded font-medium transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(184, 134, 11, 0.8) 100%)'
                          : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                        color: darkMode ? '#1A1A2E' : 'white',
                        border: `1px solid ${darkMode ? '#D4AF37' : '#B8860B'}`,
                        boxShadow: darkMode 
                          ? '0 4px 12px rgba(212, 175, 55, 0.3)'
                          : '0 4px 12px rgba(184, 134, 11, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = darkMode 
                          ? '0 6px 20px rgba(212, 175, 55, 0.4)'
                          : '0 6px 20px rgba(184, 134, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0px)';
                        e.target.style.boxShadow = darkMode 
                          ? '0 4px 12px rgba(212, 175, 55, 0.3)'
                          : '0 4px 12px rgba(184, 134, 11, 0.3)';
                      }}
                      onClick={() => {
                        // Password change logic would go here
                        const handlePasswordChange = async () => {
                          const currentPassword = document.querySelector('input[placeholder="Enter your current password"]').value;
                          const newPassword = document.querySelector('input[placeholder="Enter your new password"]').value;
                          const confirmPassword = document.querySelector('input[placeholder="Confirm your new password"]').value;
                          
                          if (!currentPassword || !newPassword || !confirmPassword) {
                            alert('Please fill in all password fields');
                            return;
                          }
                          
                          if (newPassword !== confirmPassword) {
                            alert('New passwords do not match');
                            return;
                          }
                          
                          if (newPassword.length < 8) {
                            alert('New password must be at least 8 characters long');
                            return;
                          }
                          
                          try {
                            const token = localStorage.getItem('jwtToken');
                            const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
                            
                            const response = await fetch(joinApiUrl(BACKEND_URL, '/auth/change-password'), {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                currentPassword,
                                newPassword
                              })
                            });
                            
                            const data = await response.json();
                            
                            if (response.ok) {
                              alert('Password changed successfully!');
                              // Clear the form
                              document.querySelector('input[placeholder="Enter your current password"]').value = '';
                              document.querySelector('input[placeholder="Enter your new password"]').value = '';
                              document.querySelector('input[placeholder="Confirm your new password"]').value = '';
                            } else {
                              alert(data.error || 'Failed to change password');
                            }
                          } catch (error) {
                            alert('Network error. Please try again.');
                          }
                        };
                        
                        handlePasswordChange();
                      }}
                    >
                      Update Password
                    </button>
                  </div>
                  <div>
                    <p 
                      className="text-xs"
                      style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                    >
                      Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
                    </p>
                  </div>
                </div>
              </div>

              {/* Username Update Function */}
              {React.createElement(() => {
                const handleUsernameUpdate = async () => {
                  if (!newUsername.trim() || newUsername.trim() === currentUser?.username) {
                    setIsEditingUsername(false);
                    setNewUsername('');
                    return;
                  }

                  setUsernameLoading(true);
                  setUsernameError('');

                  try {
                    const token = localStorage.getItem('jwtToken');
                    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
                    
                    const response = await fetch(joinApiUrl(BACKEND_URL, '/auth/update-username'), {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ username: newUsername.trim() })
                    });

                    const data = await response.json();

                    if (response.ok) {
                      setCurrentUser(prev => ({ ...prev, username: data.username }));
                      setIsEditingUsername(false);
                      setNewUsername('');
                      setUsernameError('');
                    } else {
                      setUsernameError(data.error || 'Failed to update username');
                    }
                  } catch (error) {
                    setUsernameError('Network error. Please try again.');
                  } finally {
                    setUsernameLoading(false);
                  }
                };

                // Store the function for use in the component
                window.handleUsernameUpdate = handleUsernameUpdate;
                return null;
              })}

              {/* Account Linking Section */}
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  Account Linking
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded border" style={{
                    background: darkMode ? 'rgba(26, 26, 46, 0.5)' : 'rgba(248, 249, 250, 0.5)',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'
                  }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎮</span>
                      <div>
                        <p className="font-medium" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                          Discord Account
                        </p>
                        <p className="text-xs" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                          {currentUser?.discord_id ? `Connected: ${currentUser.discord_username || 'Discord User'}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 text-sm rounded transition-all duration-300"
                      style={{
                        background: currentUser?.discord_id 
                          ? 'transparent'
                          : (darkMode ? 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)' : 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)'),
                        color: currentUser?.discord_id 
                          ? (darkMode ? '#F5E6A3' : '#6B4E3D')
                          : 'white',
                        border: currentUser?.discord_id 
                          ? `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`
                          : 'none'
                      }}
                      onClick={() => {
                        if (!currentUser?.discord_id) {
                          const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
                          window.location.href = joinApiUrl(BACKEND_URL, '/auth/discord');
                        }
                      }}
                    >
                      {currentUser?.discord_id ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded border" style={{
                    background: darkMode ? 'rgba(26, 26, 46, 0.5)' : 'rgba(248, 249, 250, 0.5)',
                    borderColor: darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 134, 11, 0.2)'
                  }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <p className="font-medium" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                          Email & Password
                        </p>
                        <p className="text-xs" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                          {currentUser?.email ? `Connected: ${currentUser.email}` : 'Add email login to your account'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 text-sm rounded transition-all duration-300"
                      style={{
                        background: currentUser?.email
                          ? 'transparent'
                          : (darkMode 
                            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(184, 134, 11, 0.8) 100%)'
                            : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'),
                        color: currentUser?.email
                          ? (darkMode ? '#F5E6A3' : '#6B4E3D')
                          : (darkMode ? '#1A1A2E' : 'white'),
                        border: currentUser?.email
                          ? `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`
                          : 'none'
                      }}
                      onClick={() => {
                        if (!currentUser?.email) {
                          setShowEmailLinkForm(!showEmailLinkForm);
                        }
                      }}
                      disabled={!!currentUser?.email}
                    >
                      {currentUser?.email ? 'Connected' : (showEmailLinkForm ? 'Cancel' : 'Link Email')}
                    </button>
                  </div>
                  
                  {/* Email Linking Form */}
                  {showEmailLinkForm && !currentUser?.email && (
                    <div className="mt-4 p-4 rounded border" style={{
                      background: darkMode ? 'rgba(26, 26, 46, 0.3)' : 'rgba(248, 249, 250, 0.3)',
                      borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                    }}>
                      <h4 className="font-medium mb-3" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                        Link Email & Password
                      </h4>
                      {emailLinkError && (
                        <div className="mb-3 p-2 rounded text-sm" style={{
                          background: darkMode ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)',
                          color: darkMode ? '#FF6B6B' : '#DC3545',
                          border: `1px solid ${darkMode ? 'rgba(220, 53, 69, 0.3)' : 'rgba(220, 53, 69, 0.2)'}`
                        }}>
                          {emailLinkError}
                        </div>
                      )}
                      {emailLinkSuccess && (
                        <div className="mb-3 p-2 rounded text-sm" style={{
                          background: darkMode ? 'rgba(40, 167, 69, 0.2)' : 'rgba(40, 167, 69, 0.1)',
                          color: darkMode ? '#4CAF50' : '#28A745',
                          border: `1px solid ${darkMode ? 'rgba(40, 167, 69, 0.3)' : 'rgba(40, 167, 69, 0.2)'}`
                        }}>
                          {emailLinkSuccess}
                        </div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={emailLinkData.email}
                            onChange={(e) => setEmailLinkData({...emailLinkData, email: e.target.value})}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                            style={{
                              background: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'white',
                              borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                              color: darkMode ? '#F5E6A3' : '#6B4E3D',
                              focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
                            }}
                            placeholder="Enter your email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                            Password
                          </label>
                          <input
                            type="password"
                            value={emailLinkData.password}
                            onChange={(e) => setEmailLinkData({...emailLinkData, password: e.target.value})}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                            style={{
                              background: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'white',
                              borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                              color: darkMode ? '#F5E6A3' : '#6B4E3D'
                            }}
                            placeholder="Create a password (min 8 characters)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={emailLinkData.confirmPassword}
                            onChange={(e) => setEmailLinkData({...emailLinkData, confirmPassword: e.target.value})}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                            style={{
                              background: darkMode ? 'rgba(26, 26, 46, 0.7)' : 'white',
                              borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)',
                              color: darkMode ? '#F5E6A3' : '#6B4E3D'
                            }}
                            placeholder="Confirm your password"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={async () => {
                              setEmailLinkError('');
                              
                              // Validation
                              if (!emailLinkData.email || !emailLinkData.password || !emailLinkData.confirmPassword) {
                                setEmailLinkError('All fields are required');
                                return;
                              }
                              
                              if (emailLinkData.password.length < 8) {
                                setEmailLinkError('Password must be at least 8 characters long');
                                return;
                              }
                              
                              if (emailLinkData.password !== emailLinkData.confirmPassword) {
                                setEmailLinkError('Passwords do not match');
                                return;
                              }
                              
                              // Email validation
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              if (!emailRegex.test(emailLinkData.email)) {
                                setEmailLinkError('Please enter a valid email address');
                                return;
                              }
                              
                              setEmailLinkLoading(true);
                              
                              try {
                                const token = localStorage.getItem('jwtToken');
                                console.log('[CLIENT] Token exists:', !!token);
                                console.log('[CLIENT] Token length:', token?.length);
                                
                                // Let's decode the token to see what's in it
                                if (token) {
                                  try {
                                    const payload = JSON.parse(atob(token.split('.')[1]));
                                    console.log('[CLIENT] Token payload:', payload);
                                  } catch (e) {
                                    console.log('[CLIENT] Could not decode token:', e);
                                  }
                                }
                                
                                const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
                                console.log('[CLIENT] Backend URL:', BACKEND_URL);
                                console.log('[CLIENT] Full URL:', joinApiUrl(BACKEND_URL, '/auth/link-email'));
                                
                                const response = await fetch(joinApiUrl(BACKEND_URL, '/auth/link-email'), {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ 
                                    email: emailLinkData.email, 
                                    password: emailLinkData.password 
                                  })
                                });
                                
                                const data = await response.json();
                                console.log('[CLIENT] Response status:', response.status);
                                console.log('[CLIENT] Response data:', data);
                                
                                if (response.ok) {
                                  const responseData = data;
                                  setEmailLinkSuccess(responseData.message || 'Email linked successfully!');
                                  setEmailLinkError('');
                                  setEmailLinkData({ email: '', password: '', confirmPassword: '' });
                                  
                                  // Refresh user data to show the linked email
                                  const token = localStorage.getItem('jwtToken');
                                  if (token) {
                                    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
                                    fetch(joinApiUrl(BACKEND_URL, '/auth/me'), {
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    }).then(res => res.json()).then(userData => {
                                      setCurrentUser(userData);
                                    }).catch(console.error);
                                  }
                                  
                                  // Auto-hide the form after a few seconds
                                  setTimeout(() => {
                                    setShowEmailLinkForm(false);
                                    setEmailLinkSuccess('');
                                  }, 6000); // Longer timeout for email verification message
                                } else {
                                  setEmailLinkError(data.error || 'Failed to link email');
                                }
                              } catch (error) {
                                setEmailLinkError('Network error. Please try again.');
                              } finally {
                                setEmailLinkLoading(false);
                              }
                            }}
                            disabled={emailLinkLoading}
                            className="px-4 py-2 text-sm rounded transition-all duration-300"
                            style={{
                              background: emailLinkLoading 
                                ? (darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)')
                                : (darkMode 
                                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(184, 134, 11, 0.8) 100%)'
                                  : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'),
                              color: darkMode ? '#1A1A2E' : 'white',
                              border: 'none',
                              cursor: emailLinkLoading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {emailLinkLoading ? 'Linking...' : 'Link Email'}
                          </button>
                          <button
                            onClick={() => {
                              setShowEmailLinkForm(false);
                              setEmailLinkData({ email: '', password: '', confirmPassword: '' });
                              setEmailLinkError('');
                            }}
                            className="px-4 py-2 text-sm rounded transition-all duration-300"
                            style={{
                              background: 'transparent',
                              color: darkMode ? '#F5E6A3' : '#6B4E3D',
                              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                  
                  <p className="text-xs" style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                    Linking accounts allows you to sign in with either method and keeps your data synchronized.
                  </p>
                </div>
              </div>

              {/* Privacy Settings */}
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  borderColor: darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: darkMode ? '#D4AF37' : '#B8860B' }}
                >
                  Privacy & Notifications
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                      Show profile stats publicly
                    </span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                      Email notifications for trades
                    </span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}>
                      Allow direct messages
                    </span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div 
                className="p-4 rounded-lg border"
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(60, 26, 26, 0.8) 0%, rgba(42, 22, 22, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(254, 226, 226, 0.9) 0%, rgba(248, 240, 240, 0.9) 100%)',
                  borderColor: '#dc2626'
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: '#dc2626' }}
                >
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  <button
                    className="px-4 py-2 rounded border font-medium transition-all duration-300"
                    style={{
                      background: 'transparent',
                      color: '#dc2626',
                      borderColor: '#dc2626'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc2626';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#dc2626';
                    }}
                  >
                    Delete All Listings
                  </button>
                  <div>
                    <p 
                      className="text-sm"
                      style={{ color: darkMode ? '#F5E6A3' : '#6B4E3D' }}
                    >
                      This will permanently remove all your active listings from the marketplace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </>
  );
};

export default MyProfilePage;
