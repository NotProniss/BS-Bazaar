import React, { useState, useRef, useEffect } from 'react';
import { itemData } from '../utils/constants';

function ItemDropdown({ item, setItem, formError }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1 min-w-[120px] max-w-xs" ref={dropdownRef}>
      <button
        type="button"
        className={`w-full border p-2 rounded flex items-center justify-between dark:bg-gray-800 ${
          !item && formError ? 'border-red-500' : ''
        } text-black dark:text-white`}
        onClick={() => setDropdownOpen(open => !open)}
      >
        {item ? (
          <span className="flex items-center gap-2">
            {itemData.find((i) => i.Items === item)?.Image && (
              <img 
                src={itemData.find((i) => i.Items === item)?.Image} 
                alt={item} 
                className="h-7 w-7 object-contain" 
              />
            )}
            {item}
          </span>
        ) : (
          <span className="text-gray-400">Select an item...</span>
        )}
        <svg 
          className="w-4 h-4 ml-2" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
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
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  item === itemOption.Items ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
                onClick={() => {
                  setItem(itemOption.Items);
                  setDropdownOpen(false);
                  setDropdownSearch("");
                }}
              >
                {itemOption.Image && (
                  <img 
                    src={itemOption.Image} 
                    alt={itemOption.Items} 
                    className="h-7 w-7 object-contain" 
                  />
                )}
                <span>{itemOption.Items}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ItemDropdown;
