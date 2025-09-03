import React from 'react';
import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IGN,
  setIGN,
  notes,
  setNotes,
  priceMode,
  setPriceMode,
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
  addOrEditListing,
  editingId,
  resetForm,
  loggedInUser,
  darkMode
}) => {
  // Fetch item data from backend
  const [itemOptions, setItemOptions] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const { BACKEND_URL, joinApiUrl } = require('../utils/api');
    const url = joinApiUrl(BACKEND_URL, '/items/meta/names');
    fetch(url)
      .then(res => res.json())
      .then(data => setItemOptions(data))
      .catch(() => setItemOptions([]));
  }, []);

  // Wrap addOrEditListing to redirect after successful post
  const handleSubmit = async (listing) => {
    await addOrEditListing(listing);
    navigate('/alllistings');
  };

  return (
    <>
      <Helmet>
        <title>Post Listing - BS Bazaar</title>
      </Helmet>
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
        IGN={IGN}
        setIGN={setIGN}
        contactInfo={null}
        setContactInfo={() => {}}
        notes={notes}
        setNotes={setNotes}
        priceDisplayMode={priceMode}
        setPriceDisplayMode={setPriceMode}
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
        onSubmit={handleSubmit}
        onCancel={resetForm}
        loggedInUser={loggedInUser}
        darkMode={darkMode}
      />
    </div>
  </>
  );
}

export default PostPage;
