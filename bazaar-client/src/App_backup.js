"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import axios from "axios"
import posthog from 'posthog-js'
import AdminDashboard from "./AdminDashboard"

// Image imports
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
import profAlchemistImg from "./assets/Alchemist.png"
import profBlacksmithImg from "./assets/Blacksmith.png"
import profArmorerImg from "./assets/Armorer.png"
import profBonewrightImg from "./assets/Bonewright.png"
import profBuilderImg from "./assets/Builder.png"
import profCarpenterImg from "./assets/Carpenter.png"
import profChefImg from "./assets/Chef.png"
import profCombatImg from "./assets/Combat.png"
import profDelverImg from './assets/Delver.png'
import profDetectiveImg from "./assets/Detective.png"
import profFisherImg from "./assets/Fisher.png"
import profForagerImg from "./assets/Forager.png"
import profGatherer from "./assets/Gatherer.png"
import profLeatherworkerImg from "./assets/Leatherworker.png"
import profMerchantImg from "./assets/Merchant.png"
import profMinerImg from "./assets/Miner.png"
import profStonemasonImg from "./assets/Stonemason.png"
import profWoodcutterImg from "./assets/Woodcutter.png"
import profCryoknightImg from "./assets/Cryoknight.png"
import profGuardianImg from "./assets/Guardian.png"
import profHammermageImg from "./assets/Hammermage.png"

import { io } from "socket.io-client"

// Inject styles into the document head
// Use the imported item data directly (it's already an array with correct structure)
const itemData = itemDataRaw

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

// Map profession names to images
const professionImages = {
  "Alchemist": profAlchemistImg,
  "Blacksmith": profBlacksmithImg,
  "Armorer": profArmorerImg,
  "Bonewright": profBonewrightImg,
  "Builder": profBuilderImg,
  "Carpenter": profCarpenterImg,
  "Chef": profChefImg,
  "Combat": profCombatImg,
  "Delver": profDelverImg,
  "Detective": profDetectiveImg,
  "Fisher": profFisherImg,
  "Forager": profForagerImg,
  "Gatherer": profGatherer,
  "Leatherworker": profLeatherworkerImg,
  "Merchant": profMerchantImg,
  "Miner": profMinerImg,
  "Stonemason": profStonemasonImg,
  "Woodcutter": profWoodcutterImg,
  "Cryoknight": profCryoknightImg,
  "Guardian": profGuardianImg,
  "Hammermage": profHammermageImg
}

// Dmg Type images
const dmgTypeImages = {
  Impact: require("./assets/Impact.png"),
  Cryonae: require("./assets/Cryonae.png"),
  Arborae: require("./assets/Arborae.png"),
  Tempestae: require("./assets/Tempestae.png"),
  Infernae: require("./assets/Infernae.png"),
  Necromae: require("./assets/Necromae.png"),
};

