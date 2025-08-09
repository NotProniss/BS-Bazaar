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
  darkMode
}) => {
  // Fetch item data from backend
  const [itemOptions, setItemOptions] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const { BACKEND_URL, joinApiUrl } = require('../utils/api');
    const url = joinApiUrl(BACKEND_URL, 'items/meta/names');
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
        {/* PostHog tracking snippet */}
        <script>
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){
              function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){
                t.push([e].concat(Array.prototype.slice.call(arguments,0)))
              }}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",
              (r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){
                var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e
              },u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once".split(" "),n=0;n<o.length;n++)g(u,o[n]);
              e._i.push([i,s,a])
            },e.__SV=1.2)}(document,window.posthog||[]);
            posthog.init('phc_vV4HuQIzRQreNNyewhxX8q7HN63wdfccHJHxTiXSRUm', {api_host: 'https://app.posthog.com'});
          `}
        </script>
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
        loggedInUser={null}
        darkMode={darkMode}
      />
    </div>
  </>
  );
}

export default PostPage;
