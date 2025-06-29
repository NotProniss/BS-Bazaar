"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import AdminDashboard from "./AdminDashboard"
import itemDataRaw from "./data/items.json"
import platinumImg from "./assets/Platinum.png"
import goldImg from "./assets/Gold.png"
import silverImg from "./assets/Silver.png"
import copperImg from "./assets/Copper.png"
import episode1Img from "./assets/Hopeport.png"
import episode2Img from "./assets/Hopeforest.png"
import episode3Img from "./assets/Mine_of_Mantuban.png"
import episode4Img from "./assets/Crenopolis.png"
import episode5Img from "./assets/Stonemaw_Hill.png"
import episodeGlobalImg from "./assets/Global.png"
import episodeNoneImg from "./assets/None.png"
import { io } from "socket.io-client"

// Convert to array if imported as object (for compatibility)
const itemData = Array.isArray(itemDataRaw)
  ? itemDataRaw
  : Object.keys(itemDataRaw.results || {}).map((key) => {
      const entry = itemDataRaw.results[key]
      return {
        Items: key,
        Image: entry.printouts?.Image?.[0] || "",
        Wiki: entry.fullurl || ""
      }
    })

// Map episode names to images
const episodeImages = {
  "Hopeport": episode1Img,
  "Hopeforest": episode2Img,
  "Mine of Mantuban": episode3Img,
  "Crenopolis": episode4Img,
  "Stonemaw Hill": episode5Img,
  "Global": episodeGlobalImg,
  "None": episodeNoneImg
}

