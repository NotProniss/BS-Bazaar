import React, { useState } from 'react';
import { dmgTypeImages } from '../utils/constants';
// Helper to validate allowed Dmg %
const isValidDmgPercent = (val) => {
  const num = parseInt(val, 10);
  if (isNaN(num)) return false;
  return num === 0 || (num >= 30 && num <= 49) || (num >= 70 && num <= 89);
};

function CombatFields({
  combatCategory,
  setCombatCategory,
  combatLevel,
  setCombatLevel,
  combatStrength,
  setCombatStrength,
  combatDmgType,
  setCombatDmgType,
  combatDmgPercent,
  setCombatDmgPercent,
  combatImpact,
  setCombatImpact,
  combatCryonae,
  setCombatCryonae,
  combatArborae,
  setCombatArborae,
  combatTempestae,
  setCombatTempestae,
  combatInfernae,
  setCombatInfernae,
  combatNecromae,
  setCombatNecromae,
  rarity,
  setRarity,
  formError,
  darkMode
}) {
  const [dmgTypeDropdownOpen, setDmgTypeDropdownOpen] = useState(false);

  // Helper function to validate and format armor stat inputs
  const handleArmorStatChange = (value, setter, min = 0, max = 99999, type = "") => {
    // Remove non-numeric characters
    let cleanValue = value.replace(/[^\d]/g, '');
    // Limit to 5 digits
    if (cleanValue.length > 5) {
      cleanValue = cleanValue.slice(0, 5);
    }
    // Special logic for Dmg %
    if (type === "dmgPercent") {
      setter(cleanValue);
      return;
    }
    // Default logic
    if (cleanValue === '') {
      setter('');
    } else {
      let numValue = parseInt(cleanValue, 10);
      if (isNaN(numValue)) numValue = min;
      if (numValue < min) numValue = min;
      if (numValue > max) numValue = max;
      setter(numValue.toString());
    }
  };

  return (
    <>
      {/* Combat Category and Combat Level side by side */}
      <div className="mb-2 mt-2 flex gap-4 items-end">
        <div className="flex-1">
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>Combat Category</label>
          <select
            value={combatCategory || ""}
            onChange={e => setCombatCategory(e.target.value)}
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full max-w-xs"
          >
            <option value="">Select Category...</option>
            <option value="Weapon">Weapon</option>
            <option value="Armor">Armor</option>
          </select>
        </div>
        <div className="flex-1 max-w-xs">
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>Combat Level</label>
          <input 
            type="text" 
            value={combatLevel || ""} 
            onChange={e => handleArmorStatChange(e.target.value, setCombatLevel, 0, 2500)} 
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" 
            placeholder="Combat Level (0-2500)" 
            maxLength="4"
            min="0"
            max="2500"
          />
        </div>
      </div>

      {combatCategory === "Weapon" && (
        <>
          <div className="mb-2 mt-2 text-lg font-semibold text-indigo-500">Weapon</div>
          
          {/* Rarity dropdown for weapons */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>Rarity</label>
            <select
              value={rarity || ""}
              onChange={e => setRarity(e.target.value)}
              className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full max-w-xs"
            >
              <option value="">Select Rarity...</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-1 flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
                <img 
                  src={require("../assets/Strength.png")} 
                  alt="Strength" 
                  title="Strength"
                  className="h-5 w-5 object-contain" 
                />
                Strength
              </label>
              <input 
                type="text" 
                value={combatStrength || ""} 
                onChange={e => handleArmorStatChange(e.target.value, setCombatStrength, 0, 3000)} 
                className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" 
                placeholder="Strength (0-3000)" 
                maxLength="4"
                min="0"
                max="3000"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>Dmg Type</label>
              {/* Custom dropdown for Dmg Type with images */}
              <div className="relative">
                <button
                  type="button"
                  className={`w-full border p-2 rounded flex items-center justify-between dark:bg-gray-800 text-black dark:text-white ${
                    !combatDmgType && formError ? 'border-red-500' : ''
                  }`}
                  onClick={() => setDmgTypeDropdownOpen(open => !open)}
                >
                  {combatDmgType ? (
                    <span className="flex items-center gap-2">
                      {dmgTypeImages[combatDmgType] && (
                        <img 
                          src={dmgTypeImages[combatDmgType]} 
                          alt={combatDmgType} 
                          title={combatDmgType}
                          className="h-7 w-7 object-contain" 
                        />
                      )}
                      {combatDmgType}
                    </span>
                  ) : (
                    <span className="text-gray-400">Select Dmg Type...</span>
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
                {dmgTypeDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded shadow max-h-60 overflow-y-auto">
                    <ul>
                      {["Impact", "Cryonae", "Arborae", "Tempestae", "Infernae", "Necromae"].map(type => (
                      <li
                        key={type}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          combatDmgType === type ? 'bg-gray-200 dark:bg-gray-700' : ''
                        } ${darkMode ? 'text-white' : ''}`}
                        onClick={() => {
                          setCombatDmgType(type);
                          setDmgTypeDropdownOpen(false);
                        }}
                      >
                        {dmgTypeImages[type] && (
                          <img 
                            src={dmgTypeImages[type]} 
                            alt={type} 
                            title={type}
                            className="h-7 w-7 object-contain" 
                          />
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
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>Dmg %</label>
              <input 
                type="text" 
                value={combatDmgPercent || ""} 
                onChange={e => handleArmorStatChange(e.target.value, setCombatDmgPercent, 0, 100, "dmgPercent")}
                className={`border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full ${combatDmgPercent && !isValidDmgPercent(combatDmgPercent) ? 'border-red-500' : ''}`}
                placeholder="Dmg % (0, 30-49, 70-89)" 
                maxLength="2"
                min="0"
                max="89"
              />
              {/* Show error if invalid */}
              {combatDmgPercent && !isValidDmgPercent(combatDmgPercent) && (
                <div className="text-red-500 text-xs mt-1">Allowed: 0, 30-49, 70-89</div>
              )}
            </div>
          </div>
        </>
      )}

      {combatCategory === "Armor" && (
        <>
          <div className="mb-2 mt-2 text-lg font-semibold text-indigo-500">Armor</div>
          
          {/* Rarity dropdown for armor */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>Rarity</label>
            <select
              value={rarity || ""}
              onChange={e => setRarity(e.target.value)}
              className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full max-w-xs"
            >
              <option value="">Select Rarity...</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {['Impact', 'Cryonae', 'Arborae', 'Tempestae', 'Infernae', 'Necromae'].map(type => {
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
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : ''}`}>{type}</label>
                  <div className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full flex items-center">
                    <img 
                      src={dmgTypeImages[type]} 
                      alt={type} 
                      title={type} 
                      className="h-7 w-7 object-contain mr-2" 
                    />
                    <input
                      type="text"
                      value={value || ""}
                      onChange={e => handleArmorStatChange(e.target.value, setter, 0, 3000)}
                      className="flex-1 bg-transparent outline-none border-none text-black dark:text-white"
                      placeholder="0-3000"
                      maxLength="5"
                      min="0"
                      max="3000"
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
}

export default CombatFields;