function App() {
  const [listings, setListings] = useState([])
  const [type, setType] = useState("buy")
  const [item, setItem] = useState("")
  const [platinum, setPlatinum] = useState(0)
  const [gold, setGold] = useState(0)
  const [silver, setSilver] = useState(0)
  const [copper, setCopper] = useState(0)
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow positive numbers and max 3 digits
    let cleanValue = value.replace(/[^\d]/g, '').slice(0, 3);
    if (cleanValue === "") cleanValue = "0";
    cleanValue = Math.max(0, Math.min(999, Number(cleanValue))).toString();
    if (name === "Platinum") setPlatinum(cleanValue);
    if (name === "Gold") setGold(cleanValue);
    if (name === "Silver") setSilver(cleanValue);
    if (name === "Copper") setCopper(cleanValue);
  }
  const [quantity, setQuantity] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [timeSortOrder, setTimeSortOrder] = useState("new")
  const [filterType, setFilterType] = useState("all")
  const [editingId, setEditingId] = useState(null)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [loggedInUserId, setLoggedInUserId] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownSearch, setDropdownSearch] = useState("")
  const [episodeFilter, setEpisodeFilter] = useState("all")
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [priceDisplayMode, setPriceDisplayMode] = useState("Each")
  const [professionFilter, setProfessionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all"); // "all", "my", or "post"
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
  const [isAdmin, setIsAdmin] = useState(false);
  
  const dropdownRef = useRef(null)
  const socketRef = useRef(null)

  // Prefer env variable, else use current protocol and domain
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";


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

  // Initialize PostHog analytics
  useEffect(() => {
    posthog.init('phc_vV4HuQIzRQreNNyewhxX8q7HN63wdfccHJHxTiXSRUm', {
      api_host: window.location.origin + '/ingest',
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      capture_pageview: true,
      capture_pageleave: true
    })
  }, [])

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

  const fetchListings = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/listings`)
      setListings(res.data)
    } catch (err) {
      console.error("Error fetching listings:", err)
    }
  }, [BACKEND_URL])

  useEffect(() => {
    fetchListings()

    const token = localStorage.getItem("jwtToken")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setLoggedInUser(payload.username)
        setLoggedInUserId(payload.id) // Store Discord ID
        
        // Identify user in PostHog
        posthog.identify(payload.id.toString(), {
          username: payload.username,
          discord_id: payload.id
        })
      } catch (err) {
        localStorage.removeItem("jwtToken")
        setLoggedInUser(null)
        setLoggedInUserId(null)
      }
    }
  }, [fetchListings])

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
  }

  const addOrEditListing = async () => {
    setFormError("")
    setSuccessMessage("")
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
    }

    try {
      let response;
      if (editingId) {
        response = await axios.put(`${BACKEND_URL}/listings/${editingId}`, listingData, config)
        // Track listing update
        posthog.capture('listing_updated', {
          item: item,
          type: type,
          price: priceToSend,
          quantity: Number(quantity),
          combatCategory: combatCategory
        })
      } else {
        response = await axios.post(`${BACKEND_URL}/listings`, listingData, config)
        // Track new listing creation
        posthog.capture('listing_created', {
          item: item,
          type: type,
          price: priceToSend,
          quantity: Number(quantity),
          combatCategory: combatCategory
        })
      }
      
      // Show success message
      setSuccessMessage("Success!");
      setTimeout(() => setSuccessMessage(""), 3000); // Clear after 3 seconds
      
      // Reset form and switch to all listings tab
      resetForm();
      setActiveTab("all");
      
      // Fetch updated listings
      fetchListings();
    } catch (err) {
      console.error("Error saving listing:", err)
      if (err.response) {
        console.error("Response data:", err.response.data)
        console.error("Response status:", err.response.status)
        alert(`Failed to save listing: ${err.response.data?.error || 'Unknown error'}`)
      } else {
        alert("Failed to save listing")
      }
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
    // Populate basic fields
    setItem(listing.item || "")
    setQuantity(listing.quantity || "")
    setType(listing.type || "buy")
    setContactInfo(listing.contactInfo || "")

    // Convert price back to individual currency values
    const price = listing.price || 0
    setPlatinum(Math.floor(price / 1000000000))
    setGold(Math.floor((price % 1000000000) / 1000000))
    setSilver(Math.floor((price % 1000000) / 1000))
    setCopper(price % 1000)

    // Set price display mode if available
    setPriceDisplayMode(listing.priceMode || "Each")

    // Populate ALL combat-related fields that exist in the listing
    setCombatCategory(listing.combatCategory || "")
    setCombatLevel(listing.combatLevel || "")
    setCombatStrength(listing.combatStrength || "")
    setCombatDmgType(listing.combatDmgType || "")
    setCombatDmgPercent(listing.combatDmgPercent || "")
    setCombatImpact(listing.combatImpact || "")
    setCombatCryonae(listing.combatCryonae || "")
    setCombatArborae(listing.combatArborae || "")
    setCombatTempestae(listing.combatTempestae || "")
    setCombatInfernae(listing.combatInfernae || "")
    setCombatNecromae(listing.combatNecromae || "")

    setEditingId(listing.id)
    
    // Switch to the post tab so user can see and modify the form
    setActiveTab("post")
  }

  // Defensive: ensure listings is always an array before filtering
  const safeListings = Array.isArray(listings) ? listings : [];
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

  // --- Profession filter custom dropdown ---
  const [professionDropdownOpen, setProfessionDropdownOpen] = useState(false);
  const professionDropdownRef = useRef(null);

  // Close profession dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (professionDropdownRef.current && !professionDropdownRef.current.contains(event.target)) {
        setProfessionDropdownOpen(false);
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
      // If price sort is selected, sort only by price
      if (sortOrder !== "none") {
        if (sortOrder === "asc") {
          // Each price: low to high
          return a.price - b.price;
        } else if (sortOrder === "desc") {
          // Each price: high to low
          return b.price - a.price;
        } else if (sortOrder === "total-asc") {
          // Total price: low to high
          const aTotalPrice = a.price * a.quantity;
          const bTotalPrice = b.price * b.quantity;
          return aTotalPrice - bTotalPrice;
        } else if (sortOrder === "total-desc") {
          // Total price: high to low
          const aTotalPrice = a.price * a.quantity;
          const bTotalPrice = b.price * b.quantity;
          return bTotalPrice - aTotalPrice;
        }
      }
      // Otherwise, sort by time
      if (timeSortOrder === 'new') {
        // New to Old
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return bTime - aTime;
      } else if (timeSortOrder === 'old') {
        // Old to New
        const aTime = a.createdAt || a.created_at || a.timestamp || 0;
        const bTime = b.createdAt || b.created_at || b.timestamp || 0;
        return aTime - bTime;
      }
      return 0;
    })

  // Profession filter state
  const uniqueProfessions = [
    "all",
    ...Array.from(new Set(
      itemData
        .flatMap(i => [i["Profession A"], i["Profession B"]])
        .filter(p =>
          p &&
          p !== "None" &&
          !p.includes("(Legacy)") &&
          !["Hopeport", "Hopeforest", "Mine of Mantuban", "Crenopolis", "Stonemaw Hill",
            "Blacksmith and Stonemason", "Stonemason and Bonewright", "Blacksmith, Stonemason, and Bonewright"
          ].includes(p)
        )
    ))
  ];

  // After user login, check if user is admin
  useEffect(() => {
    if (loggedInUserId) {
      // Check admin status from backend using Discord ID
      const token = localStorage.getItem("jwtToken");
      if (token) {
        fetch(`${BACKEND_URL}/is-admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(res => res.json())
          .then(data => setIsAdmin(data.isAdmin === true))
          .catch(() => setIsAdmin(false));
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [loggedInUserId, BACKEND_URL]);

  const [dmgTypeDropdownOpen, setDmgTypeDropdownOpen] = useState(false);

  return (
    <div className={`h-screen overflow-hidden ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
      style={{ height: '100vh', margin: 0, padding: 0 }}>
      {/* Sidebar - fixed to the left, full height */}
      <aside className={`fixed top-0 left-0 flex flex-col items-start gap-4 p-6 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg min-w-[220px] h-screen overflow-hidden z-40`} style={{ borderTopRightRadius: '2rem', borderBottomRightRadius: '2rem', width: '220px' }}>
        <h1 className="text-3xl font-bold mb-4" style={{ fontSize: '2.2rem' }}>BS Bazaar</h1>
        {/* Welcome message at the top */}
        {loggedInUser && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 text-center w-full">
            Welcome, <strong>{loggedInUser}</strong>
          </p>
        )}
        {/* Subtitle */}
        <p className="text-xs text-indigo-400 dark:text-indigo-300 font-semibold mb-4 text-center w-full" style={{letterSpacing: '0.05em'}}>
          Beta 0.2
        </p>
        
        {/* Light/Dark mode toggle - moved to top */}
        <button onClick={() => setDarkMode(!darkMode) } className="w-full p-2 border rounded bg-gray-200 dark:bg-gray-700 mb-4">
          {darkMode ? "Light" : "Dark"} Mode
        </button>
        
        {/* Navigation tabs */}
        {loggedInUser && (
          <button
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${activeTab === "post" ? "bg-indigo-600 text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
            onClick={() => {
              setActiveTab("post")
              posthog.capture('tab_clicked', { tab: 'post' })
            }}
          >
            Post Listing
          </button>
        )}
        <button
          className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${activeTab === "all" ? "bg-indigo-600 text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => {
            setActiveTab("all")
            posthog.capture('tab_clicked', { tab: 'all' })
          }}
        >
          All Listings
        </button>
        {loggedInUser && (
          <button
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${activeTab === "my" ? "bg-indigo-600 text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
            onClick={() => {
              setActiveTab("my")
              posthog.capture('tab_clicked', { tab: 'my' })
            }}
          >
            My Listings
          </button>
        )}
        {isAdmin && (
          <button
            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition ${activeTab === "admin" ? "bg-indigo-600 text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"}`}
            onClick={() => setActiveTab("admin")}
          >
            Admin Panel
          </button>
        )}
        <div className="mt-auto w-full flex flex-col gap-3 mb-16"> {/* Increased bottom margin for footer clearance */}
          {/* External links in 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Wrevo button */}
            <a
              href="https://wrevo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium text-xs text-center hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              Wrevo
            </a>
            {/* Trading Discord button */}
            <a
              href="https://discord.gg/KMSFvwFPY2"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium text-xs text-center hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
            >
              Discord
            </a>
            {/* Bugs/Feedback button */}
            <a
              href="https://discord.gg/twZYqBSG5x"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-medium text-xs text-center hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
            >
              Feedback
            </a>
            {/* Wiki button */}
            <a
              href="https://brightershoreswiki.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium text-xs text-center hover:bg-green-200 dark:hover:bg-green-800 transition"
            >
              Wiki
            </a>
          </div>
          {loggedInUser ? (
            <button className="w-full bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded" onClick={logout}>
              Logout
            </button>
          ) : (
            <a
              href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/auth/discord`}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded text-center block"
            >
              Login with Discord
            </a>
          )}
        </div>
      </aside>
      {/* Main content - margin left for sidebar */}
      <main className="h-screen overflow-y-auto flex flex-col" style={{ marginLeft: '220px', paddingTop: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '5rem' }}> {/* Increased bottom padding for footer clearance */}
        {activeTab === "post" && loggedInUser ? (
          <>
            {/* Listing form only */}
            <div className="mb-6 grid gap-3 max-w-4xl mx-auto">
            {/* Custom dropdown for item selection with images and search, with buy/sell select to the right */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Item</label>
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-[120px] max-w-xs" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`w-full border p-2 rounded flex items-center justify-between dark:bg-gray-800 ${!item && formError ? 'border-red-500' : ''} text-black dark:text-white`}
                    onClick={() => setDropdownOpen(open => !open)}
                  >
                    {item ? (
                      <span className="flex items-center gap-2">
                        {itemData.find((i) => i.Items === item)?.Image && (
                          <img src={itemData.find((i) => i.Items === item)?.Image} alt={item} className="h-7 w-7 object-contain" />
                        )}
                        {item}
                      </span>
                    ) : (
                      <span className="text-gray-400">Select an item...</span>
                    )
                    }
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
                          (opt.Items || "").toLowerCase().includes(dropdownSearch.toLowerCase())
                        ).map((itemOption) => (
                          <li
                            key={itemOption.Items}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${item === itemOption.Items ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                            onClick={() => {
                              setItem(itemOption.Items)
                              setDropdownOpen(false)
                              setDropdownSearch("")
                            }}
                          >
                            {itemOption.Image && (
                              <img src={itemOption.Image} alt={itemOption.Items} className="h-7 w-7 object-contain" />
                            )}
                            <span>{itemOption.Items}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="relative flex-1 min-w-[120px] max-w-xs">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Price mode dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Price Mode</label>
              <select
                value={priceDisplayMode}
                onChange={e => setPriceDisplayMode(e.target.value)}
                className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full max-w-xs"
              >
                <option value="Each">Each</option>
                <option value="Total">Total</option>
              </select>
            </div>
            {/* Currency inputs with images to the right */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="number"
                  value={platinum === "0" ? "" : platinum}
                  onChange={handleChange}
                  name="Platinum"
                  className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
                  placeholder="0"
                  min="0"
                  max="999"
                />
                <img src={platinumImg || "/placeholder.svg"} alt="Platinum" className="h-7 w-7 ml-2 object-contain" />
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  value={gold === "0" ? "" : gold}
                  onChange={handleChange}
                  name="Gold"
                  className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
                  placeholder="0"
                  min="0"
                  max="999"
                />
                <img src={goldImg || "/placeholder.svg"} alt="Gold" className="h-7 w-7 ml-2 object-contain" />
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  value={silver === "0" ? "" : silver}
                  onChange={handleChange}
                  name="Silver"
                  className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
                  placeholder="0"
                  min="0"
                  max="999"
                />
                <img src={silverImg || "/placeholder.svg"} alt="Silver" className="h-7 w-7 ml-2 object-contain" />
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  value={copper === "0" ? "" : copper}
                  onChange={handleChange}
                  name="Copper"
                  className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
                  placeholder="0"
                  min="0"
                  max="999"
                />
                <img src={copperImg || "/placeholder.svg"} alt="Copper" className="h-7 w-7 ml-2 object-contain" />
              </div>
            </div>
            {/* Combat-only fields, separated by Weapon and Armor, with category selection */}
            {(() => {
              const selected = itemData.find(i => i.Items === item);
              const isCombat = selected && (selected["Profession A"] === "Combat" || selected["Profession B"] === "Combat");
              if (!isCombat) return null;
              return (
                <>
                  {/* Combat Category and Combat Level side by side */}
                  <div className="mb-2 mt-2 flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Combat Category</label>
                      <select
                        value={combatCategory}
                        onChange={e => setCombatCategory(e.target.value)}
                        className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full max-w-xs"
                      >
                        <option value="">Select Category...</option>
                        <option value="Weapon">Weapon</option>
                        <option value="Armor">Armor</option>
                      </select>
                    </div>
                    <div className="flex-1 max-w-xs">
                      <label className="block text-sm font-medium mb-1">Combat Level</label>
                      <input type="text" value={combatLevel} onChange={e => setCombatLevel(e.target.value)} className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" placeholder="Combat Level" />
                    </div>
                  </div>
                  {combatCategory === "Weapon" && (
                    <>
                      <div className="mb-2 mt-2 text-lg font-semibold text-indigo-500">Weapon</div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                            <img src={require("./assets/Strength.png")} alt="Strength" className="h-5 w-5 object-contain" />
                            Strength
                          </label>
                          <input type="text" value={combatStrength} onChange={e => setCombatStrength(e.target.value)} className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" placeholder="Strength" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Dmg Type</label>
                          {/* Custom dropdown for Dmg Type with images */}
                          <div className="relative">
                            <button
                              type="button"
                              className={`w-full border p-2 rounded flex items-center justify-between dark:bg-gray-800 text-black dark:text-white ${!combatDmgType && formError ? 'border-red-500' : ''}`}
                              onClick={() => setDmgTypeDropdownOpen(open => !open)}
                            >
                              {combatDmgType ? (
                                <span className="flex items-center gap-2">
                                  {dmgTypeImages[combatDmgType] && (
                                    <img src={dmgTypeImages[combatDmgType]} alt={combatDmgType} className="h-7 w-7 object-contain" />
                                  )}
                                  {combatDmgType}
                                </span>
                              ) : (
                                <span className="text-gray-400">Select Dmg Type...</span>
                              )}
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {dmgTypeDropdownOpen && (
                              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto">
                                <ul>
                                  {["Impact", "Cryonae", "Arborae", "Tempestae", "Infernae", "Necromae"].map(type => (
                                    <li
                                      key={type}
                                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${combatDmgType === type ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                                      onClick={() => {
                                        setCombatDmgType(type);
                                        setDmgTypeDropdownOpen(false);
                                      }}
                                    >
                                      {dmgTypeImages[type] && (
                                        <img src={dmgTypeImages[type]} alt={type} className="h-7 w-7 object-contain" />
                                      )}
                                      <span>{type}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Dmg %</label>
                          <input type="text" value={combatDmgPercent} onChange={e => setCombatDmgPercent(e.target.value)} className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" placeholder="Dmg %" />
                        </div>
                      </div>
                    </>
                  )}
                  {combatCategory === "Armor" && (
                    <>
                      <div className="mb-2 mt-2 text-lg font-semibold text-indigo-500">Armor</div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {["Impact", "Cryonae", "Arborae", "Tempestae", "Infernae", "Necromae"].map(type => {
                          let value = '';
                          let setter = () => {};
                          if (type === "Impact") { value = combatImpact; setter = setCombatImpact; }
                          if (type === "Cryonae") { value = combatCryonae; setter = setCombatCryonae; }
                          if (type === "Arborae") { value = combatArborae; setter = setCombatArborae; }
                          if (type === "Tempestae") { value = combatTempestae; setter = setCombatTempestae; }
                          if (type === "Infernae") { value = combatInfernae; setter = setCombatInfernae; }
                          if (type === "Necromae") { value = combatNecromae; setter = setCombatNecromae; }
                          return (
                            <div key={type}>
                              <label className="block text-sm font-medium mb-1">{type}</label>
                              <div className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full flex items-center">
                                <img src={dmgTypeImages[type]} alt={type} title={type} className="h-7 w-7 object-contain mr-2" />
                                <input
                                  type="text"
                                  value={value}
                                  onChange={e => setter(e.target.value)}
                                  className="flex-1 bg-transparent outline-none border-none text-black dark:text-white"
                                  placeholder="-"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
            {/* Quantity and IGN */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IGN</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
                  placeholder="In Game Name"
                />
              </div>
            </div>
            {/* Error message */}
            {formError && (
              <div className="text-red-500 text-sm mb-4">
                {formError}
              </div>
            )}
            {/* Success message */}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 animate-pulse">
                {successMessage}
              </div>
            )}
            {/* Submit button */}
            <div className="flex">
              <button
                onClick={addOrEditListing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded"
              >
                {editingId ? "Update Listing" : "Post Listing"}
              </button>
            </div>
          </div>
          {/* Preview section - moved outside form to match listings layout */}
          {item && (
            <>
              <h3 className="text-lg font-semibold mb-3 text-center mt-8">Preview</h3>
              <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col">
                <ul className="space-y-4 flex-1" style={{ minHeight: 0, paddingBottom: '2rem' }}>
                  {(() => {
                    const itemInfo = itemData.find(i => i.Items === item);
                    const isCombat = itemInfo && (itemInfo["Profession A"] === "Combat" || itemInfo["Profession B"] === "Combat");
              
              // Shared components for the preview card
              const ItemImage = () => (
                <img
                  src={itemInfo?.Image || "/placeholder.svg?height=32&width=32"}
                  alt={item}
                  className="w-20 h-20 object-contain flex-shrink-0"
                />
              );
              
              const ItemTitle = () => (
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-lg mb-0 truncate">
                    {item} <span className="text-sm text-gray-500">({contactInfo || "IGN"})</span>
                  </p>
                </div>
              );
              
              const QuantityTypeUser = () => (
                <div className="text-xs text-gray-700 dark:text-gray-300 text-center">
                  <div>x{quantity || 1}</div>
                  <div className={`uppercase font-bold ${
                    type?.toLowerCase() === "buy"
                      ? "text-green-600"
                      : type?.toLowerCase() === "sell"
                      ? "text-red-600"
                      : ""
                  }`}>
                    {type}
                  </div>
                  <div className="font-semibold text-blue-700">{loggedInUser}</div>
                </div>
              );

              // ===============================================
              // ARMOR PREVIEW CARD
              // ===============================================
              if (isCombat && combatCategory === "Armor") {
                return (
                  <li className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4" style={{ minHeight: '160px' }}>
                      <div className="flex flex-row gap-4 flex-1 min-w-0 items-start">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <ItemImage />
                          <QuantityTypeUser />
                        </div>
                        <div className="flex flex-col justify-start min-w-0 flex-1">
                          <ItemTitle />
                          {/* Show combat level for armor cards - icon and number in a bordered box */}
                          <div className="mt-1 mb-2">
                            <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                              {(() => {
                                const profA = itemInfo?.["Profession A"];
                                const profB = itemInfo?.["Profession B"];
                                const combatProf = profA === "Combat" ? profA : (profB === "Combat" ? profB : null);
                                return combatProf && professionImages[combatProf] ? (
                                  <img src={professionImages[combatProf]} alt={combatProf} className="h-4 w-4 object-contain flex-shrink-0" />
                                ) : null;
                              })()}
                              <span className="font-semibold text-sm">{combatLevel || "-"}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            {/* Resistance Stats only */}
                            <div className="grid grid-cols-3 gap-2 max-w-lg">
                              {['Impact', 'Cryonae', 'Arborae', 'Tempestae', 'Infernae', 'Necromae'].map(type => (
                                <div key={type} className="flex items-center border p-2 rounded dark:bg-gray-800 text-black dark:text-white justify-center min-w-[100px]" style={{fontSize: '0.9em', minHeight: '3rem'}}>
                                  <img src={dmgTypeImages[type]} alt={type} title={type} className="h-4 w-4 object-contain flex-shrink-0 mr-2" />
                                  <span className="font-bold text-sm whitespace-nowrap">{
                                    type === "Impact" ? combatImpact :
                                    type === "Cryonae" ? combatCryonae :
                                    type === "Arborae" ? combatArborae :
                                    type === "Tempestae" ? combatTempestae :
                                    type === "Infernae" ? combatInfernae :
                                    type === "Necromae" ? combatNecromae :
                                    <span className="text-gray-400">-</span>
                                  }</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Right side controls for armor - Price at bottom */}
                      <div className="flex flex-col items-end gap-2 min-w-[110px] flex-1 justify-between relative" style={{ 
                        width: 'auto', 
                        minWidth: '110px',
                        paddingTop: '0.5em',
                        paddingBottom: '0.5em'
                      }}>
                        <div></div>
                        {/* Price at bottom of right column */}
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-green-600" style={{
                            background: darkMode ? '#1f2937' : '#f9fafb',
                            padding: '0.25em 0.75em',
                            borderRadius: '0.5em',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            fontSize: '1.1em',
                            display: 'inline-block',
                            minWidth: 'max-content',
                            textAlign: 'right'
                          }}>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.25em'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                {(() => {
                                  const eachPrice = Math.floor(priceDisplayMode === 'Total' && quantity ? totalCopper / Number(quantity) : totalCopper);
                                  const formatPrice = (priceInCopper) => {
                                    const platinum = Math.floor(priceInCopper / 1000000000);
                                    const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                    const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                    const copper = priceInCopper % 1000;
                                    const parts = [];
                                    if (platinum) parts.push(
                                      <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {platinum}
                                        <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (gold) parts.push(
                                      <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {gold}
                                        <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (silver) parts.push(
                                      <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {silver}
                                        <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (copper || parts.length === 0) parts.push(
                                      <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {copper}
                                        <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    return <>{parts}</>;
                                  };
                                  return formatPrice(eachPrice);
                                })()}
                                <span className="text-xs font-normal text-gray-400">each</span>
                              </div>
                              {quantity && Number(quantity) > 1 && (
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                  {(() => {
                                    const totalPrice = (priceDisplayMode === 'Total' ? totalCopper : (priceDisplayMode === 'Total' && quantity ? totalCopper / Number(quantity) : totalCopper) * Number(quantity));
                                    const formatPrice = (priceInCopper) => {
                                      const platinum = Math.floor(priceInCopper / 1000000000);
                                      const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                      const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                      const copper = priceInCopper % 1000;
                                      const parts = [];
                                      if (platinum) parts.push(
                                        <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {platinum}
                                          <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (gold) parts.push(
                                        <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {gold}
                                          <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (silver) parts.push(
                                        <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {silver}
                                          <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (copper || parts.length === 0) parts.push(
                                        <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {copper}
                                          <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      return <>{parts}</>;
                                    };
                                    return formatPrice(totalPrice);
                                  })()}
                                  <span className="text-xs font-normal text-gray-400">total</span>
                                </div>
                              )}
                            </div>
                          </span>
                        </div>
                        {/* Time ago */}
                        <span className="text-xs text-gray-400 absolute top-8 right-0 pr-3" style={{
                          background: darkMode ? '#1f2937' : '#f9fafb',
                          padding: '0.2em 0.7em',
                          borderRadius: '0.5em',
                          marginTop: '0.3em',
                          pointerEvents: 'none',
                        }}>
                          Just now
                        </span>
                      </div>
                    </li>
                );
              }

              // ===============================================
              // WEAPON PREVIEW CARD
              // ===============================================
              if (isCombat && combatCategory === "Weapon") {
                return (
                  <li className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4" style={{ minHeight: '140px' }}>
                      <div className="flex flex-row gap-4 flex-1 min-w-0 items-center">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <ItemImage />
                          <QuantityTypeUser />
                        </div>
                        <div className="flex flex-col justify-start min-w-0 flex-1">
                          <ItemTitle />
                          {/* Show non-combat profession info for weapon cards */}
                          {(() => {
                            const professionsMap = new Map();
                            if (itemInfo) {
                              if (itemInfo["Profession A"] && itemInfo["Profession A"] !== "None" && itemInfo["Profession A"] !== "Combat") {
                                const levelA = itemInfo["Level A"] || 0;
                                professionsMap.set(itemInfo["Profession A"], { name: itemInfo["Profession A"], level: levelA });
                              }
                              if (itemInfo["Profession B"] && itemInfo["Profession B"] !== "None" && itemInfo["Profession B"] !== "Combat") {
                                const levelB = itemInfo["Level B"] || 0;
                                if (professionsMap.has(itemInfo["Profession B"])) {
                                  const existing = professionsMap.get(itemInfo["Profession B"]);
                                  const existingLevel = parseInt(existing.level) || 0;
                                  const newLevel = parseInt(levelB) || 0;
                                  existing.level = existingLevel !== newLevel ? `${existingLevel}/${newLevel}` : existingLevel.toString();
                                } else {
                                  professionsMap.set(itemInfo["Profession B"], { name: itemInfo["Profession B"], level: levelB });
                                }
                              }
                            }
                            const professions = Array.from(professionsMap.values());
                            if (professions.length > 0) {
                              return (
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {professions.map((prof, idx) => (
                                    <span key={`${prof.name}-${idx}`} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                      {professionImages[prof.name] && (
                                        <img 
                                          src={professionImages[prof.name]} 
                                          alt={prof.name} 
                                          className="h-5 w-5 object-contain" 
                                        />
                                      )}
                                      <span>Lvl {prof.level}</span>
                                      {idx !== professions.length - 1 && <span className="mx-1">|</span>}
                                    </span>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })()}
                          {/* Show combat level for weapon cards - icon and number in a bordered box */}
                          <div className="mt-1 mb-2">
                            <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                              {(() => {
                                const profA = itemInfo?.["Profession A"];
                                const profB = itemInfo?.["Profession B"];
                                const combatProf = profA === "Combat" ? profA : (profB === "Combat" ? profB : null);
                                return combatProf && professionImages[combatProf] ? (
                                  <img src={professionImages[combatProf]} alt={combatProf} className="h-4 w-4 object-contain flex-shrink-0" />
                                ) : null;
                              })()}
                              <span className="font-semibold text-sm">{combatLevel || "-"}</span>
                            </div>
                          </div>
                          {/* Combat stats */}
                          <div className="mt-2 text-sm">
                            <div className="flex flex-wrap gap-4 items-center">
                              <div className="flex items-center border p-2 rounded dark:bg-gray-800 text-black dark:text-white">
                                <img src={require("./assets/Strength.png")} alt="Strength" title="Strength" className="h-4 w-4 object-contain flex-shrink-0 mr-2" />
                                <span className="font-bold text-sm">{combatStrength || "-"}</span>
                              </div>
                              <div className="flex items-center border p-2 rounded dark:bg-gray-800 text-black dark:text-white">
                                {combatDmgType && dmgTypeImages[combatDmgType] && (
                                  <img src={dmgTypeImages[combatDmgType]} alt={combatDmgType} title={combatDmgType} className="h-4 w-4 object-contain flex-shrink-0 mr-2" />
                                )}
                                <span className="font-bold text-sm">
                                  {combatDmgPercent ? `${combatDmgPercent}%` : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Right side controls for weapon - Price at bottom */}
                      <div className="flex flex-col items-end gap-2 min-w-[110px] flex-1 justify-between relative" style={{ 
                        width: 'auto', 
                        minWidth: '110px',
                        paddingTop: '0.5em',
                        paddingBottom: '0.5em'
                      }}>
                        <div></div>
                        {/* Price at bottom of right column */}
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-green-600" style={{
                            background: darkMode ? '#1f2937' : '#f9fafb',
                            padding: '0.25em 0.75em',
                            borderRadius: '0.5em',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            fontSize: '1.1em',
                            display: 'inline-block',
                            minWidth: 'max-content',
                            textAlign: 'right'
                          }}>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.25em'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                {(() => {
                                  const eachPrice = Math.floor(priceDisplayMode === 'Total' && quantity ? totalCopper / Number(quantity) : totalCopper);
                                  const formatPrice = (priceInCopper) => {
                                    const platinum = Math.floor(priceInCopper / 1000000000);
                                    const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                    const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                    const copper = priceInCopper % 1000;
                                    const parts = [];
                                    if (platinum) parts.push(
                                      <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {platinum}
                                        <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (gold) parts.push(
                                      <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {gold}
                                        <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (silver) parts.push(
                                      <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {silver}
                                        <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (copper || parts.length === 0) parts.push(
                                      <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {copper}
                                        <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    return <>{parts}</>;
                                  };
                                  return formatPrice(eachPrice);
                                })()}
                                <span className="text-xs font-normal text-gray-400">each</span>
                              </div>
                              {quantity && Number(quantity) > 1 && (
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                  {(() => {
                                    const totalPrice = (priceDisplayMode === 'Total' ? totalCopper : (priceDisplayMode === 'Total' && quantity ? totalCopper / Number(quantity) : totalCopper) * Number(quantity));
                                    const formatPrice = (priceInCopper) => {
                                      const platinum = Math.floor(priceInCopper / 1000000000);
                                      const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                      const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                      const copper = priceInCopper % 1000;
                                      const parts = [];
                                      if (platinum) parts.push(
                                        <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {platinum}
                                          <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (gold) parts.push(
                                        <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {gold}
                                          <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (silver) parts.push(
                                        <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {silver}
                                          <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (copper || parts.length === 0) parts.push(
                                        <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {copper}
                                          <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      return <>{parts}</>;
                                    };
                                    return formatPrice(totalPrice);
                                  })()}
                                  <span className="text-xs font-normal text-gray-400">total</span>
                                </div>
                              )}
                            </div>
                          </span>
                        </div>
                        {/* Time ago */}
                        <span className="text-xs text-gray-400 absolute top-8 right-0 pr-3" style={{
                          background: darkMode ? '#1f2937' : '#f9fafb',
                          padding: '0.2em 0.7em',
                          borderRadius: '0.5em',
                          marginTop: '0.3em',
                          pointerEvents: 'none',
                        }}>
                          Just now
                        </span>
                      </div>
                    </li>
                );
              }

              // ===============================================
              // REGULAR PREVIEW CARD
              // ===============================================
              return (
                <li className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4" style={{ minHeight: '120px' }}>
                    <div className="flex flex-row gap-4 flex-1 min-w-0 items-center">
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <ItemImage />
                        <QuantityTypeUser />
                      </div>
                      <div className="flex flex-col justify-start min-w-0 flex-1">
                        <ItemTitle />
                        
                        {/* Profession info */}
                        {(() => {
                          const professionsMap = new Map();
                          if (itemInfo) {
                            if (itemInfo["Profession A"] && itemInfo["Profession A"] !== "None") {
                              professionsMap.set(itemInfo["Profession A"], {
                                name: itemInfo["Profession A"],
                                level: itemInfo["Profession Level A"],
                              });
                            }
                            if (itemInfo["Profession B"] && itemInfo["Profession B"] !== "None") {
                              if (professionsMap.has(itemInfo["Profession B"])) {
                                const existing = professionsMap.get(itemInfo["Profession B"]);
                                const levelA = parseInt(existing.level) || 0;
                                const levelB = parseInt(itemInfo["Profession Level B"]) || 0;
                                existing.level = levelA !== levelB ? `${levelA}/${levelB}` : levelA.toString();
                              } else {
                                professionsMap.set(itemInfo["Profession B"], {
                                  name: itemInfo["Profession B"],
                                  level: itemInfo["Profession Level B"],
                                });
                              }
                            }
                          }
                          const professions = Array.from(professionsMap.values());
                          if (professions.length > 0) {
                            return (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {professions.map((prof, idx) => (
                                  <span key={`${prof.name}-${idx}`} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                    {professionImages[prof.name] && (
                                      <img 
                                        src={professionImages[prof.name]} 
                                        alt={prof.name} 
                                        className="h-5 w-5 object-contain" 
                                      />
                                    )}
                                    <span>Lvl {prof.level}</span>
                                    {idx !== professions.length - 1 && <span className="mx-1">|</span>}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Episode icon */}
                        {(() => {
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
                    
                    {/* Right side controls for regular card - Price at bottom */}
                    <div className="flex flex-col items-end gap-2 min-w-[110px] flex-1 justify-between relative" style={{ 
                      width: 'auto', 
                      minWidth: '110px',
                      paddingTop: '0.5em',
                      paddingBottom: '0.5em'
                    }}>
                      <div></div>
                      {/* Price at bottom of right column */}
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-green-600" style={{
                          background: darkMode ? '#1f2937' : '#f9fafb',
                          padding: '0.25em 0.75em',
                          borderRadius: '0.5em',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          fontSize: '1.1em',
                          display: 'inline-block',
                          minWidth: 'max-content',
                          textAlign: 'right'
                        }}>
                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.25em'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                              {(() => {
                                const eachPrice = Math.floor(priceDisplayMode === 'Total' && quantity ? totalCopper / Number(quantity) : totalCopper);
                                const formatPrice = (priceInCopper) => {
                                  const platinum = Math.floor(priceInCopper / 1000000000);
                                  const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                  const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                  const copper = priceInCopper % 1000;
                                  const parts = [];
                                  if (platinum) parts.push(
                                    <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                      {platinum}
                                      <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                    </span>
                                  );
                                  if (gold) parts.push(
                                    <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                      {gold}
                                      <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                    </span>
                                  );
                                  if (silver) parts.push(
                                    <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                      {silver}
                                      <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                    </span>
                                  );
                                  if (copper || parts.length === 0) parts.push(
                                    <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                      {copper}
                                      <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                    </span>
                                  );
                                  return <>{parts}</>;
                                };
                                return formatPrice(eachPrice);
                              })()}
                              <span className="text-xs font-normal text-gray-400">each</span>
                            </div>
                            {quantity && Number(quantity) > 1 && (
                              <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                {(() => {
                                  const totalPrice = (priceDisplayMode === 'Total' ? totalCopper : (priceDisplayMode === 'Total' && quantity ? totalCopper / Number(quantity) : totalCopper) * Number(quantity));
                                  const formatPrice = (priceInCopper) => {
                                    const platinum = Math.floor(priceInCopper / 1000000000);
                                    const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                    const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                    const copper = priceInCopper % 1000;
                                    const parts = [];
                                    if (platinum) parts.push(
                                      <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {platinum}
                                        <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (gold) parts.push(
                                      <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {gold}
                                        <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (silver) parts.push(
                                      <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {silver}
                                        <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    if (copper || parts.length === 0) parts.push(
                                      <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                        {copper}
                                        <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                      </span>
                                    );
                                    return <>{parts}</>;
                                  };
                                  return formatPrice(totalPrice);
                                })()}
                                <span className="text-xs font-normal text-gray-400">total</span>
                              </div>
                            )}
                          </div>
                        </span>
                      </div>
                      {/* Time ago */}
                      <span className="text-xs text-gray-400 absolute top-8 right-0 pr-3" style={{
                        background: darkMode ? '#1f2937' : '#f9fafb',
                        padding: '0.2em 0.7em',
                        borderRadius: '0.5em',
                        marginTop: '0.3em',
                        pointerEvents: 'none',
                      }}>
                        Just now
                      </span>
                    </div>
                  </li>
                );
                  })()}
                </ul>
              </div>
            </>
          )}
          </>
        ) : activeTab === "admin" && isAdmin ? (
          <AdminDashboard onRefreshListings={fetchListings} />
        ) : (
          <>
            <h2 className="text-4xl font-semibold mb-4 text-center" style={{ fontSize: '2.5rem' }}>{activeTab === "my" ? "My Listings" : "Current Listings"}</h2>
            {/* Filters and controls */}
            <div className="w-full max-w-4xl mx-auto mb-6">
              {/* First row */}
              <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
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
                  <option value="asc">Each Price: Low to High</option>
                  <option value="desc">Each Price: High to Low</option>
                  <option value="total-asc">Total Price: Low to High</option>
                  <option value="total-desc">Total Price: High to Low</option>
                </select>
              </div>
              {/* Second row */}
              <div className="flex flex-wrap justify-center items-center gap-4">
                {/* Time sort dropdown */}
                <select
                  className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full min-w-[120px] max-w-xs"
                  value={timeSortOrder}
                  onChange={e => setTimeSortOrder(e.target.value)}
                >
                  <option value="new">Time: New to Old</option>
                  <option value="old">Time: Old to New</option>
                </select>
                {/* Profession filter custom dropdown with images */}
                <div className="relative w-full min-w-[120px] max-w-xs" ref={professionDropdownRef}>
                  <button
                    type="button"
                    className="w-full border p-2 rounded flex items-center justify-between dark:bg-gray-800 text-black dark:text-white"
                    onClick={() => setProfessionDropdownOpen(open => !open)}
                  >
                    {professionFilter === "all" ? (
                      <span className="flex items-center gap-2">All Professions</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {professionImages[professionFilter] && (
                          <img src={professionImages[professionFilter]} alt={professionFilter} style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} />
                        )}
                        {professionFilter}
                      </span>
                    )}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {professionDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto">
                      <ul>
                        <li
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${professionFilter === "all" ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                          onClick={() => {
                            setProfessionFilter("all");
                            setProfessionDropdownOpen(false);
                          }}
                        >
                          All Professions
                        </li>
                        {uniqueProfessions.filter(p => p !== "all").map(prof => (
                          <li
                            key={prof}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${professionFilter === prof ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                            onClick={() => {
                              setProfessionFilter(prof);
                              setProfessionDropdownOpen(false);
                            }}
                          >
                            {professionImages[prof] && (
                              <img src={professionImages[prof]} alt={prof} style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} />
                            )}
                            {prof}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
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
            </div>
            <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col">
              <ul className="space-y-4 flex-1" style={{ minHeight: 0, paddingBottom: '2rem' }}>
                {filteredListings
                  .filter(listing => activeTab === "all" || (loggedInUser && listing.seller === loggedInUser))
                  .map((listing) => {
                    // Determine layout type
                    const selected = itemData.find(i => i.Items === listing.item);
                    const isCombat = selected && (selected["Profession A"] === "Combat" || selected["Profession B"] === "Combat");
                    
                    // ===============================================
                    // SHARED COMPONENTS FOR ALL LISTING CARD TYPES
                    // ===============================================
                    const ItemImage = () => (
                      <img
                        src={
                          itemData.find((item) => item.Items === listing.item)?.Image ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        alt={listing.item}
                        className="w-20 h-20 object-contain flex-shrink-0"
                      />
                    );
                    
                    const QuantityTypeUser = () => (
                      <div className="text-xs text-gray-700 dark:text-gray-300 text-center">
                        <div>x{listing.quantity}</div>
                        <div className={`uppercase font-bold ${
                          listing.type?.toLowerCase() === "buy"
                            ? "text-green-600"
                            : listing.type?.toLowerCase() === "sell"
                            ? "text-red-600"
                            : ""
                        }`}>
                          {listing.type}
                        </div>
                        <div className="font-semibold text-blue-700">{listing.seller}</div>
                      </div>
                    );
                    
                    const ItemTitle = () => (
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-lg mb-0 truncate">
                          {listing.item} <span className="text-sm text-gray-500">({listing.contactInfo})</span>
                        </p>
                      </div>
                    );
                    
                    const ProfessionInfo = () => {
                      const itemInfo = itemData.find(i => i.Items === listing.item);
                      const professionsMap = new Map();
                      if (itemInfo) {
                        if (itemInfo["Profession A"] && itemInfo["Profession A"] !== "None") {
                          professionsMap.set(itemInfo["Profession A"], {
                            name: itemInfo["Profession A"],
                            level: itemInfo["Profession Level A"],
                          });
                        }
                        if (itemInfo["Profession B"] && itemInfo["Profession B"] !== "None") {
                          // If profession B is the same as A, combine levels or keep the higher one
                          if (professionsMap.has(itemInfo["Profession B"])) {
                            const existing = professionsMap.get(itemInfo["Profession B"]);
                            const levelA = parseInt(existing.level) || 0;
                            const levelB = parseInt(itemInfo["Profession Level B"]) || 0;
                            // Keep the higher level, or combine them if they're different
                            existing.level = levelA !== levelB ? `${levelA}/${levelB}` : levelA.toString();
                          } else {
                            professionsMap.set(itemInfo["Profession B"], {
                              name: itemInfo["Profession B"],
                              level: itemInfo["Profession Level B"],
                            });
                          }
                        }
                      }
                      const professions = Array.from(professionsMap.values());
                      if (professions.length > 0) {
                        return (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {professions.map((prof, idx) => (
                              <span key={`${prof.name}-${idx}`} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                {professionImages[prof.name] && (
                                  <img 
                                    src={professionImages[prof.name]} 
                                    alt={prof.name} 
                                    className="h-5 w-5 object-contain" 
                                  />
                                )}
                                <span>Lvl {prof.level}</span>
                                {idx !== professions.length - 1 && <span className="mx-1">|</span>}
                              </span>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    };
                    
                    const EpisodeIcon = () => {
                      const itemInfo = itemData.find(i => i.Items === listing.item);
                      const episode = itemInfo?.Episode;
                      if (episode && episodeImages[episode]) {
                        return (
                          <div className="flex items-center gap-2 mt-1">
                            <img src={episodeImages[episode]} alt={episode} style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} />
                          </div>
                        );
                      }
                      return null;
                    };
                    
                    const EditDeleteButtons = () => (
                      loggedInUser === listing.seller && (
                        <div className="flex gap-2 text-sm absolute top-0 right-0 pr-3 pt-2 z-10">
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors" 
                            onClick={() => startEditing(listing)}
                            title="Edit listing"
                          >
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800 transition-colors" 
                            onClick={() => deleteListing(listing.id)}
                            title="Delete listing"
                          >
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      )
                    );
                    
                    const Timestamp = () => {
                      const dateString = listing.createdAt || listing.created_at || listing.timestamp;
                      if (!dateString) return null;
                      const ago = formatTimeAgo(dateString);
                      return ago ? (
                        <span
                          className="text-xs text-gray-400 absolute top-8 right-0 pr-3"
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
                    };

                    // ===============================================
                    // ARMOR LISTING CARD
                    // ===============================================
                    // Features: 3x2 grid for armor resistance stats, 
                    // price positioned at bottom right corner
                    if (isCombat && listing.combatCategory === "Armor") {
                      return (
                        <li
                          key={listing.id}
                          className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4"
                          style={{ minHeight: '160px' }}
                        >
                          <div className="flex flex-row gap-4 flex-1 min-w-0 items-start">
                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                              <ItemImage />
                              <QuantityTypeUser />
                            </div>
                            <div className="flex flex-col justify-start min-w-0 flex-1">
                              <ItemTitle />
                              {/* Show combat level for armor cards - icon and number in a bordered box */}
                              <div className="mt-1 mb-2">
                                <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                                  {(() => {
                                    const itemInfo = itemData.find(i => i.Items === listing.item);
                                    const profA = itemInfo?.["Profession A"];
                                    const profB = itemInfo?.["Profession B"];
                                    const combatProf = profA === "Combat" ? profA : (profB === "Combat" ? profB : null);
                                    return combatProf && professionImages[combatProf] ? (
                                      <img src={professionImages[combatProf]} alt={combatProf} className="h-4 w-4 object-contain flex-shrink-0" />
                                    ) : null;
                                  })()}
                                  <span className="font-semibold text-sm">{listing.combatLevel || "-"}</span>
                                </div>
                              </div>
                              <div className="mt-2 text-sm">
                                {/* Resistance Stats only */}
                                <div className="grid grid-cols-3 gap-2 max-w-md">
                                  {['Impact', 'Cryonae', 'Arborae', 'Tempestae', 'Infernae', 'Necromae'].map(type => (
                                    <div key={type} className="flex items-center border p-2 rounded dark:bg-gray-800 text-black dark:text-white justify-center" style={{fontSize: '0.9em'}}>
                                      <img src={dmgTypeImages[type]} alt={type} title={type} className="h-4 w-4 object-contain flex-shrink-0 mr-2" />
                                      <span className="font-bold text-sm">{
                                        listing[`combat${type}`] || <span className="text-gray-400">-</span>
                                      }</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Right side controls for armor - Edit/Delete, Timestamp, and Price at bottom */}
                          <div
                            className="flex flex-col items-end gap-2 min-w-[110px] flex-1 justify-between relative"
                            style={{ 
                              width: 'auto', 
                              minWidth: '110px',
                              paddingTop: '0.5em',
                              paddingBottom: '0.5em'
                            }}
                          >
                            <div className="flex flex-col items-end gap-2">
                              <EditDeleteButtons />
                              <Timestamp />
                            </div>
                            {/* Price at bottom of right column */}
                            <div className="flex flex-col items-end">
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
                                  textAlign: 'right'
                                }}
                              >
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.25em'}}>
                                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                    {(() => {
                                      const eachPrice = Math.floor(listing.price);
                                      const formatPrice = (priceInCopper) => {
                                        const platinum = Math.floor(priceInCopper / 1000000000);
                                        const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                        const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                        const copper = priceInCopper % 1000;
                                        const parts = [];
                                        if (platinum) parts.push(
                                          <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {platinum}
                                            <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (gold) parts.push(
                                          <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {gold}
                                            <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (silver) parts.push(
                                          <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {silver}
                                            <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (copper || parts.length === 0) parts.push(
                                          <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {copper}
                                            <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        return <>{parts}</>;
                                      };
                                      return formatPrice(eachPrice);
                                    })()}
                                    <span className="text-xs font-normal text-gray-400">each</span>
                                  </div>
                                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                    {(() => {
                                      const totalPrice = listing.price * listing.quantity;
                                      const formatPrice = (priceInCopper) => {
                                        const platinum = Math.floor(priceInCopper / 1000000000);
                                        const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                        const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                        const copper = priceInCopper % 1000;
                                        const parts = [];
                                        if (platinum) parts.push(
                                          <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {platinum}
                                            <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (gold) parts.push(
                                          <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {gold}
                                            <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (silver) parts.push(
                                          <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {silver}
                                            <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (copper || parts.length === 0) parts.push(
                                          <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {copper}
                                            <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        return <>{parts}</>;
                                      };
                                      return formatPrice(totalPrice);
                                    })()}
                                    <span className="text-xs font-normal text-gray-400">total</span>
                                  </div>
                                </div>
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    }

                    // ===============================================
                    // WEAPON LISTING CARD
                    // ===============================================
                    // Features: Horizontal layout for weapon stats 
                    // (Strength, Damage Type, Damage %), centered alignment
                    if (isCombat && listing.combatCategory === "Weapon") {
                      return (
                        <li
                          key={listing.id}
                          className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4"
                          style={{ minHeight: '140px' }}
                        >
                          <div className="flex flex-row gap-4 flex-1 min-w-0 items-center">
                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                              <ItemImage />
                              <QuantityTypeUser />
                            </div>
                            <div className="flex flex-col justify-start min-w-0 flex-1">
                              <ItemTitle />
                              {/* Show non-combat profession info for weapon cards */}
                              {(() => {
                                const itemInfo = itemData.find(i => i.Items === listing.item);
                                const professionsMap = new Map();
                                if (itemInfo) {
                                  if (itemInfo["Profession A"] && itemInfo["Profession A"] !== "None" && itemInfo["Profession A"] !== "Combat") {
                                    const levelA = itemInfo["Level A"] || 0;
                                    professionsMap.set(itemInfo["Profession A"], { name: itemInfo["Profession A"], level: levelA });
                                  }
                                  if (itemInfo["Profession B"] && itemInfo["Profession B"] !== "None" && itemInfo["Profession B"] !== "Combat") {
                                    const levelB = itemInfo["Level B"] || 0;
                                    // If profession B is the same as A, combine levels or keep the higher one
                                    if (professionsMap.has(itemInfo["Profession B"])) {
                                      const existing = professionsMap.get(itemInfo["Profession B"]);
                                      const existingLevel = parseInt(existing.level) || 0;
                                      const newLevel = parseInt(levelB) || 0;
                                      // Keep the higher level, or combine them if they're different
                                      existing.level = existingLevel !== newLevel ? `${existingLevel}/${newLevel}` : existingLevel.toString();
                                    } else {
                                      professionsMap.set(itemInfo["Profession B"], { name: itemInfo["Profession B"], level: levelB });
                                    }
                                  }
                                }
                                const professions = Array.from(professionsMap.values());
                                if (professions.length > 0) {
                                  return (
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      {professions.map((prof, idx) => (
                                        <span key={`${prof.name}-${idx}`} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                          {professionImages[prof.name] && (
                                            <img 
                                              src={professionImages[prof.name]} 
                                              alt={prof.name} 
                                              className="h-5 w-5 object-contain" 
                                            />
                                          )}
                                          <span>Lvl {prof.level}</span>
                                          {idx !== professions.length - 1 && <span className="mx-1">|</span>}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                              {/* Show combat level for weapon cards - icon and number in a bordered box */}
                              <div className="mt-1 mb-2">
                                <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                                  {(() => {
                                    const itemInfo = itemData.find(i => i.Items === listing.item);
                                    const profA = itemInfo?.["Profession A"];
                                    const profB = itemInfo?.["Profession B"];
                                    const combatProf = profA === "Combat" ? profA : (profB === "Combat" ? profB : null);
                                    return combatProf && professionImages[combatProf] ? (
                                      <img src={professionImages[combatProf]} alt={combatProf} className="h-4 w-4 object-contain flex-shrink-0" />
                                    ) : null;
                                  })()}
                                  <span className="font-semibold text-sm">{listing.combatLevel || "-"}</span>
                                </div>
                              </div>
                              {/* Combat stats */}
                              <div className="mt-2 text-sm">
                                <div className="flex flex-wrap gap-4 items-center">
                                  <div className="flex items-center border p-2 rounded dark:bg-gray-800 text-black dark:text-white">
                                    <img src={require("./assets/Strength.png")} alt="Strength" title="Strength" className="h-4 w-4 object-contain flex-shrink-0 mr-2" />
                                    <span className="font-bold text-sm">{listing.combatStrength || "-"}</span>
                                  </div>
                                  <div className="flex items-center border p-2 rounded dark:bg-gray-800 text-black dark:text-white">
                                    {listing.combatDmgType && dmgTypeImages[listing.combatDmgType] && (
                                      <img src={dmgTypeImages[listing.combatDmgType]} alt={listing.combatDmgType} title={listing.combatDmgType} className="h-4 w-4 object-contain flex-shrink-0 mr-2" />
                                    )}
                                    <span className="font-bold text-sm">
                                      {listing.combatDmgPercent ? `${listing.combatDmgPercent}%` : "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Right side controls for weapon - Edit/Delete, Timestamp, and Price at bottom */}
                          <div
                            className="flex flex-col items-end gap-2 min-w-[110px] flex-1 justify-between relative"
                            style={{ 
                              width: 'auto', 
                              minWidth: '110px',
                              paddingTop: '0.5em',
                              paddingBottom: '0.5em'
                            }}
                          >
                            <div className="flex flex-col items-end gap-2">
                              <EditDeleteButtons />
                              <Timestamp />
                            </div>
                            {/* Price at bottom of right column */}
                            <div className="flex flex-col items-end">
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
                                  textAlign: 'right'
                                }}
                              >
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.25em'}}>
                                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                    {(() => {
                                      const eachPrice = Math.floor(listing.price);
                                      const formatPrice = (priceInCopper) => {
                                        const platinum = Math.floor(priceInCopper / 1000000000);
                                        const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                        const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                        const copper = priceInCopper % 1000;
                                        const parts = [];
                                        if (platinum) parts.push(
                                          <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {platinum}
                                            <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (gold) parts.push(
                                          <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {gold}
                                            <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (silver) parts.push(
                                          <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {silver}
                                            <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (copper || parts.length === 0) parts.push(
                                          <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {copper}
                                            <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        return <>{parts}</>;
                                      };
                                      return formatPrice(eachPrice);
                                    })()}
                                    <span className="text-xs font-normal text-gray-400">each</span>
                                  </div>
                                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                    {(() => {
                                      const totalPrice = listing.price * listing.quantity;
                                      const formatPrice = (priceInCopper) => {
                                        const platinum = Math.floor(priceInCopper / 1000000000);
                                        const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                        const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                        const copper = priceInCopper % 1000;
                                        const parts = [];
                                        if (platinum) parts.push(
                                          <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {platinum}
                                            <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (gold) parts.push(
                                          <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {gold}
                                            <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (silver) parts.push(
                                          <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {silver}
                                            <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        if (copper || parts.length === 0) parts.push(
                                          <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                            {copper}
                                            <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                          </span>
                                        );
                                        return <>{parts}</>;
                                      };
                                      return formatPrice(totalPrice);
                                    })()}
                                    <span className="text-xs font-normal text-gray-400">total</span>
                                  </div>
                                </div>
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    }

                    // ===============================================
                    // DEFAULT/OTHER LISTING CARD
                    // ===============================================
                    // Features: Clean, compact design for non-combat items
                    // (crafting materials, consumables, etc.), price positioned at bottom right
                    return (
                      <li
                        key={listing.id}
                        className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4"
                        style={{ minHeight: '120px' }}
                      >
                        <div className="flex flex-row gap-4 flex-1 min-w-0 items-center">
                          <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <ItemImage />
                            <QuantityTypeUser />
                          </div>
                          <div className="flex flex-col justify-start min-w-0 flex-1">
                            <ItemTitle />
                            <ProfessionInfo />
                            <EpisodeIcon />
                          </div>
                        </div>
                        {/* Right side controls for default card - Edit/Delete, Timestamp, and Price at bottom */}
                        <div
                          className="flex flex-col items-end gap-2 min-w-[110px] flex-1 justify-between relative"
                          style={{ 
                            width: 'auto', 
                            minWidth: '110px',
                            paddingTop: '0.5em',
                            paddingBottom: '0.5em'
                          }}
                        >
                          <div className="flex flex-col items-end gap-2">
                            <EditDeleteButtons />
                            <Timestamp />
                          </div>
                          {/* Price at bottom of right column */}
                          <div className="flex flex-col items-end">
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
                                textAlign: 'right'
                              }}
                            >
                              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.25em'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                  {(() => {
                                    const eachPrice = Math.floor(listing.price);
                                    const formatPrice = (priceInCopper) => {
                                      const platinum = Math.floor(priceInCopper / 1000000000);
                                      const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                      const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                      const copper = priceInCopper % 1000;
                                      const parts = [];
                                      if (platinum) parts.push(
                                        <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {platinum}
                                          <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (gold) parts.push(
                                        <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {gold}
                                          <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (silver) parts.push(
                                        <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {silver}
                                          <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (copper || parts.length === 0) parts.push(
                                        <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {copper}
                                          <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      return <>{parts}</>;
                                    };
                                    return formatPrice(eachPrice);
                                  })()}
                                  <span className="text-xs font-normal text-gray-400">each</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                  {(() => {
                                    const totalPrice = listing.price * listing.quantity;
                                    const formatPrice = (priceInCopper) => {
                                      const platinum = Math.floor(priceInCopper / 1000000000);
                                      const gold = Math.floor((priceInCopper % 1000000000) / 1000000);
                                      const silver = Math.floor((priceInCopper % 1000000) / 1000);
                                      const copper = priceInCopper % 1000;
                                      const parts = [];
                                      if (platinum) parts.push(
                                        <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {platinum}
                                          <img src={platinumImg || "/placeholder.svg"} alt="Platinum" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (gold) parts.push(
                                        <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {gold}
                                          <img src={goldImg || "/placeholder.svg"} alt="Gold" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (silver) parts.push(
                                        <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {silver}
                                          <img src={silverImg || "/placeholder.svg"} alt="Silver" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      if (copper || parts.length === 0) parts.push(
                                        <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9em', fontWeight: 600, lineHeight: 1}}>
                                          {copper}
                                          <img src={copperImg || "/placeholder.svg"} alt="Copper" style={{height: '0.9em', width: '0.9em', marginLeft: '0.2em', marginRight: '0.2em', objectFit: 'contain', flexShrink: 0}} />
                                        </span>
                                      );
                                      return <>{parts}</>;
                                    };
                                    return formatPrice(totalPrice);
                                  })()}
                                  <span className="text-xs font-normal text-gray-400">total</span>
                                </div>
                              </div>
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </>
        )}
      </main>
      {/* Footer */}
      <footer className="w-full text-center bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-300 fixed bottom-0 left-0 z-50" style={{position: 'fixed', left: 0, bottom: 0, width: '100%', borderTop: '1px solid #e5e7eb', padding: '0.25rem 0'}}>
        <div>&copy; Proniss 2025</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          bs-bazaar.com is not officially affiliated with, endorsed by, or partnered with Fen Research Ltd
        </div>
      </footer>
    </div>
  );
}

export default App;
