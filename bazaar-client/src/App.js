import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AdminDashboard from './AdminDashboard';
import ListingsPage from './pages/alllistings';
import PostPage from './pages/postlistings';
import MyListings from './pages/mylistings';
import TestPage from './pages/test';
import AuthSuccess from './AuthSuccess';
import { jwtDecode } from 'jwt-decode';
function App() {
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
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  const fetchListings = React.useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/listings`);
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
        axios.get(`${BACKEND_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            if (res.data.admins && res.data.admins.some(a => a.id === payload.id || a.id === payload.username)) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          })
          .catch(err => {
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
  };

  const addOrEditListing = async (listing) => {
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

    try {
      if (editingId) {
        await axios.put(`${BACKEND_URL}/listings/${editingId}`, listingData, config);
      } else {
        await axios.post(`${BACKEND_URL}/listings`, listingData, config);
      }
      resetForm();
      fetchListings();
      showToast('Listing saved!', 'success');
    } catch (err) {
      console.error('Error saving listing:', err);
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
    setItem(listing.item);
    const price = listing.price;
    setPlatinum(Math.floor(price / 1000));
    setGold(Math.floor((price % 1000) / 100));
    setSilver(Math.floor((price % 100) / 10));
    setCopper(price % 10);
    setQuantity(listing.quantity);
    setType(listing.type);
    setCategory(listing.category);
    setEditingId(listing.id);
  };

  const filteredListings = listings
    .filter(
      (listing) =>
        listing.item.toLowerCase().includes(search.toLowerCase()) &&
        (filterType === 'all' || listing.type === filterType) &&
        (filterCategory === 'all' || listing.category.toLowerCase() === filterCategory.toLowerCase())
    )
    .sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));

  const uniqueCategories = ['all', ...new Set(listings.map((l) => l.category))];

  // Toast state and component
  const showToast = (message, type = 'info') => {
    // Toast logic is present, but toast state is not used in UI
    setTimeout(() => {}, 2500);
  };

  // Dark mode state and toggle
  const [darkMode, setDarkMode] = useState(true);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <BrowserRouter>
      <div className={`min-h-screen flex flex-row ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}> 
        <div className="w-72 flex-shrink-0">
          <Sidebar
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            loggedInUser={loggedInUser}
            logout={logout}
            isAdmin={isAdmin}
          />
        </div>
        <main className="flex-1 flex flex-col">
          <div className="flex-1 py-10 px-4">
            <div className={darkMode ? "max-w-3xl mx-auto bg-gray-800 p-6 rounded-2xl shadow-lg" : "max-w-3xl mx-auto bg-gray-50 p-6 rounded-2xl shadow-lg"}>
              {/* Header removed from main area. Now only in sidebar. */}
              {/* ...existing code... */}
              <Routes>
                <Route path="/auth-success" element={<AuthSuccess />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/" element={<Navigate to="/alllistings" replace />} />
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
                <Route path="/mylistings" element={
                  <MyListings
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
                <Route path="/adminpanel" element={<AdminDashboard onRefreshListings={fetchListings} />} />
                <Route path="*" element={<Navigate to="/alllistings" replace />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
