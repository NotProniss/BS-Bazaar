import React, { useEffect } from 'react';
import ItemDropdown from './ItemDropdown';
import CurrencyInput from './CurrencyInput';
import CombatFields from './CombatFields';
import { itemData } from '../utils/constants';
import { calculateTotalCopper } from '../utils/helpers';

function ListingForm({
  // Form state
  item, setItem,
  type, setType,
  platinum, setPlatinum,
  gold, setGold,
  silver, setSilver,
  copper, setCopper,
  quantity, setQuantity,
  contactInfo, setContactInfo,
  priceDisplayMode, setPriceDisplayMode,
  
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
  loggedInUser
}) {
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
    onSubmit(totalCopper);
  };

  const selected = itemData.find(i => i.Items === item);
  const isCombat = selected && (selected["Profession A"] === "Combat" || selected["Profession B"] === "Combat");

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
    <div className="mb-6 grid gap-3 max-w-4xl mx-auto">
      {/* Item selection and type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Item</label>
        <div className="flex gap-2">
          <ItemDropdown 
            item={item}
            setItem={setItem}
            formError={formError}
          />
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

      {/* Currency inputs */}
      <CurrencyInput
        platinum={platinum}
        gold={gold}
        silver={silver}
        copper={copper}
        handleChange={handleChange}
      />

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
        />
      )}

      {/* Quantity and IGN */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="border p-2 rounded dark:bg-gray-800 text-black dark:text-white w-full"
            placeholder="1"
            min="1"
            step="1"
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
            maxLength="16"
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

      {/* Submit and Cancel buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded"
        >
          {editingId ? "Update Listing" : "Post Listing"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ListingForm;
