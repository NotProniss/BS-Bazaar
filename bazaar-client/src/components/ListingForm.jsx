import React, { useEffect, useState } from 'react';
import config from '../config';
import ItemDropdown from './ItemDropdown';
import CurrencyInput from './CurrencyInput';
import CombatFields from './CombatFields';
// ...existing code...
import { calculateTotalCopper } from '../utils/helpers';
import PreviewCard from './PreviewCard';

function ListingForm({
  // Form state
  item, setItem,
  type, setType,
  platinum, setPlatinum,
  gold, setGold,
  silver, setSilver,
  copper, setCopper,
  quantity, setQuantity,
  IGN, setIGN, contactInfo, setContactInfo,
  priceDisplayMode, setPriceDisplayMode,
  itemOptions = [],
  
  // Combat fields
  combatStrength, setCombatStrength,
  combatDmgType, setCombatDmgType,
  combatDmgPercent, setCombatDmgPercent,
  combatImpact, setCombatImpact,
  combatCryonae, setCombatCryonae,
  combatArborae, setCombatArborae,
  combatTempestae, setCombatTempestae,
  combatInfernae, setCombatInfernae,
  combatNecromae, setCombatNecromae,
  combatLevel, setCombatLevel,
  combatCategory, setCombatCategory,
  rarity, setRarity,
  
  // Form actions
  editingId,
  formError,
  successMessage,
  onSubmit,
  onCancel,
  loggedInUser,
  darkMode
}) {
  // Ensure combatCategory is initialized to empty string if not already
  React.useEffect(() => {
    if (typeof setCombatCategory === 'function' && (combatCategory === null || combatCategory === undefined)) {
      setCombatCategory("");
    }
  }, [combatCategory, setCombatCategory]);
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
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty string for clearing the field
    if (value === '') {
      setQuantity('');
      return;
    }
    
    // Remove non-numeric characters and ensure positive integers only
    const cleanValue = value.replace(/[^\d]/g, '');
    const numValue = parseInt(cleanValue, 10);
    
    // Only set if it's a positive number (greater than 0)
    if (numValue > 0) {
      setQuantity(cleanValue);
    }
  };

  const totalCopper = calculateTotalCopper(platinum, gold, silver, copper);

  const handleSubmit = () => {
    // Build full listing object with all fields
    const itemName = typeof item === "object" && item !== null ? item.Items : item;
    const listing = {
      item: itemName,
      type,
      platinum: Number(platinum) || 0,
      gold: Number(gold) || 0,
      silver: Number(silver) || 0,
      copper: Number(copper) || 0,
      price: totalCopper,
      quantity: Number(quantity) || 1,
      IGN: IGN,
      priceMode: priceDisplayMode,
      combatCategory: combatCategory || "",
      combatLevel: combatLevel || "",
      combatStrength: combatStrength || "",
      combatDmgType: combatDmgType || "",
      combatDmgPercent: combatDmgPercent || "",
      combatImpact: combatImpact || "",
      combatCryonae: combatCryonae || "",
      combatArborae: combatArborae || "",
      combatTempestae: combatTempestae || "",
      combatInfernae: combatInfernae || "",
      combatNecromae: combatNecromae || "",
      rarity: rarity || ""
    };
    // DEBUG: Log all combat field values before submitting
    // eslint-disable-next-line no-console
    console.log('[ListingForm DEBUG] Submitting listing:', {
      combatCategory,
      combatLevel,
      combatStrength,
      combatDmgType,
      combatDmgPercent,
      combatImpact,
      combatCryonae,
      combatArborae,
      combatTempestae,
      combatInfernae,
      combatNecromae,
      rarity
    });
    // DEBUG: Log the full listing object being sent to backend
    // eslint-disable-next-line no-console
    console.log('[ListingForm DEBUG] Full listing object:', listing);
    onSubmit(listing);
  };

  // Fetch item data from backend API
  const [itemData, setItemData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${config.API_URL}/items`);
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
  // Split items with multiple professions in Profession B into separate elements
  // Normalize Profession B to always be an array
  const normalizedItemData = itemData.map(i => {
    let professionsB = [];
    if (i["Profession B"]) {
      // Replace ' and ' with ',' and split, then trim
      professionsB = i["Profession B"]
        .replace(/\s+and\s+/gi, ',')
        .split(',')
        .map(prof => prof.trim())
        .filter(Boolean);
    }
    return {
      ...i,
      "Profession B": professionsB
    };
  });

  // Defensive: if item is accidentally set as an object, extract the name
  const itemName = typeof item === "object" && item !== null ? item.Items : item;
  const selected = normalizedItemData.find(i => i.Items === itemName);
  const isCombat = selected && (selected["Profession A"] === "Combat" || selected["Profession B"].includes("Combat"));

  // Clear rarity when combat category is not Weapon or Armor
  useEffect(() => {
    if (combatCategory && combatCategory !== "Weapon" && combatCategory !== "Armor") {
      setRarity("");
    }
  }, [combatCategory, setRarity]);

  // Clear rarity when item changes to non-combat item
  useEffect(() => {
    if (!isCombat) {
      setRarity("");
    }
  }, [isCombat, setRarity]);

  return (
    <div className={`mb-6 grid gap-3 max-w-4xl mx-auto ${darkMode ? 'bg-gray-800 border border-gray-800' : ''}`}> 
      {/* Item selection and type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 dark:text-white">Item</label>
        <div className="flex gap-2 items-center">
          <ItemDropdown 
            item={item}
            setItem={setItem}
            formError={formError}
            itemOptions={itemOptions}
          />
          <div className="relative flex-1 min-w-[120px] max-w-xs flex gap-2 items-center">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded dark:bg-gray-800 text-black dark:text-white min-w-[70px] w-fit text-sm h-10 px-2"
              style={{ width: '70px', minWidth: '70px', maxWidth: '90px' }}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-20 ml-2"
              placeholder="Qty"
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Price mode dropdown */}
      {/* Price mode dropdown moved to CurrencyInput */}

      {/* Currency inputs */}
      <div className="w-full flex">
        <CurrencyInput
          platinum={platinum}
          gold={gold}
          silver={silver}
          copper={copper}
          handleChange={handleChange}
          priceDisplayMode={priceDisplayMode}
          setPriceDisplayMode={setPriceDisplayMode}
        />
      </div>

      {/* Combat fields */}
      {isCombat && (
        <CombatFields
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
          formError={formError}
          darkMode={darkMode}
        />
      )}

      {/* IGN only */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 dark:text-white">IGN</label>
        <input
          type="text"
          value={IGN}
          onChange={(e) => {
            if (typeof setIGN === 'function') setIGN(e.target.value);
            if (typeof setContactInfo === 'function') setContactInfo(e.target.value);
          }}
          className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
          placeholder="In Game Name"
          maxLength="16"
        />
      </div>

      {/* Preview card only shown if item is selected */}
      {itemName && (
        <div className={`mt-8 rounded-lg overflow-hidden`}>
          <PreviewCard
            item={itemName}
            type={type}
            platinum={platinum}
            gold={gold}
            silver={silver}
            copper={copper}
            quantity={quantity}
            contactInfo={IGN}
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
            isListing={false}
            professionsB={selected ? selected["Profession B"] : []}
          />
        </div>
      )}
      {/* Submit and Cancel buttons below preview */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition text-white dark:text-white px-4 py-2 rounded"
        >
          {editingId ? "Update Listing" : "Post Listing"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-red-500 hover:bg-red-600 transition text-white dark:text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ListingForm;
