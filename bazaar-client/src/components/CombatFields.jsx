import React, { useState } from 'react';
import { dmgTypeImages } from '../utils/constants';

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
  formError
}) {
  const [dmgTypeDropdownOpen, setDmgTypeDropdownOpen] = useState(false);

  // Helper function to validate and format armor stat inputs
  const handleArmorStatChange = (value, setter) => {
    // Remove non-numeric characters
    let cleanValue = value.replace(/[^\d]/g, '');
    
    // Limit to 5 digits
    if (cleanValue.length > 5) {
      cleanValue = cleanValue.slice(0, 5);
    }
    
    // Ensure positive values only (0 and above)
    if (cleanValue === '') {
      setter('');
    } else {
      const numValue = parseInt(cleanValue, 10);
      if (numValue >= 0) {
        setter(cleanValue);
      }
    }
  };

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
          <input 
            type="text" 
            value={combatLevel} 
            onChange={e => handleArmorStatChange(e.target.value, setCombatLevel)} 
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" 
            placeholder="Combat Level" 
            maxLength="5"
          />
        </div>
      </div>

      {combatCategory === "Weapon" && (
        <>
          <div className="mb-2 mt-2 text-lg font-semibold text-indigo-500">Weapon</div>
          
          {/* Rarity dropdown for weapons */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rarity</label>
            <select
              value={rarity}
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
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
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
                value={combatStrength} 
                onChange={e => handleArmorStatChange(e.target.value, setCombatStrength)} 
                className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" 
                placeholder="Strength" 
                maxLength="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dmg Type</label>
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
                          }`}
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
              <label className="block text-sm font-medium mb-1">Dmg %</label>
              <input 
                type="text" 
                value={combatDmgPercent} 
                onChange={e => handleArmorStatChange(e.target.value, setCombatDmgPercent)} 
                className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full" 
                placeholder="Dmg %" 
                maxLength="5"
              />
            </div>
          </div>
        </>
      )}

      {combatCategory === "Armor" && (
        <>
          <div className="mb-2 mt-2 text-lg font-semibold text-indigo-500">Armor</div>
          
          {/* Rarity dropdown for armor */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rarity</label>
            <select
              value={rarity}
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
                    <img 
                      src={dmgTypeImages[type]} 
                      alt={type} 
                      title={type} 
                      className="h-7 w-7 object-contain mr-2" 
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={e => handleArmorStatChange(e.target.value, setter)}
                      className="flex-1 bg-transparent outline-none border-none text-black dark:text-white"
                      placeholder="-"
                      maxLength="5"
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
