import React from 'react';
import { Helmet } from 'react-helmet';
import ItemCard from '../components/ItemCard';

const ListingsPage = ({
  listings,
  search,
  setSearch,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  uniqueCategories,
  filteredListings,
  loggedInUser,
  startEditing,
  deleteListing,
  darkMode
}) => {
  // Local sortOrder state to always default to 'new'
  const [sortOrder, setSortOrder] = React.useState('new');
  // Episode and profession filter state
  const [episodeFilter, setEpisodeFilter] = React.useState('all');
  const [professionFilter, setProfessionFilter] = React.useState('all');
  // Pagination state
  const [visibleListings, setVisibleListings] = React.useState(10);
  const LISTINGS_PER_PAGE = 10;

  // Reset visible listings when filters change
  React.useEffect(() => {
    setVisibleListings(10);
  }, [search, filterType, episodeFilter, professionFilter, sortOrder]);
  // Fetch item data from backend API
  const [itemData, setItemData] = React.useState([]);
  React.useEffect(() => {
    async function fetchData() {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
        const res = await fetch(`${BACKEND_URL}/api/items`);
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
  // Ordered episode list
  const episodeOrder = [
    'Hopeport',
    'Hopeforest',
    'Mine of Mantuban',
    'Crenopolis',
    'Stonemaw Hill'
  ];
  const hasGlobal = itemData.some(i => i.Episode === 'Global');
  const uniqueEpisodes = ['all', ...episodeOrder.filter(ep => itemData.some(i => i.Episode === ep)), ...(hasGlobal ? ['Global'] : [])];
  // Ordered profession list
  const professionOrder = [
    'Combat',
    'Forager',
    'Fisher',
    'Chef',
    'Alchemist',
    'Gatherer',
    'Woodcutter',
    'Carpenter',
    'Miner',
    'Bonewright',
    'Blacksmith',
    'Stonemason',
    'Detective',
    'Leatherworker',
    'Merchant'
  ];
  const uniqueProfessions = ['all', ...professionOrder.filter(prof => [
    ...itemData.map(i => i['Profession A']),
    ...itemData.map(i => i['Profession B'])
  ].includes(prof))];

  // Helper to get image src for episode/profession
  const getEpisodeImage = (ep) => {
    if (ep === 'all') return require('../assets/wiki.png');
    try {
      return require(`../assets/${ep.replace(/\s/g, '_')}.png`);
    } catch {
      return require('../assets/wiki.png');
    }
  };
  const getProfessionImage = (prof) => {
    if (prof === 'all') return require('../assets/None.png');
    try {
      return require(`../assets/${prof.replace(/\s/g, '_')}.png`);
    } catch {
      return require('../assets/None.png');
    }
  };
  // Custom dropdown state
  const [showEpisodeDropdown, setShowEpisodeDropdown] = React.useState(false);
  const [showProfessionDropdown, setShowProfessionDropdown] = React.useState(false);

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
    <div>
      <h2 className={darkMode ? "text-5xl font-bold text-white text-center mb-6" : "text-5xl font-bold text-gray-900 text-center mb-6"}>Current Listings</h2>
      <div className="mb-4 flex flex-col gap-2 md:gap-4 justify-between items-center">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            id="search"
            className={`border rounded px-3 py-2 w-full md:w-48 ${darkMode ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            id="type"
            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select
            id="sort"
            className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="asc">Price: Low to High (each)</option>
            <option value="desc">Price: High to Low (each)</option>
            <option value="totalasc">Price: Low to High (total)</option>
            <option value="totaldesc">Price: High to Low (total)</option>
            <option value="new">Time: New to Old</option>
            <option value="old">Time: Old to New</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* Custom Episode Dropdown */}
          <div className="relative">
            <button
              type="button"
              className={`border rounded px-3 py-2 flex items-center min-w-[140px] ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              onClick={() => setShowEpisodeDropdown((v) => !v)}
            >
              {episodeFilter === 'all' ? 'All Episodes' : (
                <>
                  <img src={getEpisodeImage(episodeFilter)} alt={episodeFilter} style={{ width: 20, height: 20, marginRight: 6 }} />
                  {episodeFilter}
                </>
              )}
              <span className="ml-auto">▼</span>
            </button>
            {showEpisodeDropdown && (
              <div className={`absolute z-10 left-0 mt-1 w-full rounded shadow-lg max-h-60 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}> 
                {uniqueEpisodes.map(ep => (
                  <div
                    key={ep}
                    className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                    onClick={() => { setEpisodeFilter(ep); setShowEpisodeDropdown(false); }}
                  >
                    {ep === 'all' ? 'All Episodes' : (
                      <>
                        <img src={getEpisodeImage(ep)} alt={ep} style={{ width: 20, height: 20, objectFit: 'contain', marginRight: 6 }} />
                        {ep}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Profession Dropdown */}
          <div className="relative">
            <button
              type="button"
              className={`border rounded px-3 py-2 flex items-center min-w-[140px] ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              onClick={() => setShowProfessionDropdown((v) => !v)}
            >
              {professionFilter === 'all' ? 'All Professions' : (
                <>
                  <img src={getProfessionImage(professionFilter)} alt={professionFilter} style={{ width: 20, height: 20, objectFit: 'contain', marginRight: 6 }} />
                  {professionFilter}
                </>
              )}
              <span className="ml-auto">▼</span>
            </button>
            {showProfessionDropdown && (
              <div className={`absolute z-10 left-0 mt-1 w-full rounded shadow-lg max-h-60 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border`}> 
                {uniqueProfessions.map(prof => (
                  <div
                    key={prof}
                    className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700' : ''}`}
                    onClick={() => { setProfessionFilter(prof); setShowProfessionDropdown(false); }}
                  >
                    {prof === 'all' ? 'All Professions' : (
                      <>
                        <img src={getProfessionImage(prof)} alt={prof} style={{ width: 20, height: 20, objectFit: 'contain', marginRight: 6 }} />
                        {prof}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Listings summary */}
      <div className={darkMode ? "text-xs font-medium text-white text-right mb-2 pr-2" : "text-xs font-medium text-gray-700 text-right mb-2 pr-2"}>
        {(() => {
          const activeCount = filteredListings.filter(listing => {
            const itemInfo = itemData.find(i => i.Items === listing.item);
            const matchesEpisode = episodeFilter === 'all' || (itemInfo && itemInfo.Episode === episodeFilter);
            const matchesProfession = professionFilter === 'all' || (itemInfo && [itemInfo['Profession A'], itemInfo['Profession B']].includes(professionFilter));
            return matchesEpisode && matchesProfession;
          }).length;
          return `${activeCount} Active Listings`;
        })()}
      </div>
      <div>
        {/* Filter listings by episode and profession */}
        {filteredListings.filter(listing => {
          const itemInfo = itemData.find(i => i.Items === listing.item);
          const matchesEpisode = episodeFilter === 'all' || (itemInfo && itemInfo.Episode === episodeFilter);
          const matchesProfession = professionFilter === 'all' || (itemInfo && [itemInfo['Profession A'], itemInfo['Profession B']].includes(professionFilter));
          return matchesEpisode && matchesProfession;
        }).length === 0 ? (
          <div className="text-center text-gray-500">No listings found.</div>
        ) : (
          (() => {
            const filteredAndSortedListings = filteredListings
              .filter(listing => {
                const itemInfo = itemData.find(i => i.Items === listing.item);
                const matchesEpisode = episodeFilter === 'all' || (itemInfo && itemInfo.Episode === episodeFilter);
                const matchesProfession = professionFilter === 'all' || (itemInfo && [itemInfo['Profession A'], itemInfo['Profession B']].includes(professionFilter));
                return matchesEpisode && matchesProfession;
              })
              .sort((a, b) => {
                if (sortOrder === 'asc') {
                  return a.price - b.price;
                }
                if (sortOrder === 'desc') {
                  return b.price - a.price;
                }
                if (sortOrder === 'totalasc') {
                  return (a.price * a.quantity) - (b.price * b.quantity);
                }
                if (sortOrder === 'totaldesc') {
                  return (b.price * b.quantity) - (a.price * a.quantity);
                }
                if (sortOrder === 'old') {
                  return new Date(a.timestamp) - new Date(b.timestamp);
                }
                if (sortOrder === 'new') {
                  return new Date(b.timestamp) - new Date(a.timestamp);
                }
                return 0;
              });

            const visibleListingsArray = filteredAndSortedListings.slice(0, visibleListings);
            const hasMoreListings = filteredAndSortedListings.length > visibleListings;

            return (
              <>
                <ul className="divide-y">
                  {visibleListingsArray.map(listing => (
                    (() => {
                      const itemInfo = itemData.find(i => i.Items === listing.item) || {};
                      // ProfessionsB array logic (split, filter, dedupe)
                      let professionsB = [];
                      if (itemInfo["Profession B"] && typeof itemInfo["Profession B"] === "string") {
                        professionsB = itemInfo["Profession B"].split(/[,/]/).map(p => p.trim()).filter(p => p && p !== "Combat" && p !== "None" && p !== itemInfo["Profession A"]);
                        professionsB = [...new Set(professionsB)];
                      }
                      return (
                        <React.Fragment key={listing.id}>
                          <ItemCard
                            listing={listing}
                            item={listing.item}
                            type={listing.type}
                            platinum={Math.floor(listing.price / 1000000000)}
                            gold={Math.floor((listing.price % 1000000000) / 1000000)}
                            silver={Math.floor((listing.price % 1000000) / 1000)}
                            copper={listing.price % 1000}
                            quantity={listing.quantity}
                            IGN={listing.IGN}
                            notes={listing.notes}
                            combatLevel={listing.combatLevel || ""}
                            combatStrength={listing.combatStrength || ""}
                            rarity={listing.rarity || ""}
                            combatDmgType={listing.combatDmgType || ""}
                            combatDmgPercent={listing.combatDmgPercent || ""}
                            priceDisplayMode={listing.priceMode}
                            combatCategory={listing.combatCategory || ""}
                            combatImpact={listing.combatImpact || ""}
                            combatCryonae={listing.combatCryonae || ""}
                            combatArborae={listing.combatArborae || ""}
                            combatTempestae={listing.combatTempestae || ""}
                            combatInfernae={listing.combatInfernae || ""}
                            combatNecromae={listing.combatNecromae || ""}
                            loggedInUser={loggedInUser}
                            darkMode={darkMode}
                            isListing={true}
                            onEdit={
                              loggedInUser && listing.seller &&
                              listing.seller.trim().toLowerCase() === loggedInUser.trim().toLowerCase()
                                ? () => startEditing(listing)
                                : undefined
                            }
                            onDelete={
                              loggedInUser && listing.seller &&
                              listing.seller.trim().toLowerCase() === loggedInUser.trim().toLowerCase()
                                ? () => deleteListing(listing.id)
                                : undefined
                            }
                            timestamp={listing.timestamp}
                            professionsB={professionsB}
                          />
                        </React.Fragment>
                      );
                    })()
                  ))}
                </ul>
                
                {/* Show More button */}
                {hasMoreListings && (
                  <div className="text-center mt-6 mb-4">
                    <button
                      onClick={() => setVisibleListings(prev => prev + LISTINGS_PER_PAGE)}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Show More ({filteredAndSortedListings.length - visibleListings} remaining)
                    </button>
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>
      {console.log('DEBUG: First listing in filteredListings:', filteredListings[0])}
    </div>
    </>
  );
}
export default ListingsPage;
