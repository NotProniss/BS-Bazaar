
import React, { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import posthog from 'posthog-js';
import Sidebar from './components/Sidebar';
import LoginPopup from './components/LoginPopup';
import Footer from './components/Footer';
import AdminDashboard from './AdminDashboard';
import Register from './pages/Register';
import ListingsPage from './pages/alllistings';
import PostPage from './pages/postlistings';
import MyProfile from './pages/myprofile';
import TestPage from './pages/test';
import AuthSuccess from './AuthSuccess';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import { jwtDecode } from 'jwt-decode';
import GettingStarted from './pages/gettingstarted';

// PostHog pageview tracking component
function PostHogPageView() {
  const location = useLocation();
  useEffect(() => {
    posthog.capture('$pageview');
  }, [location]);
  return null;
}


function AppContent() {
  const navigate = useNavigate();
  // ...existing code...
  const location = useLocation();

  // Dynamic metadata based on route
  const getMeta = () => {
    if (location.pathname.startsWith('/alllistings') || location.pathname === '/') {
      return {
        title: 'BS Bazaar - All Listings',
        description: 'Browse all player listings for Brighter Shores. Find the best deals on items, resources, and more!'
      };
    }
    if (location.pathname.startsWith('/post')) {
      return {
        title: 'Post a Listing | BS Bazaar',
        description: 'Post your own listing to the BS Bazaar marketplace and reach other Brighter Shores players.'
      };
    }
    if (location.pathname.startsWith('/myprofile')) {
      return {
        title: 'My Profile | BS Bazaar',
        description: 'Manage your profile and listings on BS Bazaar - Brighter Shores Marketplace'
      };
    }
    if (location.pathname.startsWith('/mylistings')) {
      return {
        title: 'My Profile | BS Bazaar',
        description: 'Manage your profile and listings on BS Bazaar - Brighter Shores Marketplace'
      };
    }
    if (location.pathname.startsWith('/adminpanel')) {
      return {
        title: 'Admin Panel | BS Bazaar',
        description: 'Admin dashboard for managing users and listings on BS Bazaar.'
      };
    }
    if (location.pathname.startsWith('/gettingstarted')) {
      return {
        title: 'Getting Started | BS Bazaar',
        description: 'Learn how to use BS Bazaar, the Brighter Shores player marketplace.'
      };
    }
    return {
      title: 'BS Bazaar - Brighter Shores Marketplace',
      description: 'BS Bazaar is a player-driven marketplace for Brighter Shores. Buy, sell, and discover in-game items, resources, and more!'
    };
  };
  const meta = getMeta();
  const [listings, setListings] = useState([]);
  const [type, setType] = useState('buy');
  const [item, setItem] = useState('');
  const [platinum, setPlatinum] = useState('');
  const [gold, setGold] = useState('');
  const [silver, setSilver] = useState('');
  const [copper, setCopper] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add missing state for listing fields
  const [IGN, setIGN] = useState('');
  const [notes, setNotes] = useState('');
  const [priceMode, setPriceMode] = useState('Each');
  const [combatCategory, setCombatCategory] = useState('');
  const [combatLevel, setCombatLevel] = useState('');
  const [combatStrength, setCombatStrength] = useState('');
  const [combatDmgType, setCombatDmgType] = useState('');
  const [combatDmgPercent, setCombatDmgPercent] = useState('');
  const [combatImpact, setCombatImpact] = useState('');
  const [combatCryonae, setCombatCryonae] = useState('');
  const [combatArborae, setCombatArborae] = useState('');
  const [combatTempestae, setCombatTempestae] = useState('');
  const [combatInfernae, setCombatInfernae] = useState('');
  const [combatNecromae, setCombatNecromae] = useState('');
  const [rarity, setRarity] = useState('');

  // Use environment variable for backend URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';

  const fetchListings = React.useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/listings`);
      console.log('Fetched listings:', res.data);
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchListings();

    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = jwtDecode(token);
        setLoggedInUser(payload.username);
        // Check admin status
        console.log('[DEBUG] Checking admin status for user:', payload.username);
        console.log('[DEBUG] Making request to:', `${BACKEND_URL}/is-admin`);
        axios.get(`${BACKEND_URL}/is-admin`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            console.log('[DEBUG] Admin check response:', res.data);
            setIsAdmin(res.data.isAdmin || false);
          })
          .catch(err => {
            console.error('Failed to check admin status:', err);
            setIsAdmin(false);
          });
      } catch (err) {
        console.warn('Invalid token in localStorage');
        localStorage.removeItem('jwtToken');
        setLoggedInUser(null);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchListings]);

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setLoggedInUser(null);
  };

  const resetForm = () => {
    setItem('');
    setPlatinum('');
    setGold('');
    setSilver('');
    setCopper('');
    setQuantity('');
    setCategory('');
    setType('buy');
    setEditingId(null);
    setIGN('');
    setNotes('');
    // Reset combat fields
    setCombatCategory('');
    setCombatLevel('');
    setCombatStrength('');
    setCombatDmgType('');
    setCombatDmgPercent('');
    setCombatImpact('');
    setCombatCryonae('');
    setCombatArborae('');
    setCombatTempestae('');
    setCombatInfernae('');
    setCombatNecromae('');
    setRarity('');
    setPriceMode('Each');
  };

  const addOrEditListing = async (listing) => {
    console.log('[DEBUG] addOrEditListing called with:', listing);
    console.log('[DEBUG] editingId:', editingId);
    
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      showToast('You must be logged in!', 'error');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Use the listing object from ListingForm, but ensure seller is set
    const listingData = {
      ...listing,
      seller: loggedInUser,
    };

    console.log('[DEBUG] Sending listingData:', listingData);

    try {
      if (editingId) {
        console.log('[DEBUG] Making PUT request to:', `${BACKEND_URL}/listings/${editingId}`);
        const response = await axios.put(`${BACKEND_URL}/listings/${editingId}`, listingData, config);
        console.log('[DEBUG] PUT response:', response.data);
      } else {
        console.log('[DEBUG] Making POST request to:', `${BACKEND_URL}/listings`);
        const response = await axios.post(`${BACKEND_URL}/listings`, listingData, config);
        console.log('[DEBUG] POST response:', response.data);
      }
      resetForm();
      fetchListings();
      showToast('Listing saved!', 'success');
    } catch (err) {
      console.error('[DEBUG] Error saving listing:', err);
      console.error('[DEBUG] Error response:', err.response?.data);
      showToast('Failed to save listing', 'error');
    }
  };

  const deleteListing = async (id) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      showToast('You must be logged in!', 'error');
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchListings();
      showToast('Listing deleted!', 'success');
    } catch (err) {
      console.error('Failed to delete listing:', err);
      showToast('Failed to delete listing', 'error');
    }
  };

  const startEditing = (listing) => {
    console.log('Editing listing:', listing);
    setItem(listing.item);
    
    // Set price fields
    const price = listing.price;
    setPlatinum(Math.floor(price / 1000000000));
    setGold(Math.floor((price % 1000000000) / 1000000));
    setSilver(Math.floor((price % 1000000) / 1000));
    setCopper(price % 1000);
    
    // Set basic fields
    setQuantity(listing.quantity);
    setType(listing.type);
    setCategory(listing.category);
    setIGN(listing.IGN || '');
    setNotes(listing.notes || '');
    
    // Set price display mode
    setPriceMode(listing.priceMode || 'Each');
    
    // Set combat fields
    setCombatCategory(listing.combatCategory || '');
    setCombatLevel(listing.combatLevel || '');
    setCombatStrength(listing.combatStrength || '');
    setCombatDmgType(listing.combatDmgType || '');
    setCombatDmgPercent(listing.combatDmgPercent || '');
    setCombatImpact(listing.combatImpact || '');
    setCombatCryonae(listing.combatCryonae || '');
    setCombatArborae(listing.combatArborae || '');
    setCombatTempestae(listing.combatTempestae || '');
    setCombatInfernae(listing.combatInfernae || '');
    setCombatNecromae(listing.combatNecromae || '');
    setRarity(listing.rarity || '');
    
    setEditingId(listing.id);
    navigate('/post');
  };


  const filteredListings = listings
    .filter(
      (listing) =>
        listing.item.toLowerCase().includes(search.toLowerCase()) &&
        (filterType === 'all' || listing.type === filterType) &&
        (filterCategory === 'all' || (listing.category && listing.category.toLowerCase() === filterCategory.toLowerCase()))
    )
    .sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));
  console.log('Filtered listings:', filteredListings.length, 'of', listings.length);

  const uniqueCategories = ['all', ...new Set(listings.map((l) => l.category))];

  // Toast state and component
  const showToast = (message, type = 'info') => {
    // Toast logic is present, but toast state is not used in UI
    setTimeout(() => {}, 2500);
  };

  // Dark mode state and toggle
  const [darkMode, setDarkMode] = useState(true);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Login popup state
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Sidebar collapse state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    console.log('toggleSidebar called, current state:', sidebarOpen);
    setSidebarOpen((prev) => !prev);
  };
  const closeSidebar = () => {
    console.log('closeSidebar called');
    setSidebarOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content="https://bs-bazaar.com/logo512.png" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content="https://bs-bazaar.com/logo512.png" />
      </Helmet>
      <div className={`min-h-screen flex flex-row ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}> 
        <PostHogPageView />
        
        {/* Overlay backdrop when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar - hideable on all screen sizes */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out w-72 flex-shrink-0`}>
          <Sidebar
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            loggedInUser={loggedInUser}
            logout={logout}
            isAdmin={isAdmin}
            closeSidebar={closeSidebar}
            showLoginPopup={showLoginPopup}
            setShowLoginPopup={setShowLoginPopup}
          />
        </div>
        
        <main 
          className="flex-1 flex flex-col"
          style={{
            background: darkMode 
              ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}
        > 
          {/* Hamburger menu - now visible on both mobile and desktop */}
          <div 
            className="flex items-center justify-between p-4 shadow-sm"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderBottom: `2px solid ${darkMode ? '#D4AF37' : '#B8860B'}`
            }}
          >
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                color: darkMode ? '#D4AF37' : '#B8860B',
                backgroundColor: 'transparent',
                focusRingColor: darkMode ? '#D4AF37' : '#B8860B'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(184, 134, 11, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 
              className="text-xl font-bold"
              style={{ 
                color: darkMode ? '#D4AF37' : '#B8860B',
                textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)',
                fontFamily: 'serif'
              }}
            >
              BS Bazaar
            </h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
          
          <div className="flex-1 py-4 lg:py-10 px-4">
            <div 
              className="max-w-3xl mx-auto p-6 rounded-2xl shadow-lg"
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(42, 42, 62, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
                border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`,
                boxShadow: darkMode 
                  ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Header removed from main area. Now only in sidebar. */}
              {/* ...existing code... */}
              <Routes>
                <Route path="/auth-success" element={<AuthSuccess />} />
                <Route path="/reset-password" element={<ResetPassword darkMode={darkMode} />} />
                <Route path="/verify-email" element={<VerifyEmail darkMode={darkMode} />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/" element={<Navigate to="/alllistings" replace />} />
                <Route path="/gettingstarted" element={<GettingStarted darkMode={darkMode} />} />
                <Route path="/alllistings" element={
                  <ListingsPage
                    listings={listings}
                    search={search}
                    setSearch={setSearch}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    uniqueCategories={uniqueCategories}
                    filteredListings={filteredListings}
                    loggedInUser={loggedInUser}
                    startEditing={startEditing}
                    deleteListing={deleteListing}
                    darkMode={darkMode}
                  />
                } />
                <Route path="/listings" element={<Navigate to="/alllistings" replace />} />
                <Route path="/post" element={
                  loggedInUser ? (
                    <PostPage
                      key={editingId || 'new'}
                      item={item}
                      setItem={setItem}
                      platinum={platinum}
                      setPlatinum={setPlatinum}
                      gold={gold}
                      setGold={setGold}
                      silver={silver}
                      setSilver={setSilver}
                      copper={copper}
                      setCopper={setCopper}
                      quantity={quantity}
                      setQuantity={setQuantity}
                      category={category}
                      setCategory={setCategory}
                      type={type}
                      setType={setType}
                      IGN={IGN}
                      setIGN={setIGN}
                      notes={notes}
                      setNotes={setNotes}
                      priceMode={priceMode}
                      setPriceMode={setPriceMode}
                      combatCategory={combatCategory}
                      setCombatCategory={setCombatCategory}
                      combatLevel={combatLevel}
                      setCombatLevel={setCombatLevel}
                      combatStrength={combatStrength}
                      setCombatStrength={setCombatStrength}
                      combatDmgType={combatDmgType}
                      setCombatDmgType={setCombatDmgType}
                      combatDmgPercent={combatDmgPercent}
                      setCombatDmgPercent={setCombatDmgPercent}
                      combatImpact={combatImpact}
                      setCombatImpact={setCombatImpact}
                      combatCryonae={combatCryonae}
                      setCombatCryonae={setCombatCryonae}
                      combatArborae={combatArborae}
                      setCombatArborae={setCombatArborae}
                      combatTempestae={combatTempestae}
                      setCombatTempestae={setCombatTempestae}
                      combatInfernae={combatInfernae}
                      setCombatInfernae={setCombatInfernae}
                      combatNecromae={combatNecromae}
                      setCombatNecromae={setCombatNecromae}
                      rarity={rarity}
                      setRarity={setRarity}
                      addOrEditListing={addOrEditListing}
                      editingId={editingId}
                      resetForm={resetForm}
                      darkMode={darkMode}
                    />
                  ) : (
                    <div className="text-center text-white">Please log in to post a listing.</div>
                  )
                } />
                <Route path="/myprofile" element={
                  <MyProfile
                    listings={listings}
                    search={search}
                    setSearch={setSearch}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    uniqueCategories={uniqueCategories}
                    loggedInUser={loggedInUser}
                    startEditing={startEditing}
                    deleteListing={deleteListing}
                    darkMode={darkMode}
                  />
                } />
                {/* Legacy route redirect */}
                <Route path="/mylistings" element={<Navigate to="/myprofile" replace />} />
                <Route path="/adminpanel" element={<AdminDashboard onRefreshListings={fetchListings} darkMode={darkMode} />} />
                <Route path="/register" element={
                  <Register 
                    darkMode={darkMode}
                    showLoginPopup={showLoginPopup}
                    setShowLoginPopup={setShowLoginPopup}
                  />
                } />
                <Route path="*" element={<Navigate to="/alllistings" replace />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </main>
        
        {/* Login Popup - rendered at app level */}
        {showLoginPopup && (
          <LoginPopup
            onClose={() => setShowLoginPopup(false)}
            darkMode={darkMode}
            closeSidebar={closeSidebar}
          />
        )}
      </div>
    </>
  );
}


function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
