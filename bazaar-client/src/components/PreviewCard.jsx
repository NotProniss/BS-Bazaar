import React from 'react';
import config from '../config';
import { professionImages, dmgTypeImages, currencyImages, episodeImages } from '../utils/constants';
import { calculateTotalCopper, formatTimeAgo } from '../utils/helpers';

function PreviewCard(props) {
  const {
    item,
    type,
    platinum,
    gold,
    silver,
    copper,
    quantity,
    contactInfo,
    notes,
    priceDisplayMode,
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
    rarity,
    loggedInUser,
    darkMode,
    isListing = false,
    onEdit,
    onDelete,
    timestamp,
    professionsB = [],
  } = props;
  // Fetch item data from backend API
  const [itemData, setItemData] = React.useState([]);
  React.useEffect(() => {
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
  // Use backend item data for static info, but use props for preview fields
  const itemInfo = itemData.find(i => i.Items === item) || {};
  // Use props for preview mode (isListing === false)
  const previewCombatCategory = isListing ? itemInfo["Combat Category"] : combatCategory;
  const previewCombatLevel = isListing ? itemInfo["Combat Level"] : combatLevel;
  const previewCombatStrength = isListing ? itemInfo["Strength"] : combatStrength;
  const previewCombatDmgType = isListing ? itemInfo["Damage Type"] : combatDmgType;
  const previewCombatDmgPercent = isListing ? itemInfo["Damage %"] : combatDmgPercent;
  const previewCombatImpact = isListing ? itemInfo["Impact"] : combatImpact;
  const previewCombatCryonae = isListing ? itemInfo["Cryonae"] : combatCryonae;
  const previewCombatArborae = isListing ? itemInfo["Arborae"] : combatArborae;
  const previewCombatTempestae = isListing ? itemInfo["Tempestae"] : combatTempestae;
  const previewCombatInfernae = isListing ? itemInfo["Infernae"] : combatInfernae;
  const previewCombatNecromae = isListing ? itemInfo["Necromae"] : combatNecromae;
  const previewRarity = isListing ? itemInfo["Rarity"] : rarity;
  const isCombat = isListing
    ? (itemInfo["Profession A"] === "Combat" || itemInfo["Profession B"] === "Combat")
    : (combatCategory === "Weapon" || combatCategory === "Armor" || combatCategory === "Combat");
  const enteredCopper = calculateTotalCopper(platinum, gold, silver, copper);

  // Medium price formatter for preview cards
  const formatPriceMedium = (totalCopper) => {
    const platinum = Math.floor(totalCopper / 1000000000);
    const gold = Math.floor((totalCopper % 1000000000) / 1000000);
    const silver = Math.floor((totalCopper % 1000000) / 1000);
    const copper = totalCopper % 1000;
    const parts = [];
    if (platinum) parts.push(
      <span key="Platinum" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600, lineHeight: 1}}>
        {platinum}
        <img src={currencyImages.platinum || "/placeholder.svg"} alt="Platinum" title="Platinum" style={{height: '1.25em', width: '1.25em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    );
    if (gold) parts.push(
      <span key="Gold" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600, lineHeight: 1}}>
        {gold}
        <img src={currencyImages.gold || "/placeholder.svg"} alt="Gold" title="Gold" style={{height: '1.25em', width: '1.25em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    );
    if (silver) parts.push(
      <span key="Silver" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600, lineHeight: 1}}>
        {silver}
        <img src={currencyImages.silver || "/placeholder.svg"} alt="Silver" title="Silver" style={{height: '1.25em', width: '1.25em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    );
    if (copper || parts.length === 0) parts.push(
      <span key="Copper" style={{display: 'inline-flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600, lineHeight: 1}}>
        {copper}
        <img src={currencyImages.copper || "/placeholder.svg"} alt="Copper" title="Copper" style={{height: '1.25em', width: '1.25em', marginLeft: '0.25em', objectFit: 'contain', flexShrink: 0}} />
      </span>
    );
    return <>{parts}</>;
  };

  let eachPrice, totalPrice;
  const qty = Number(quantity) || 1;
  if (priceDisplayMode === "Total") {
    totalPrice = enteredCopper;
    eachPrice = qty > 0 ? Math.floor(totalPrice / qty) : 0;
  } else {
    eachPrice = enteredCopper;
    totalPrice = eachPrice * qty;
  }
  const currentItemData = itemData.find(i => i.Items === item);
  const itemImageUrl = currentItemData?.Image || "/placeholder.svg";

  // Shared components
  const ItemImage = () => (
    <div className="relative">
      <img 
        src={itemImageUrl} 
        alt={item} 
        title={item}
        className={`w-16 h-16 rounded border object-contain ${darkMode ? 'bg-gray-900' : 'bg-white'} ${darkMode ? 'text-white' : 'text-black'}`}
      />
    </div>
  );

  const QuantityTypeUser = () => (
    <div className="text-center">
      <div className="text-lg font-semibold mb-1">{quantity}x</div>
      <div className={`px-2 py-1 rounded text-xs font-bold ${
        type === "buy" 
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}>
        {type === "buy" ? "Buying" : "Selling"}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all max-w-[80px]">
        IGN: {contactInfo || "(none)"}
      </div>
    </div>
  );

  const ItemTitle = () => (
    <div className="mb-2">
      <h3 className={
        `text-xl font-bold break-words ` +
        (darkMode ? 'text-white' : 'text-gray-900')
      }>
        {item}
      </h3>
    </div>
  );

  return (
    <div className="mb-6">
      <li
        className={`border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch relative gap-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}
        style={{ minHeight: '200px', background: darkMode ? '#1a202c' : undefined, color: darkMode ? '#fff' : undefined }}
      >
        <div className="flex flex-row gap-4 flex-1 min-w-0 items-stretch">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <ItemImage />
            <QuantityTypeUser />
          </div>
          <div className="flex flex-col min-w-0 flex-1 h-full">
            <div className="flex-1 min-h-0">
              <ItemTitle />
              {/* Episode and profession information for non-combat items */}
              {!isCombat && (
                <div className="mt-2 text-sm">
                  <div className="flex flex-wrap gap-2 items-center">
                    {itemInfo?.Episode && itemInfo.Episode !== "None" && (
                      <div className={`inline-flex items-center gap-1 border-2 rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${
                        itemInfo.Episode === 'Hopeforest' ? 'border-green-500' :
                        itemInfo.Episode === 'Hopeport' ? 'border-yellow-500' :
                        itemInfo.Episode === 'Mine of Mantuban' ? 'border-blue-500' :
                        itemInfo.Episode === 'Crenopolis' ? 'border-gray-500' :
                        itemInfo.Episode === 'Stonemaw Hill' ? 'border-orange-500' :
                        'border-gray-300'
                      }`}>
                        {episodeImages[itemInfo.Episode] && (
                          <img src={episodeImages[itemInfo.Episode]} alt={itemInfo.Episode} title={itemInfo.Episode} className="h-3 w-3 object-contain flex-shrink-0" />
                        )}
                        <span className="font-semibold text-xs">{itemInfo.Episode}</span>
                      </div>
                    )}
                    {itemInfo?.["Profession A"] && itemInfo["Profession A"] !== "Combat" && itemInfo["Profession A"] !== "None" && !isCombat && (
                      <div className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {professionImages[itemInfo["Profession A"]] && (
                          <img src={professionImages[itemInfo["Profession A"]]} alt={itemInfo["Profession A"]} title={itemInfo["Profession A"]} className="h-3 w-3 object-contain flex-shrink-0" />
                        )}
                        <span className="font-semibold text-xs">
                          {itemInfo["Profession A"]}: {itemInfo["Profession Level A"] || "0"}
                        </span>
                      </div>
                    )}
                    {Array.isArray(professionsB) && professionsB.filter(p => p !== "Combat" && p !== "None" && p !== itemInfo["Profession A"]).map((prof, idx) => (
                      <div key={prof + idx} className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {professionImages[prof] && (
                          <img src={professionImages[prof]} alt={prof} title={prof} className="h-3 w-3 object-contain flex-shrink-0" />
                        )}
                        <span className="font-semibold text-xs">
                          {prof}: {itemInfo["Profession Level B"] || "0"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
            )}
            {/* Profession B display logic (below Profession A) */}
            {professionsB && professionsB.length > 0 && !isCombat && (
              <div className="flex flex-wrap gap-1 mt-1">
                {professionsB.filter(p => p !== "Combat").map((prof, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold">
                    {prof}
                  </span>
                ))}
              </div>
            )}
            {isCombat && (
              <div className="mt-1">
                <div className="mb-2">
                <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                  <img src={require("../assets/Combat.png")} alt="Combat" title="Combat" className="h-5 w-5 object-contain" />
                  <span className="font-semibold text-sm">{combatLevel || "-"}</span>
                  </div>
                </div>
                {rarity && (combatCategory === "Weapon" || combatCategory === "Armor") && (
                  <div className="mb-2">
                    <div className={`inline-flex items-center gap-2 border rounded px-2 py-1 text-xs font-semibold ${
                      rarity === "Rare" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700" :
                      rarity === "Uncommon" ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700" :
                      "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                    }`}>
                      {rarity}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Notes - show if notes exist and are not empty */}
            {notes && notes.trim() && (
              <div className="mt-2 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-xs">Notes:</div>
                  <div className="text-gray-700 dark:text-gray-300 text-xs break-words">{notes.trim()}</div>
                </div>
              </div>
            )}
            </div>
            {/* Combat stats anchored to bottom for weapons and armor */}
            {isCombat && (combatCategory === "Weapon" || combatCategory === "Armor") && (
              <div className="flex-shrink-0 mt-auto">
                {combatCategory === "Weapon" && (
                  <div className="text-sm">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center border p-2 rounded dark:bg-gray-800 text-black dark:text-white">
                        <img src={require("../assets/Strength.png")} alt="Strength" title="Strength" className="h-4 w-4 object-contain flex-shrink-0 mr-2" />
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
                )}
                {combatCategory === "Armor" && (
                  <div className="text-sm">
                    <div className="flex flex-wrap gap-2">
                      {['Impact', 'Cryonae', 'Arborae', 'Tempestae', 'Infernae', 'Necromae'].map(type => {
                        const value = type === "Impact" ? combatImpact :
                                    type === "Cryonae" ? combatCryonae :
                                    type === "Arborae" ? combatArborae :
                                    type === "Tempestae" ? combatTempestae :
                                    type === "Infernae" ? combatInfernae :
                                    type === "Necromae" ? combatNecromae : null;
                        if (!value || value === "None" || value === "-" || value === "") {
                          return null;
                        }
                        return (
                          <div key={type} className="flex items-center border p-1 rounded dark:bg-gray-800 text-black dark:text-white" style={{fontSize: '0.8em'}}>
                            <img src={dmgTypeImages[type]} alt={type} title={type} className="h-3 w-3 object-contain flex-shrink-0 mr-1" />
                            <span className="font-bold text-xs whitespace-nowrap">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Right column: edit/delete at top, price at bottom */}
        <div className="flex flex-col min-w-[140px] self-stretch">
          {/* Top section: edit/delete buttons and timestamp */}
          <div className="flex flex-col items-end">
            {/* Edit/Delete buttons for user's listings */}
            {isListing && loggedInUser && contactInfo === loggedInUser && (
              <div className="flex gap-2 mb-2">
                <div className="relative group">
                  <button
                    onClick={onEdit}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors cursor-pointer border border-blue-600 hover:border-blue-800 dark:border-blue-400 dark:hover:border-blue-200 rounded w-8 h-8 flex items-center justify-center"
                    aria-label="Edit listing"
                  >
                    ✎
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Edit
                  </div>
                </div>
                <div className="relative group">
                  <button
                    onClick={onDelete}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors cursor-pointer border border-red-600 hover:border-red-800 dark:border-red-400 dark:hover:border-red-200 rounded w-8 h-8 flex items-center justify-center"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Delete
                  </div>
                </div>
              </div>
            )}
            {/* Timestamp below edit/delete buttons */}
            {isListing && timestamp && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {formatTimeAgo(timestamp)}
              </div>
            )}
          </div>
          {/* Spacer to push price to bottom */}
          <div className="flex-grow"></div>
          {/* Bottom section: price */}
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
                  {formatPriceMedium(eachPrice)}
                  <span className="text-xs font-normal text-gray-400">each</span>
                </div>
                {quantity && Number(quantity) > 1 && (
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                    {formatPriceMedium(totalPrice)}
                    <span className="text-xs font-normal text-gray-400">total</span>
                  </div>
                )}
              </div>
            </span>
          </div>
        </div>
      </li>
    </div>
  );
}

export default PreviewCard;
