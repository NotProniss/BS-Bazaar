import React, { useState, useEffect } from 'react';
import posthog from 'posthog-js';

// Components
import Sidebar from './components/Sidebar';
import ListingForm from './components/ListingForm';
import FilterControls from './components/FilterControls';
import Footer from './components/Footer';
import ItemCard from './components/ItemCard';
import AdminDashboard from './AdminDashboard';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useDarkMode } from './hooks/useDarkMode';
import { useListings } from './hooks/useListings';
import { useSocket } from './hooks/useSocket';

// Utils
import { itemData } from './utils/constants';
import { api } from './utils/api';

function App() {
  // Auth state
  const { loggedInUser, loggedInUserId, setLoggedInUser, setLoggedInUserId, logout } = useAuth();
  
  // UI state
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form state
  const [type, setType] = useState("buy");
  const [item, setItem] = useState("");
  const [platinum, setPlatinum] = useState(0);
  const [gold, setGold] = useState(0);
  const [silver, setSilver] = useState(0);
  const [copper, setCopper] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [priceDisplayMode, setPriceDisplayMode] = useState("Each");
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  // Combat fields
  const [combatStrength, setCombatStrength] = useState("");
  const [combatDmgType, setCombatDmgType] = useState("");
  const [combatDmgPercent, setCombatDmgPercent] = useState("");
  const [combatImpact, setCombatImpact] = useState("");
  const [combatCryonae, setCombatCryonae] = useState("");
  const [combatArborae, setCombatArborae] = useState("");
  const [combatTempestae, setCombatTempestae] = useState("");
  const [combatInfernae, setCombatInfernae] = useState("");
  const [combatNecromae, setCombatNecromae] = useState("");
  const [combatLevel, setCombatLevel] = useState("");
  const [combatCategory, setCombatCategory] = useState("");
  const [rarity, setRarity] = useState("");
  
  // Filter state
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("new");
  const [filterType, setFilterType] = useState("all");
  const [episodeFilter, setEpisodeFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Data hooks
  const { listings, setListings, fetchListings, createListing, updateListing, deleteListing } = useListings();
  
  // Socket connection
  useSocket(setListings);

  // Live timestamp updates
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(v => v + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize PostHog analytics
  useEffect(() => {
    posthog.init('phc_vV4HuQIzRQreNNyewhxX8q7HN63wdfccHJHxTiXSRUm', {
      api_host: window.location.origin + '/ingest',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true, // Disable session recording for better performance
      autocapture: false, // Disable autocapture to avoid script loading issues
      cross_subdomain_cookie: false,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded successfully');
        }
      },
      // Handle config loading errors gracefully
      on_request_error: (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('PostHog request error (expected in dev):', error);
        }
      }
    });
  }, []);

  // Fetch listings and handle auth on mount
  useEffect(() => {
    fetchListings();

    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setLoggedInUser(payload.username);
        setLoggedInUserId(payload.id);
        
        // Identify user in PostHog
        posthog.identify(payload.id.toString(), {
          username: payload.username,
          discord_id: payload.id
        });
      } catch (err) {
        localStorage.removeItem("jwtToken");
        setLoggedInUser(null);
        setLoggedInUserId(null);
      }
    }
  }, [fetchListings, setLoggedInUser, setLoggedInUserId]);

  // Check admin status
  useEffect(() => {
    if (loggedInUserId) {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        api.checkAdminStatus(token)
          .then(isAdminUser => setIsAdmin(isAdminUser))
          .catch(() => setIsAdmin(false));
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [loggedInUserId]);

  const resetForm = () => {
    setItem("");
    setPlatinum(0);
    setGold(0);
    setSilver(0);
    setCopper(0);
    setQuantity("");
    setContactInfo("");
    setType("buy");
    setEditingId(null);
    setCombatStrength("");
    setCombatDmgType("");
    setCombatDmgPercent("");
    setCombatImpact("");
    setCombatCryonae("");
    setCombatArborae("");
    setCombatTempestae("");
    setCombatInfernae("");
    setCombatNecromae("");
    setCombatLevel("");
    setCombatCategory("");
    setRarity("");
  };

  const handleCancel = () => {
    resetForm();
    setFormError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (totalCopper) => {
    setFormError("");
    setSuccessMessage("");
    
    if (!item) {
      setFormError("Please select an item.");
      return;
    }
    if (!quantity || Number(quantity) < 1) {
      setFormError("Please enter a valid quantity (at least 1).");
      return;
    }

    // Calculate price to send
    let priceToSend = totalCopper;
    if (priceDisplayMode === 'Total' && quantity && Number(quantity) > 0) {
      priceToSend = Math.floor(totalCopper / Number(quantity));
    }

    const listingData = {
      item,
      price: priceToSend,
      quantity: Number(quantity),
      seller: loggedInUser,
      type,
      contactInfo,
      priceMode: priceDisplayMode,
      combatCategory: combatCategory || undefined,
      combatLevel: combatLevel || undefined,
      combatStrength: combatStrength || undefined,
      combatDmgType: combatDmgType || undefined,
      combatDmgPercent: combatDmgPercent || undefined,
      combatImpact: combatImpact || undefined,
      combatCryonae: combatCryonae || undefined,
      combatArborae: combatArborae || undefined,
      combatTempestae: combatTempestae || undefined,
      combatInfernae: combatInfernae || undefined,
      combatNecromae: combatNecromae || undefined,
      rarity: rarity || undefined,
    };

    try {
      if (editingId) {
        await updateListing(editingId, listingData);
        posthog.capture('listing_updated', {
          item,
          type,
          price: priceToSend,
          quantity: Number(quantity),
          combatCategory
        });
      } else {
        await createListing(listingData);
        posthog.capture('listing_created', {
          item,
          type,
          price: priceToSend,
          quantity: Number(quantity),
          combatCategory
        });
      }
      
      setSuccessMessage("Success!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      resetForm();
      setActiveTab("all");
      fetchListings();
    } catch (err) {
      console.error("Error saving listing:", err);
      if (err.response) {
        setFormError(`Failed to save listing: ${err.response.data?.error || 'Unknown error'}`);
      } else {
        setFormError("Failed to save listing");
      }
    }
  };

  const startEditing = (listing) => {
    setItem(listing.item || "");
    setQuantity(listing.quantity || "");
    setType(listing.type || "buy");
    setContactInfo(listing.contactInfo || "");

    const price = listing.price || 0;
    setPlatinum(Math.floor(price / 1000000000));
    setGold(Math.floor((price % 1000000000) / 1000000));
    setSilver(Math.floor((price % 1000000) / 1000));
    setCopper(price % 1000);

    setPriceDisplayMode(listing.priceMode || "Each");

    setCombatCategory(listing.combatCategory || "");
    setCombatLevel(listing.combatLevel || "");
    setCombatStrength(listing.combatStrength || "");
    setCombatDmgType(listing.combatDmgType || "");
    setCombatDmgPercent(listing.combatDmgPercent || "");
    setCombatImpact(listing.combatImpact || "");
    setCombatCryonae(listing.combatCryonae || "");
    setCombatArborae(listing.combatArborae || "");
    setCombatTempestae(listing.combatTempestae || "");
    setCombatInfernae(listing.combatInfernae || "");
    setCombatNecromae(listing.combatNecromae || "");
    setRarity(listing.rarity || "");

    setEditingId(listing.id);
    setActiveTab("post");
  };

  // Filter and sort listings
  const safeListings = Array.isArray(listings) ? listings : [];
  const filteredListings = safeListings
    .filter(
      (listing) =>
        listing.item.toLowerCase().includes(search.toLowerCase()) &&
        (filterType === "all" || listing.type === filterType) &&
        (episodeFilter === "all" || (itemData.find(i => i.Items === listing.item)?.Episode === episodeFilter)) &&
        (professionFilter === "all" || [
          itemData.find(i => i.Items === listing.item)?.["Profession A"],
          itemData.find(i => i.Items === listing.item)?.["Profession B"]
        ].includes(professionFilter))
    )
    .sort((a, b) => {
      if (sortOrder === "new") {
        // Sort by time: newest first
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return bTime - aTime;
      } else if (sortOrder === "old") {
        // Sort by time: oldest first
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return aTime - bTime;
      } else if (sortOrder === "asc") {
        // Sort by each price: low to high (with time as secondary)
        const priceComparison = a.price - b.price;
        if (priceComparison !== 0) return priceComparison;
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return bTime - aTime;
      } else if (sortOrder === "desc") {
        // Sort by each price: high to low (with time as secondary)
        const priceComparison = b.price - a.price;
        if (priceComparison !== 0) return priceComparison;
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return bTime - aTime;
      } else if (sortOrder === "total-asc") {
        // Sort by total price: low to high (with time as secondary)
        const aTotalPrice = a.price * a.quantity;
        const bTotalPrice = b.price * b.quantity;
        const priceComparison = aTotalPrice - bTotalPrice;
        if (priceComparison !== 0) return priceComparison;
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return bTime - aTime;
      } else if (sortOrder === "total-desc") {
        // Sort by total price: high to low (with time as secondary)
        const aTotalPrice = a.price * a.quantity;
        const bTotalPrice = b.price * b.quantity;
        const priceComparison = bTotalPrice - aTotalPrice;
        if (priceComparison !== 0) return priceComparison;
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return bTime - aTime;
      }
      return 0;
    });

  return (
    <div 
      className={`h-screen overflow-hidden ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
      style={{ height: '100vh', margin: 0, padding: 0 }}
    >
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loggedInUser={loggedInUser}
        logout={logout}
        isAdmin={isAdmin}
      />
      
      <main 
        className="h-screen overflow-y-auto flex flex-col" 
        style={{ 
          marginLeft: '220px', 
          paddingTop: '1.5rem', 
          paddingLeft: '1.5rem', 
          paddingRight: '1.5rem', 
          paddingBottom: '5rem' 
        }}
      >
        {activeTab === "post" && loggedInUser ? (
          <>
            <ListingForm
              item={item} setItem={setItem}
              type={type} setType={setType}
              platinum={platinum} setPlatinum={setPlatinum}
              gold={gold} setGold={setGold}
              silver={silver} setSilver={setSilver}
              copper={copper} setCopper={setCopper}
              quantity={quantity} setQuantity={setQuantity}
              contactInfo={contactInfo} setContactInfo={setContactInfo}
              priceDisplayMode={priceDisplayMode} setPriceDisplayMode={setPriceDisplayMode}
              combatStrength={combatStrength} setCombatStrength={setCombatStrength}
              combatDmgType={combatDmgType} setCombatDmgType={setCombatDmgType}
              combatDmgPercent={combatDmgPercent} setCombatDmgPercent={setCombatDmgPercent}
              combatImpact={combatImpact} setCombatImpact={setCombatImpact}
              combatCryonae={combatCryonae} setCombatCryonae={setCombatCryonae}
              combatArborae={combatArborae} setCombatArborae={setCombatArborae}
              combatTempestae={combatTempestae} setCombatTempestae={setCombatTempestae}
              combatInfernae={combatInfernae} setCombatInfernae={setCombatInfernae}
              combatNecromae={combatNecromae} setCombatNecromae={setCombatNecromae}
              combatLevel={combatLevel} setCombatLevel={setCombatLevel}
              combatCategory={combatCategory} setCombatCategory={setCombatCategory}
              rarity={rarity} setRarity={setRarity}
              editingId={editingId}
              formError={formError}
              successMessage={successMessage}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loggedInUser={loggedInUser}
            />
            
            <ItemCard
              item={item}
              type={type}
              platinum={platinum}
              gold={gold}
              silver={silver}
              copper={copper}
              quantity={quantity}
              contactInfo={contactInfo}
              priceDisplayMode={priceDisplayMode}
              combatCategory={combatCategory}
              combatLevel={combatLevel}
              combatStrength={combatStrength}
              combatDmgType={combatDmgType}
              combatDmgPercent={combatDmgPercent}
              combatImpact={combatImpact}
              combatCryonae={combatCryonae}
              combatArborae={combatArborae}
              combatTempestae={combatTempestae}
              combatInfernae={combatInfernae}
              combatNecromae={combatNecromae}
              rarity={rarity}
              loggedInUser={loggedInUser}
              darkMode={darkMode}
            />
          </>
        ) : activeTab === "admin" && isAdmin ? (
          <AdminDashboard onRefreshListings={fetchListings} />
        ) : (
          <>
            <h2 className="text-4xl font-semibold mb-4 text-center" style={{ fontSize: '2.5rem' }}>
              {activeTab === "my" ? "My Listings" : "Current Listings"}
            </h2>
            
            <FilterControls
              search={search} setSearch={setSearch}
              filterType={filterType} setFilterType={setFilterType}
              sortOrder={sortOrder} setSortOrder={setSortOrder}
              professionFilter={professionFilter} setProfessionFilter={setProfessionFilter}
              episodeFilter={episodeFilter} setEpisodeFilter={setEpisodeFilter}
            />
            
            <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col">
              <ul className="space-y-4 flex-1" style={{ minHeight: 0, paddingBottom: '2rem' }}>
                {filteredListings
                  .filter(listing => activeTab === "all" || (loggedInUser && listing.seller === loggedInUser))
                  .map((listing) => (
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
                      contactInfo={listing.contactInfo}
                      priceDisplayMode={listing.priceMode || "Each"}
                      combatCategory={listing.combatCategory}
                      combatLevel={listing.combatLevel}
                      combatStrength={listing.combatStrength}
                      combatDmgType={listing.combatDmgType}
                      combatDmgPercent={listing.combatDmgPercent}
                      combatImpact={listing.combatImpact}
                      combatCryonae={listing.combatCryonae}
                      combatArborae={listing.combatArborae}
                      combatTempestae={listing.combatTempestae}
                      combatInfernae={listing.combatInfernae}
                      combatNecromae={listing.combatNecromae}
                      rarity={listing.rarity}
                      loggedInUser={loggedInUser}
                      darkMode={darkMode}
                      onEdit={() => startEditing(listing)}
                      onDelete={() => deleteListing(listing.id)}
                      isListing={true}
                      timestamp={listing.createdAt || listing.created_at || listing.timestamp}
                    />
                  ))
                }
              </ul>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
