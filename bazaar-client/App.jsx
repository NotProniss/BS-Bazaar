import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminDashboard from './AdminDashboard';

function App() {
  const [listings, setListings] = useState([]);
  const [type, setType] = useState('buy');
  const [item, setItem] = useState('');
  const [platinum, setPlatinum] = useState('');
  const [gold, setGold] = useState('');
  const [silver, setSilver] = useState('');
  const [copper, setCopper] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const fetchListings = async () => {
    try {
      const res = await axios.get('http://localhost:3001/listings');
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  useEffect(() => {
    fetchListings();

    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setLoggedInUser(payload.username);
      } catch (err) {
        console.warn('Invalid token in localStorage');
        localStorage.removeItem('jwtToken');
        setLoggedInUser(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setLoggedInUser(null);
  };

  const resetForm = () => {
    setItem('');
    setPlatinum('');
    setGold('');
    setSilver('');
    setCopper('');
    setQuantity('');
    setCategory('');
    setType('buy');
    setEditingId(null);
  };

  const addOrEditListing = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('You must be logged in!');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const totalPrice = Number(platinum) * 1000 + Number(gold) * 100 + Number(silver) * 10 + Number(copper);

    const listingData = {
      item,
      price: totalPrice,
      quantity: Number(quantity),
      seller: loggedInUser,
      type,
      category,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/listings/${editingId}`, listingData, config);
      } else {
        await axios.post('http://localhost:3001/listings', listingData, config);
      }
      resetForm();
      fetchListings();
    } catch (err) {
      console.error('Error saving listing:', err);
      alert('Failed to save listing');
    }
  };

  const deleteListing = async (id) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      alert('You must be logged in!');
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchListings();
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const startEditing = (listing) => {
    setItem(listing.item);
    const price = listing.price;
    setPlatinum(Math.floor(price / 1000));
    setGold(Math.floor((price % 1000) / 100));
    setSilver(Math.floor((price % 100) / 10));
    setCopper(price % 10);
    setQuantity(listing.quantity);
    setType(listing.type);
    setCategory(listing.category);
    setEditingId(listing.id);
  };

  const filteredListings = listings
    .filter(
      (listing) =>
        listing.item.toLowerCase().includes(search.toLowerCase()) &&
        (filterType === 'all' || listing.type === filterType) &&
        (filterCategory === 'all' || listing.category.toLowerCase() === filterCategory.toLowerCase())
    )
    .sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));

  const uniqueCategories = ['all', ...new Set(listings.map((l) => l.category))];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Brighter Shores Marketplace</h1>

        {!loggedInUser ? (
          <div className="mb-6 text-center">
            <a
              href="http://localhost:3001/auth/discord"
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-6 py-2 rounded-full"
            >
              Login with Discord
            </a>
          </div>
        ) : (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-700">Welcome, <strong>{loggedInUser}</strong></p>
            <button className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded" onClick={logout}>
              Logout
            </button>
          </div>
        )}

        {loggedInUser && (
          <div className="mb-6 grid gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Item Name"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Platinum"
                type="number"
                value={platinum}
                onChange={(e) => setPlatinum(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Gold"
                type="number"
                value={gold}
                onChange={(e) => setGold(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Silver"
                type="number"
                value={silver}
                onChange={(e) => setSilver(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Copper"
                type="number"
                value={copper}
                onChange={(e) => setCopper(e.target.value)}
              />
            </div>
            <input
              className="border p-2 rounded"
              placeholder="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <input
              className="border p-2 rounded"
              placeholder="Category (e.g., Weapon, Potion)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <select className="border p-2 rounded" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <div className="flex gap-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onClick={addOrEditListing}>
                {editingId ? 'Update Listing' : 'Post Listing'}
              </button>
              {editingId && (
                <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <input
            className="border p-2 rounded"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="border p-2 rounded" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select className="border p-2 rounded" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select className="border p-2 rounded" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>

        <h2 className="text-xl font-semibold mb-4">Current Listings</h2>
        <ul className="space-y-4">
          {filteredListings.map((listing) => (
            <li
              key={listing.id}
              className="bg-gray-50 border rounded-xl p-4 shadow-sm flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-lg">{listing.item} <span className="text-sm text-gray-500">({listing.category})</span></p>
                <p className="text-sm text-gray-700">
                  x{listing.quantity} - <span className="uppercase font-semibold">{listing.type}</span> for{' '}
                  <span className="font-semibold text-green-600">
                    {Math.floor(listing.price / 1000)}p {Math.floor((listing.price % 1000) / 100)}g{' '}
                    {Math.floor((listing.price % 100) / 10)}s {listing.price % 10}c
                  </span>
                  <br />by <span className="font-semibold text-blue-700">{listing.seller}</span>
                </p>
              </div>
              {loggedInUser === listing.seller && (
                <div className="flex gap-2 text-sm">
                  <button className="text-blue-600 hover:underline" onClick={() => startEditing(listing)}>
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline" onClick={() => deleteListing(listing.id)}>
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/*{loggedInUser && <AdminDashboard onRefreshListings={fetchListings} />} */}
      </div>
    </div>
  );
}

export default App;
