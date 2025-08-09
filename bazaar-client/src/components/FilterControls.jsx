import React, { useState, useRef, useEffect } from 'react';
import { itemData, professionImages, episodeImages } from '../utils/constants';

function FilterControls({
  search, setSearch,
  filterType, setFilterType,
  sortOrder, setSortOrder,
  professionFilter, setProfessionFilter,
  episodeFilter, setEpisodeFilter
}) {
  const [professionDropdownOpen, setProfessionDropdownOpen] = useState(false);
  const [episodeDropdownOpen, setEpisodeDropdownOpen] = useState(false);
  const professionDropdownRef = useRef(null);
  const episodeDropdownRef = useRef(null);

  const uniqueEpisodes = [
    "all",
    ...Array.from(new Set(itemData.map(i => i.Episode).filter(Boolean).filter(ep => ep !== "Episode")))
  ];

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

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (professionDropdownRef.current && !professionDropdownRef.current.contains(event.target)) {
        setProfessionDropdownOpen(false);
      }
      if (episodeDropdownRef.current && !episodeDropdownRef.current.contains(event.target)) {
        setEpisodeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
        <input
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full min-w-[120px] max-w-xs"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select
          className="border px-2 py-1 rounded dark:bg-gray-800 text-black dark:text-white w-auto min-w-0 text-sm"
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
          <option value="new">Time: New to Old</option>
          <option value="old">Time: Old to New</option>
          <option value="asc">Each Price: Low to High</option>
          <option value="desc">Each Price: High to Low</option>
          <option value="total-asc">Total Price: Low to High</option>
          <option value="total-desc">Total Price: High to Low</option>
        </select>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4">{/* Remove the separate time sorting dropdown */}

        {/* Profession filter dropdown */}
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
                  <img 
                    src={professionImages[professionFilter]} 
                    alt={professionFilter} 
                    title={professionFilter}
                    style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} 
                  />
                )}
                {professionFilter}
              </span>
            )}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {professionDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto">
              <ul>
                <li
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    professionFilter === "all" ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
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
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      professionFilter === prof ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => {
                      setProfessionFilter(prof);
                      setProfessionDropdownOpen(false);
                    }}
                  >
                    {professionImages[prof] && (
                      <img 
                        src={professionImages[prof]} 
                        alt={prof} 
                        title={prof}
                        style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} 
                      />
                    )}
                    {prof}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Episode filter dropdown */}
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
                  <img 
                    src={episodeImages[episodeFilter]} 
                    alt={episodeFilter} 
                    title={episodeFilter}
                    style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} 
                  />
                )}
                {episodeFilter}
              </span>
            )}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {episodeDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto">
              <ul>
                {uniqueEpisodes.map(ep => (
                  <li
                    key={ep}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      episodeFilter === ep ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => {
                      setEpisodeFilter(ep);
                      setEpisodeDropdownOpen(false);
                    }}
                  >
                    {ep !== "all" && episodeImages[ep] && (
                      <img 
                        src={episodeImages[ep]} 
                        alt={ep} 
                        title={ep}
                        style={{height: '1.5em', width: '1.5em', objectFit: 'contain'}} 
                      />
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
  );
}

export default FilterControls;
