import React from 'react';
import config from '../config';
import { professionImages, dmgTypeImages, currencyImages, episodeImages } from '../utils/constants';
import { calculateTotalCopper, formatTimeAgo } from '../utils/helpers';

function PreviewCard({
  // Form props (for preview mode)
  item,
  type,
  platinum,
  gold,
  silver,
  copper,
  quantity,
  contactInfo,
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
  
  // Listing mode props
  onEdit,
  onDelete,
  isListing = false,
  timestamp
}) {
  if (!item) return null;

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
  const itemInfo = itemData.find(i => i.Items === item);
  const isCombat = itemInfo && (itemInfo["Profession A"] === "Combat" || itemInfo["Profession B"] === "Combat");
  const totalCopper = calculateTotalCopper(platinum, gold, silver, copper);

  // Medium price formatter for preview cards (slightly larger than listing cards but smaller than original)
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
  const eachPrice = totalCopper;
  const totalPrice = eachPrice * Number(quantity || 1);

  // Shared components
  const ItemImage = () => (
    <div className="relative">
      <img 
        src={require("../assets/placeholder.svg")} 
        alt={item} 
        title={item}
        className="w-16 h-16 rounded border object-contain bg-white" 
      />
    </div>
  );

  const QuantityTypeUser = () => (
    <div className="text-center">
      <div className="text-lg font-semibold mb-1">{quantity}x</div>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        type === "buy" 
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      }`}>
        {type === "buy" ? "Buying" : "Selling"}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 break-words max-w-[80px]">
        {contactInfo || loggedInUser || "Anonymous"}
      </div>
    </div>
  );

  const ItemTitle = () => (
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
        {item}
      </h3>
      {isListing && contactInfo && contactInfo !== loggedInUser && (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          by {contactInfo}
        </span>
      )}
    </div>
  );

  return (
    <div className="mb-6">
      {isListing ? (
        /* Listing Mode */
        <li className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4" style={{ minHeight: '160px' }}>
          <div className="flex flex-row gap-4 flex-1 min-w-0 items-start">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <ItemImage />
              <QuantityTypeUser />
            </div>
            <div className="flex flex-col justify-start min-w-0 flex-1">
              <ItemTitle />
              
              {/* Episode and profession information for non-combat items */}
              {!isCombat && (
                <div className="mt-2 text-sm">
                  <div className="flex flex-wrap gap-2 items-center">
                    {itemInfo?.Episode && itemInfo.Episode !== "None" && (
                      <div className={`inline-flex items-center gap-1 border-2 rounded px-2 py-1 bg-gray-100 dark:bg-gray-700 ${
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
                    {itemInfo?.["Profession A"] && itemInfo["Profession A"] !== "Combat" && (
                      <div className="inline-flex items-center gap-1 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                        {professionImages[itemInfo["Profession A"]] && (
                          <img src={professionImages[itemInfo["Profession A"]]} alt={itemInfo["Profession A"]} title={itemInfo["Profession A"]} className="h-3 w-3 object-contain flex-shrink-0" />
                        )}
                        <span className="font-semibold text-xs">
                          {itemInfo["Profession A"]}: {itemInfo["Profession Level A"] || "0"}
                        </span>
                      </div>
                    )}
                    {itemInfo?.["Profession B"] && itemInfo["Profession B"] !== "Combat" && itemInfo["Profession B"] !== itemInfo["Profession A"] && (
                      <div className="inline-flex items-center gap-1 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
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

              {/* Combat information */}
              {isCombat && (
                <div>
                  {/* Combat level */}
                  <div className="mt-1 mb-2">
                    <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                      {professionImages.Combat && (
                        <img src={professionImages.Combat} alt="Combat" title="Combat" className="h-4 w-4 object-contain flex-shrink-0" />
                      )}
                      <span className="font-semibold text-sm">{combatLevel || "-"}</span>
                    </div>
                  </div>
                  
                  {/* Rarity display for weapons and armor */}
                  {rarity && (combatCategory === "Weapon" || combatCategory === "Armor") && (
                    <div className="mt-1 mb-2">
                      <div className={`inline-flex items-center gap-2 border rounded px-2 py-1 text-xs font-semibold ${
                        rarity === "Rare" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700" :
                        rarity === "Uncommon" ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700" :
                        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                      }`}>
                        {rarity}
                      </div>
                    </div>
                  )}

                  {/* Combat stats based on category */}
                  {combatCategory === "Weapon" && (
                    <div className="mt-2 text-sm">
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
                    <div className="mt-2 text-sm">
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
          
          {/* Price and actions section */}
          <div className="flex flex-col items-end gap-2 min-w-[140px] justify-between">
            {/* Edit/Delete buttons for user's listings */}
            <div className="flex gap-2">
              {isListing && loggedInUser && contactInfo === loggedInUser && (
                <>
                  <button
                    onClick={onEdit}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
            
            {/* Timestamp for listings */}
            {isListing && timestamp && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {formatTimeAgo(timestamp)}
              </div>
            )}
            
            {/* Price section */}
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
          <li className="bg-gray-50 border rounded-xl p-4 shadow-sm flex flex-row justify-between items-stretch dark:bg-gray-800 text-black dark:text-white relative gap-4" style={{ minHeight: '160px' }}>
            <div className="flex flex-row gap-4 flex-1 min-w-0 items-start">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <ItemImage />
                <QuantityTypeUser />
              </div>
              <div className="flex flex-col justify-start min-w-0 flex-1">
                <ItemTitle />
                
                {/* Preview content - similar to listing but without edit/delete */}
                {!isCombat && (
                  <div className="mt-2 text-sm">
                    <div className="flex flex-wrap gap-2 items-center">
                      {itemInfo?.Episode && itemInfo.Episode !== "None" && (
                        <div className={`inline-flex items-center gap-1 border-2 rounded px-2 py-1 bg-gray-100 dark:bg-gray-700 ${
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
                      {itemInfo?.["Profession A"] && itemInfo["Profession A"] !== "Combat" && (
                        <div className="inline-flex items-center gap-1 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                          {professionImages[itemInfo["Profession A"]] && (
                            <img src={professionImages[itemInfo["Profession A"]]} alt={itemInfo["Profession A"]} title={itemInfo["Profession A"]} className="h-3 w-3 object-contain flex-shrink-0" />
                          )}
                          <span className="font-semibold text-xs">
                            {itemInfo["Profession A"]}: {itemInfo["Profession Level A"] || "0"}
                          </span>
                        </div>
                      )}
                      {itemInfo?.["Profession B"] && itemInfo["Profession B"] !== "Combat" && itemInfo["Profession B"] !== itemInfo["Profession A"] && (
                        <div className="inline-flex items-center gap-1 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
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

                {/* Combat preview */}
                {isCombat && (
                  <div>
                    <div className="mt-1 mb-2">
                      <div className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700">
                        {professionImages.Combat && (
                          <img src={professionImages.Combat} alt="Combat" title="Combat" className="h-4 w-4 object-contain flex-shrink-0" />
                        )}
                        <span className="font-semibold text-sm">{combatLevel || "-"}</span>
                      </div>
                    </div>
                    
                    {rarity && (combatCategory === "Weapon" || combatCategory === "Armor") && (
                      <div className="mt-1 mb-2">
                        <div className={`inline-flex items-center gap-2 border rounded px-2 py-1 text-xs font-semibold ${
                          rarity === "Rare" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700" :
                          rarity === "Uncommon" ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700" :
                          "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                        }`}>
                          {rarity}
                        </div>
                      </div>
                    )}

                    {combatCategory === "Armor" && (
                      <div className="mt-2 text-sm">
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
                      <div className="mt-2 text-sm">
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
            
            {/* Preview price section */}
            <div className="flex flex-col items-end gap-2 min-w-[110px] justify-between relative">
              <div></div>
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

export default PreviewCard;