function App() {
  const [listings, setListings] = useState([])
  const [type, setType] = useState("buy")
  const [item, setItem] = useState("")
  const [platinum, setPlatinum] = useState(0)
  const [gold, setGold] = useState(0)
  const [silver, setSilver] = useState(0)
  const [copper, setCopper] = useState(0)
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "Platinum") setPlatinum(value)
    if (name === "Gold") setGold(value)
    if (name === "Silver") setSilver(value)
    if (name === "Copper") setCopper(value)
  }
  const [quantity, setQuantity] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [timeSortOrder, setTimeSortOrder] = useState("new")
  const [filterType, setFilterType] = useState("all")
  const [editingId, setEditingId] = useState(null)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownSearch, setDropdownSearch] = useState("")
  const [episodeFilter, setEpisodeFilter] = useState("all")
  const [formError, setFormError] = useState("")
  const [priceDisplayMode, setPriceDisplayMode] = useState("Each")
  const [showDiscordLink, setShowDiscordLink] = useState(true)
  const dropdownRef = useRef(null)
  const socketRef = useRef(null)

  // Prefer env variable, else use current protocol and domain
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//bs-bazaar.com`;


  // On mount, load dark mode preference from localStorage
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode")
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === "true")
    } else {
      setDarkMode(true) // Default to dark mode
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", darkMode)
  }, [darkMode])

  function formatPrice(totalCopper) {
    // 1 platinum = 1,000,000,000 copper
    // 1 gold = 1,000,000 copper
    // 1 silver = 1,000 copper
    // 1 copper = 1 copper
    const platinum = Math.floor(totalCopper / 1000000000)
    const gold = Math.floor((totalCopper % 1000000000) / 1000000)
    const silver = Math.floor((totalCopper % 1000000) / 1000)
    const copper = totalCopper % 1000

    const parts = []
    if (platinum) parts.push(
      <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
        {platinum}
        <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    )
    if (gold) parts.push(
      <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
        {gold}
        <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    )
    if (silver) parts.push(
      <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
        {silver}
        <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    )
    if (copper || parts.length === 0) parts.push(
      <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1}}>
        {copper}
        <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '2em', width: '2em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    )
    return <>{parts}</>
  }

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/listings`)
      setListings(res.data)
    } catch (err) {
      console.error("Error fetching listings:", err)
    }
  }

  useEffect(() => {
    fetchListings()

    const token = localStorage.getItem("jwtToken")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setLoggedInUser(payload.username)
      } catch (err) {
        localStorage.removeItem("jwtToken")
        setLoggedInUser(null)
      }
    }
  }, [])

  // Connect to backend Socket.IO server
  useEffect(() => {
    socketRef.current = io(BACKEND_URL)

    // Listen for real-time events
    socketRef.current.on('listingCreated', (newListing) => {
      setListings(prev => [newListing, ...prev.filter(l => l.id !== newListing.id)])
    })
    socketRef.current.on('listingUpdated', (updatedListing) => {
      setListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l))
    })
    socketRef.current.on('listingDeleted', (deletedId) => {
      setListings(prev => prev.filter(l => l.id !== deletedId))
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [BACKEND_URL])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const logout = () => {
    localStorage.removeItem("jwtToken")
    setLoggedInUser(null)
  }

  const resetForm = () => {
    setItem("")
    setPlatinum(0)
    setGold(0)
    setSilver(0)
    setCopper(0)
    setQuantity("")
    setContactInfo("")
    setType("buy")
    setEditingId(null)
    setShowDiscordLink(true)
  }

  const addOrEditListing = async () => {
    setFormError("")
    if (!item) {
      setFormError("Please select an item.")
      return
    }
    if (!quantity || Number(quantity) < 1) {
      setFormError("Please enter a valid quantity (at least 1).")
      return
    }
    const token = localStorage.getItem("jwtToken")
    if (!token) {
      alert("You must be logged in!")
      return
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    // If priceDisplayMode is Total, convert to per-item price
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
      showDiscordLink, // <-- include this in the listing
      priceMode: priceDisplayMode, // <-- store the selected mode
    }

    try {
      if (editingId) {
        await axios.put(`${BACKEND_URL}/listings/${editingId}`, listingData, config)
      } else {
        await axios.post(`${BACKEND_URL}/listings`, listingData, config)
      }
      resetForm()
      fetchListings()
    } catch (err) {
      console.error("Error saving listing:", err)
      alert("Failed to save listing")
    }
  }

  const totalCopper =
    Number.parseInt(platinum || 0) * 1000000000 +
    Number.parseInt(gold || 0) * 1000000 +
    Number.parseInt(silver || 0) * 1000 +
    Number.parseInt(copper || 0)

  const deleteListing = async (id) => {
    const token = localStorage.getItem("jwtToken")
    if (!token) {
      alert("You must be logged in!")
      return
    }

    try {
      await axios.delete(`${BACKEND_URL}/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchListings()
    } catch (err) {
      console.error("Failed to delete listing:", err)
    }
  }

  const startEditing = (listing) => {
    setItem(listing.item)
    setQuantity(listing.quantity)
    setType(listing.type)
    setContactInfo(listing.contactInfo || "")

    // Convert price back to individual currency values
    const price = listing.price
    setPlatinum(Math.floor(price / 1000000000))
    setGold(Math.floor((price % 1000000000) / 1000000))
    setSilver(Math.floor((price % 1000000) / 1000))
    setCopper(price % 1000)

    setEditingId(listing.id)
    setShowDiscordLink(listing.showDiscordLink !== false) // default to true if undefined
  }

  // Defensive: ensure listings is always an array before filtering
  const safeListings = Array.isArray(listings) ? listings : [];
  const filteredListings = safeListings
    .filter(
      (listing) =>
        listing.item.toLowerCase().includes(search.toLowerCase()) &&
        (filterType === "all" || listing.type === filterType) &&
        (episodeFilter === "all" || (itemData.find(i => i.Item === listing.item)?.Episode === episodeFilter))
    )
    .sort((a, b) => {
      // Time sort first if not default
      if (timeSortOrder === 'new') {
        // New to Old
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        if (bTime !== aTime) return bTime - aTime;
      } else if (timeSortOrder === 'old') {
        // Old to New
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        if (aTime !== bTime) return aTime - bTime;
      }
      // Then price sort
      return (sortOrder === "asc" ? a.price - b.price : b.price - a.price);
    })

  const uniqueCategories = ["all", ...new Set(safeListings.map((l) => l.category))]
  // --- Replace episode filter select with custom dropdown ---
  const [episodeDropdownOpen, setEpisodeDropdownOpen] = useState(false);
  const episodeDropdownRef = useRef(null);
  const uniqueEpisodes = [
    "all",
    ...Array.from(new Set(itemData.map(i => i.Episode).filter(Boolean).filter(ep => ep !== "Episode")))
  ];

  // Close episode dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (episodeDropdownRef.current && !episodeDropdownRef.current.contains(event.target)) {
        setEpisodeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to format time ago as HH:MM Ago, supports ms timestamps
  function formatTimeAgo(dateInput) {
    if (!dateInput) return '';
    let created;
    if (typeof dateInput === 'number') {
      created = new Date(dateInput);
    } else if (!isNaN(Number(dateInput))) {
      created = new Date(Number(dateInput));
    } else {
      created = new Date(dateInput);
    }
    if (isNaN(created.getTime())) return '';
    const now = new Date();
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay > 0) {
      return `${diffDay} Day${diffDay > 1 ? 's' : ''} Ago`;
    } else if (diffHour > 0) {
      return `${diffHour} Hour${diffHour > 1 ? 's' : ''} Ago`;
    } else if (diffMin > 0) {
      return `${diffMin} Min${diffMin > 1 ? 's' : ''} Ago`;
    } else {
      return `${diffSec} Second${diffSec !== 1 ? 's' : ''} Ago`;
    }
  }

  // Live update for timestamps
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(v => v + 1);
    }, 1000); // update every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen py-10 px-4 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className={`max-w-3xl mx-auto p-6 rounded-2xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h1 className="text-6xl font-bold text-center mb-6" style={{ fontSize: '4rem' }}>BS Bazaar</h1>

        {!loggedInUser ? (
          <div className="mb-6 text-center">
            <a
              href={`${process.env.REACT_APP_BACKEND_URL || 'https://bs-bazaar.com'}/auth/discord`}
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-2 rounded-full"
            >
              Login with Discord
            </a>

          </div>
        ) : (
          <div className="mb-6 flex justify-between items-center">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 border rounded bg-gray-200 dark:bg-gray-700">
              {darkMode ? "Light" : "Dark"} Mode
            </button>

            <p className="text-gray-700 dark:text-gray-300">
              Welcome, <strong>{loggedInUser}</strong>
            </p>
            <button className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded" onClick={logout}>
              Logout
            </button>
          </div>
        )}

        {loggedInUser && (
          <div className="mb-6 grid gap-3">
            {/* Custom dropdown for item selection with images and search, with buy/sell select to the right */}
            <div className="flex gap-2 items-start">
              <div className="relative flex-1" ref={dropdownRef}>
                <button
                  type="button"
                  className={`w-full border p-2 rounded flex items-center justify-between dark:bg-gray-800 ${!item && formError ? 'border-red-500' : ''} text-black dark:text-white`}
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  {item ? (
                    <span className="flex items-center gap-2">
                      {itemData.find((i) => i.Item === item)?.Image && (
                        <img src={itemData.find((i) => i.Item === item)?.Image} alt={item} className="h-9 w-9 object-contain" />
                      )}
                      {item}
                    </span>
                  ) : (
                    <span className="text-gray-400">Select an item...</span>
                  )}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        className="w-full border p-2 rounded dark:bg-gray-700 text-black dark:text-white"
                        placeholder="Search items..."
                        value={dropdownSearch}
                        onChange={e => setDropdownSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <ul>
                      {itemData.filter(opt =>
                        (opt.Item || "").toLowerCase().includes(dropdownSearch.toLowerCase())
                      ).map((itemOption) => (
                        <li
                          key={itemOption.Item}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${item === itemOption.Item ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                          onClick={() => {
                            setItem(itemOption.Item)
                            setDropdownOpen(false)
                            setDropdownSearch("")
                          }}
                        >
                          {itemOption.Image && (
                            <img src={itemOption.Image} alt={itemOption.Item} className="h-9 w-9 object-contain" />
                          )}
                          <span>{itemOption.Item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <select
                className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white min-w-[90px]"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ marginTop: 0 }}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div className="flex gap-4 mb-4 ">
              <div className="flex items-center gap-2 justify-end">
                <input
                  type="number"
                  name="Platinum"
                  value={platinum === 0 ? "" : platinum}
                  onChange={handleChange}
                  min="0"
                  className="w-full border p-2 rounded dark:bg-gray-800 text-black dark:text-white"
                  placeholder="0"
                />
                <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '30px', width: '30px'}} />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <input
                  type="number"
                  name="Gold"
                  value={gold === 0 ? "" : gold}
                  onChange={handleChange}
                  min="0"
                  className="w-full border p-2 rounded dark:bg-gray-800 text-black dark:text-white"
                  placeholder="0"
                />
                <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '30px', width: '30px'}} />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <input
                  type="number"
                  name="Silver"
                  value={silver === 0 ? "" : silver}
                  onChange={handleChange}
                  min="0"
                  className="w-full border p-2 rounded dark:bg-gray-800 text-black dark:text-white"
                  placeholder="0"
                />
                <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '30px', width: '30px'}} />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <input
                  type="number"
                  name="Copper"
                  value={copper === 0 ? "" : copper}
                  onChange={handleChange}
                  min="0"
                  className="w-full border p-2 rounded dark:bg-gray-800 text-black dark:text-white"
                  placeholder="0"
                />
                <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '30px', width: '30px'}} />
              </div>
              <input
                className={`border p-2 rounded dark:bg-gray-800 text-black dark:text-white min-w-[90px] ${formError && (!quantity || Number(quantity) < 1) ? 'border-red-500' : ''}`}
                placeholder="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ alignSelf: 'center' }}
                min="1"
                required
              />
              {/* Each/Total dropdown for price input mode */}
              <select
                className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white min-w-[90px] max-w-[110px]"
                value={priceDisplayMode}
                onChange={e => setPriceDisplayMode(e.target.value)}
                style={{ minWidth: '90px' }}
              >
                <option value="Each">Each</option>
                <option value="Total">Total</option>
              </select>
            </div>
            <input
              className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white"
              placeholder="Contact info (e.g., Discord, IGN)"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                id="showDiscordLink"
                type="checkbox"
                checked={showDiscordLink}
                onChange={e => setShowDiscordLink(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showDiscordLink" className="text-sm select-none">Show my Discord link in listing</label>
            </div>
            <div className="flex gap-2 justify-center mt-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded text-lg font-bold shadow-lg transition-all duration-150" onClick={addOrEditListing}>
                {editingId ? "Update Listing" : "Post Listing"}
              </button>
              {editingId && (
                <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
            {/* Show error message if needed */}
            {formError && (
              <div className="text-red-600 font-semibold text-center mb-2">{formError}</div>
            )}
          </div>
        )}

        <h2 className="text-4xl font-semibold mb-4 text-center" style={{ fontSize: '2.5rem' }}>Current Listings</h2>
        <div className="w-full max-w-2xl mx-auto flex flex-wrap justify-center items-center gap-4 mb-6">
          <input
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full min-w-[120px] max-w-xs"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full min-w-[120px] max-w-xs"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full min-w-[120px] max-w-xs"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
          {/* Time sort dropdown */}
          <select
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full min-w-[120px] max-w-xs"
            value={timeSortOrder}
            onChange={e => setTimeSortOrder(e.target.value)}
          >
            <option value="new">Time: New to Old</option>
            <option value="old">Time: Old to New</option>
          </select>
          {/* Custom episode filter dropdown with images */}
          <div className="relative w-full min-w-[120px] max-w-xs" ref={episodeDropdownRef}>
            <button
              type="button"
              className="w-full border p-2 rounded flex items-center justify-between dark:bg-gray-800 text-black dark:text-white"
              onClick={() => setEpisodeDropdownOpen(open => !open)}
            >
              {episodeFilter === "all" ? (
                <span className="flex items-center gap-2">All Episodes</span>
              ) : (
                <span className="flex items-center gap-2">
                  {episodeImages[episodeFilter] && (
                    <img src={episodeImages[episodeFilter]} alt={episodeFilter} style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} />
                  )}
                  {episodeFilter}
                </span>
              )}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {episodeDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto">
                <ul>
                  {uniqueEpisodes.map(ep => (
                    <li
                      key={ep}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${episodeFilter === ep ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                      onClick={() => {
                        setEpisodeFilter(ep);
                        setEpisodeDropdownOpen(false);
                      }}
                    >
                      {ep !== "all" && episodeImages[ep] && (
                        <img src={episodeImages[ep]} alt={ep} style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} />
                      )}
                      {ep === "all" ? "All Episodes" : ep}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <ul className="space-y-4 ">
          {filteredListings.map((listing) => (
            <li
              key={listing.id}
              className="bg-gray-50 border rounded-xl p-4 shadow-sm flex justify-between items-start dark:bg-gray-800 text-black dark:text-white relative"
              style={{ minHeight: '140px' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={
                      itemData.find((item) => item.Item === listing.item)?.Image ||
                      "/placeholder.svg?height=32&width=32"
                    }
                    alt={listing.item}
                    className="w-20 h-20 object-contain"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg mb-0">
                        {listing.item} <span className="text-sm text-gray-500">({listing.contactInfo})</span>
                      </p>
                    </div>
                    {/* Episode icon only, no name */}
                    {(() => {
                      const itemInfo = itemData.find(i => i.Item === listing.item);
                      const episode = itemInfo?.Episode;
                      if (episode && episodeImages[episode]) {
                        return (
                          <div className="flex items-center gap-2 mt-1">
                            <img src={episodeImages[episode]} alt={episode} style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  x{listing.quantity} - <span
                    className={`uppercase font-bold ${
                      listing.type.toLowerCase() === "buy"
                        ? "text-green-600"
                        : listing.type.toLowerCase() === "sell"
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {listing.type}
                  </span>
                  <br />
                  {listing.sellerId ? (
                    <span className="flex items-center gap-2">
                      <img
                        src={
                          listing.sellerAvatar
                            ? `https://cdn.discordapp.com/avatars/${listing.sellerId}/${listing.sellerAvatar}.png`
                            : `https://cdn.discordapp.com/embed/avatars/0.png`
                        }
                        alt={listing.seller}
                        className="w-6 h-6 rounded-full object-cover border border-gray-400 dark:border-gray-700"
                        style={{display: 'inline-block'}}
                      />
                      {listing.showDiscordLink === true ? (
                        <a
                          href={`https://discord.com/users/${listing.sellerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          {listing.seller}
                        </a>
                      ) : (
                        <span className="font-semibold text-blue-700">{listing.seller}</span>
                      )}
                    </span>
                  ) : (
                    <span className="font-semibold text-blue-700">{listing.seller}</span>
                  )}
                </p>
              </div>
              <div
                className="flex flex-col items-end gap-2 min-w-[90px] h-full justify-between"
                style={{ position: 'relative', width: 'auto', minWidth: '110px', minHeight: '130px', paddingTop: '2.8em', paddingBottom: '2.8em' }}
              >
                {/* Right-aligned column for Edit/Delete, timestamp, and price */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    width: 'max-content',
                    zIndex: 3,
                    height: '100%',
                    pointerEvents: 'none', // allow buttons to be clickable below
                  }}
                >
                  {/* Edit/Delete buttons */}
                  {loggedInUser === listing.seller && (
                    <div className="flex gap-2 text-sm" style={{ pointerEvents: 'auto', paddingRight: '0.7em' }}>
                      <button className="text-blue-600 hover:underline" onClick={() => startEditing(listing)}>
                        Edit
                      </button>
                      <button className="text-red-600 hover:underline" onClick={() => deleteListing(listing.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                  {/* Timestamp just below Edit/Delete */}
                  {(() => {
                    const dateString = listing.createdAt || listing.created_at || listing.timestamp;
                    if (!dateString) return null;
                    const ago = formatTimeAgo(dateString);
                    return ago ? (
                      <span
                        className="text-xs text-gray-400"
                        style={{
                          background: darkMode ? '#1f2937' : '#f9fafb',
                          padding: '0.2em 0.7em',
                          borderRadius: '0.5em',
                          marginTop: '0.3em',
                          pointerEvents: 'none',
                        }}
                      >
                        {ago}
                      </span>
                    ) : null;
                  })()}
                  {/* Price at the bottom of the column */}
                  <span
                    className="font-semibold text-green-600"
                    style={{
                      background: darkMode ? '#1f2937' : '#f9fafb',
                      padding: '0.25em 0.75em',
                      borderRadius: '0.5em',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      fontSize: '1.1em',
                      display: 'inline-block',
                      minWidth: 'max-content',
                      textAlign: 'right',
                      marginTop: 'auto',
                      marginBottom: 0,
                      zIndex: 2,
                    }}
                  >
                    {/* Price display */}
                    {(() => {
                      let priceToShow = listing.price;
                      let mode = listing.priceMode || 'Each';
                      if (mode === 'Total') priceToShow = listing.price * listing.quantity;
                      const platinum = Math.floor(priceToShow / 1000000000);
                      const gold = Math.floor((priceToShow % 1000000000) / 1000000);
                      const silver = Math.floor((priceToShow % 1000000) / 1000);
                      const copper = priceToShow % 1000;
                      const parts = [];
                      if (platinum) parts.push(
                        <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1em', fontWeight: 600, lineHeight: 1}}>
                          {platinum}
                          <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '1em', width: '1em', marginLeft: '0.25em', marginRight: '0.25em', objectFit: 'contain', flexShrink: 0}} />
                        </span>
                      );
                      if (gold) parts.push(
                        <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1em', fontWeight: 600, lineHeight: 1}}>
                          {gold}
                          <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '1em', width: '1em', marginLeft: '0.25em', marginRight: '0.25em', objectFit: 'contain', flexShrink: 0}} />
                        </span>
                      );
                      if (silver) parts.push(
                        <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1em', fontWeight: 600, lineHeight: 1}}>
                          {silver}
                          <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '1em', width: '1em', marginLeft: '0.25em', marginRight: '0.25em', objectFit: 'contain', flexShrink: 0}} />
                        </span>
                      );
                      if (copper || parts.length === 0) parts.push(
                        <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1em', fontWeight: 600, lineHeight: 1}}>
                          {copper}
                          <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '1em', width: '1em', marginLeft: '0.25em', marginRight: '0.25em', objectFit: 'contain', flexShrink: 0}} />
                        </span>
                      );
                      return <>{parts}</>;
                    })()}
                    <span className="ml-2 text-xs font-normal text-gray-400 align-middle" style={{marginLeft: '0.5em'}}>
                      {listing.priceMode === 'Total' ? 'Total' : 'Each'}
                    </span>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
