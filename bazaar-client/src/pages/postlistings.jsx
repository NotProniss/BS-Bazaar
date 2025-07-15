import React from 'react';
import { useEffect, useState } from 'react';
import ListingForm from '../components/ListingForm';
// ...existing code...

const PostPage = ({
  item,
  setItem,
  platinum,
  setPlatinum,
  gold,
  setGold,
  silver,
  setSilver,
  copper,
  setCopper,
  quantity,
  setQuantity,
  category,
  setCategory,
  type,
  setType,
  addOrEditListing,
  editingId,
  resetForm,
  darkMode
}) => {
  // Fetch item data from backend
  const [itemOptions, setItemOptions] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3001/api/items/meta/names')
      .then(res => res.json())
      .then(data => setItemOptions(data))
      .catch(() => setItemOptions([]));
  }, []);

  const [priceDisplayMode, setPriceDisplayMode] = useState("Each");

  // Combat-related states
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

  return (
    <div className="space-y-6">
      <ListingForm
        item={item}
        setItem={setItem}
        type={type}
        setType={setType}
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
        contactInfo={null}
        setContactInfo={() => {}}
        priceDisplayMode={priceDisplayMode}
        setPriceDisplayMode={setPriceDisplayMode}
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
        combatLevel={combatLevel}
        setCombatLevel={setCombatLevel}
        combatCategory={combatCategory}
        setCombatCategory={setCombatCategory}
        rarity={rarity}
        setRarity={setRarity}
        editingId={editingId}
        formError={!item}
        successMessage={null}
        itemOptions={itemOptions}
        onSubmit={addOrEditListing}
        onCancel={resetForm}
        loggedInUser={null}
        darkMode={darkMode}
      />
    </div>
  );
}

export default PostPage;
