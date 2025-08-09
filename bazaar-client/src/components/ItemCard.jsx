import React, { useEffect, useState } from 'react';
import config from '../config';
import { professionImages, dmgTypeImages, currencyImages, episodeImages } from '../utils/constants';
import { calculateTotalCopper, formatTimeAgo } from '../utils/helpers';

function ItemCard(props) {
  const {
    item,
    type,
    platinum,
    gold,
    silver,
    copper,
    quantity,
    IGN,
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
    listing,
    onEdit,
    onDelete,
    isListing = false,
    timestamp
  } = props;

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
  if (!item) return null;
  const itemInfo = itemData.find(i => i.Items === item);
  // Prefer combat/profession fields from listing if present, else fallback to itemInfo
  const getField = (field) => (listing && listing[field] !== undefined ? listing[field] : itemInfo ? itemInfo[field] : undefined);
  // Only declare these once!
  const isCombat = getField("Profession A") === "Combat" || getField("Profession B") === "Combat";
  // For professionsB array, prefer listing then itemInfo
  let professionsB = [];
  const profBString = getField("Profession B");
  if (profBString && typeof profBString === "string") {
    professionsB = profBString.split(/[,/]/).map(p => p.trim()).filter(p => p && p !== "Combat" && p !== "None" && p !== getField("Profession A"));
    professionsB = [...new Set(professionsB)];
  }
  // Use getField inline for combat/profession fields below
  const totalCopper = calculateTotalCopper(platinum, gold, silver, copper);

  // Price formatter
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

  // Calculate prices
  const qty = Number(quantity) || 1;
  let eachPrice, totalPrice;
  if (priceDisplayMode === "Total") {
    totalPrice = totalCopper;
    eachPrice = qty > 0 ? Math.floor(totalPrice / qty) : 0;
  } else {
    eachPrice = totalCopper;
    totalPrice = eachPrice * qty;
  }

  // Get item data for image
  const currentItemData = itemData.find(i => i.Items === item);
  // Always use backend-provided Image field, fallback to placeholder only
  const itemImageUrl = currentItemData?.Image || "/placeholder.svg";

  // Shared components
  const ItemImage = () => (
    <div className="relative">
      <img 
        src={itemImageUrl} 
        alt={item} 
        title={item}
        className="w-16 h-16 rounded border object-contain bg-white" 
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
      
      {/* Discord username - always show */}
      {/* <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap" title={isListing ? (listing?.seller || loggedInUser || "Anonymous") : (loggedInUser || "Anonymous")}>
        {isListing ? (listing?.seller || loggedInUser || "Anonymous") : (loggedInUser || "Anonymous")}
      </div> */}
      
      {/* IGN - show if IGN exists, regardless of listing/preview mode */}
      {IGN && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all max-w-[80px]">
          IGN: {IGN}
        </div>
      )}
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
      {isListing ? (
        /* Listing Mode */
        <li
          className={
            `border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch relative gap-4 ` +
            (darkMode ? 'text-white bg-[#1f2937]' : 'text-black bg-[#f9fafb]')
          }
          style={{ minHeight: '200px' }}
        >
          <div className="flex flex-row gap-4 flex-1 min-w-0 items-stretch">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative">
                <img
                  src={itemImageUrl}
                  alt={item}
                  title={item}
                  className={"w-16 h-16 rounded border object-contain " + (darkMode ? "bg-gray-900" : "bg-white")}
                />
              </div>
              <QuantityTypeUser />
            </div>
            <div className="flex flex-col min-w-0 flex-1 h-full">
              {/* Top content area that can expand */}
              <div className="flex-1 min-h-0">
                <ItemTitle />
                {!isCombat && (
                  <div className="mt-2 text-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                      {getField("Episode") && getField("Episode") !== "None" && (
                        <div className={`inline-flex items-center gap-1 border-2 rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${
                          getField("Episode") === 'Hopeforest' ? 'border-green-500' :
                          getField("Episode") === 'Hopeport' ? 'border-yellow-500' :
                          getField("Episode") === 'Mine of Mantuban' ? 'border-blue-500' :
                          getField("Episode") === 'Crenopolis' ? 'border-gray-500' :
                          getField("Episode") === 'Stonemaw Hill' ? 'border-orange-500' :
                          'border-gray-300'
                        }`}>
                          {episodeImages[getField("Episode")] && (
                            <img src={episodeImages[getField("Episode")]} alt={getField("Episode")} title={getField("Episode")} className="h-3 w-3 object-contain flex-shrink-0" />
                          )}
                          <span className="font-semibold text-xs">{getField("Episode")}</span>
                        </div>
                      )}
                      {getField("Profession A") && getField("Profession A") !== "Combat" && getField("Profession A") !== "None" && (
                        <div className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {professionImages[getField("Profession A")] && (
                            <img src={professionImages[getField("Profession A")]} alt={getField("Profession A")} title={getField("Profession A")} className="h-3 w-3 object-contain flex-shrink-0" />
                          )}
                          <span className="font-semibold text-xs">
                            {getField("Profession A")}: {getField("Profession Level A") || "0"}
                          </span>
                        </div>
                      )}
                      {Array.isArray(professionsB) && professionsB.map((prof, idx) => (
                        <div key={prof + idx} className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {professionImages[prof] && (
                            <img src={professionImages[prof]} alt={prof} title={prof} className="h-3 w-3 object-contain flex-shrink-0" />
                          )}
                          <span className="font-semibold text-xs">
                            {prof}: {getField("Profession Level B") || "0"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Combat level and rarity for combat items */}
                {isCombat && (
                  <div className="mt-1">
                    {/* Combat level */}
                    <div className="mb-2">
                      <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                        {professionImages.Combat && (
                          <img src={professionImages.Combat} alt="Combat" title="Combat" className="h-4 w-4 object-contain flex-shrink-0" />
                        )}
                        <span className="font-semibold text-sm">{combatLevel || "-"}</span>
                      </div>
                    </div>
                    {/* Rarity display for weapons and armor */}
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
              {isListing && loggedInUser && listing?.seller &&
                listing.seller.trim().toLowerCase() === loggedInUser.trim().toLowerCase() && (
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
      ) : (
        /* Preview Mode - keep existing preview layout */
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-center">Preview</h2>
          <li className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4" style={{ minHeight: '200px' }}>
            <div className="flex flex-row gap-4 flex-1 min-w-0 items-stretch">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <ItemImage />
                <QuantityTypeUser />
              </div>
              <div className="flex flex-col min-w-0 flex-1 h-full">
                {/* Top content area that can expand */}
                <div className="flex-1 min-h-0">
                  <ItemTitle />
                  
                  {/* Preview content - similar to listing but without edit/delete */}
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
                        {itemInfo?.["Profession A"] && itemInfo["Profession A"] !== "Combat" && itemInfo["Profession A"] !== "None" && (
                          <div className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {professionImages[itemInfo["Profession A"]] && (
                              <img src={professionImages[itemInfo["Profession A"]]} alt={itemInfo["Profession A"]} title={itemInfo["Profession A"]} className="h-3 w-3 object-contain flex-shrink-0" />
                            )}
                            <span className="font-semibold text-xs">
                              {itemInfo["Profession A"]}: {itemInfo["Profession Level A"] || "0"}
                            </span>
                          </div>
                        )}
                        {itemInfo?.["Profession B"] && itemInfo["Profession B"] !== "Combat" && itemInfo["Profession B"] !== "None" && itemInfo["Profession B"] !== itemInfo["Profession A"] && (
                          <div className={`inline-flex items-center gap-1 border rounded px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {professionImages[itemInfo["Profession B"]] && (
                              <img src={professionImages[itemInfo["Profession B"]]} alt={itemInfo["Profession B"]} title={itemInfo["Profession B"]} className="h-3 w-3 object-contain flex-shrink-0" />
                            )}
                            <span className="font-semibold text-xs">
                              {itemInfo["Profession B"]}: {itemInfo["Profession Level B"] || "0"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Combat level and rarity for combat items */}
                  {isCombat && (
                    <div className="mt-1">
                      <div className="mb-2">
                        <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                          {professionImages.Combat && (
                            <img src={professionImages.Combat} alt="Combat" title="Combat" className="h-4 w-4 object-contain flex-shrink-0" />
                          )}
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
                  </div>
                )}
              </div>
            </div>
            
            {/* Preview right column: price at bottom */}
            <div className="flex flex-col min-w-[110px] self-stretch">
              {/* Spacer to push price to bottom */}
              <div className="flex-grow"></div>
              
              {/* Price at bottom */}
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
      )}
    </div>
  );
}

export default ItemCard;
