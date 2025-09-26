import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ItemCard from '../components/ItemCard';
import CurrencyInput from '../components/CurrencyInput';
import Modal from '../components/Modal';
import UserLink from '../components/UserLink';
import { convertCopperToCurrency, formatPrice, formatPriceMedium, formatTimeAgo, calculateTotalCopper, getValidToken } from '../utils/helpers';
import { jwtDecode } from 'jwt-decode';

const ListingDetail = ({ loggedInUser, startEditing, deleteListing, darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPlatinum, setOfferPlatinum] = useState('0');
  const [offerGold, setOfferGold] = useState('0');
  const [offerSilver, setOfferSilver] = useState('0');
  const [offerCopper, setOfferCopper] = useState('0');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerPriceDisplayMode, setOfferPriceDisplayMode] = useState('Each');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showCancel: false
  });

  useEffect(() => {
    fetchListing();
    fetchOffers();
  }, [id]);

  // Modal helper functions
  const showModal = (type, title, message, onConfirm = null, showCancel = false) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      showCancel
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (message) => showModal('success', 'Success', message);
  const showError = (message) => showModal('error', 'Error', message);
  const showConfirm = (message, onConfirm) => showModal('confirm', 'Confirm Action', message, onConfirm, true);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      const response = await fetch(`${BACKEND_URL}/listings/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Listing not found');
          return;
        }
        throw new Error('Failed to fetch listing');
      }
      
      const data = await response.json();
      
      // Convert the price from total copper to individual currency components
      const currencyBreakdown = convertCopperToCurrency(data.price || 0);
      
      setListing({
        ...data,
        ...currencyBreakdown
      });
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      const response = await fetch(`${BACKEND_URL}/offers/listing/${id}`);
      
      if (response.ok) {
        const offersData = await response.json();
        setOffers(offersData);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  // Handle currency input changes for offers
  const handleOfferCurrencyChange = (e) => {
    const { name, value } = e.target;
    // Only allow positive numbers and max 3 digits
    let cleanValue = value.replace(/[^\d]/g, '').slice(0, 3);
    if (cleanValue === "") cleanValue = "0";
    cleanValue = Math.max(0, Math.min(999, Number(cleanValue))).toString();
    
    if (name === "Platinum") setOfferPlatinum(cleanValue);
    if (name === "Gold") setOfferGold(cleanValue);
    if (name === "Silver") setOfferSilver(cleanValue);
    if (name === "Copper") setOfferCopper(cleanValue);
  };

  const handleOfferCurrencyKeyPress = (e) => {
    // Prevent non-numeric input (except backspace, delete, arrow keys, etc.)
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const submitOffer = async () => {
    if (!loggedInUser) {
      showError('Please log in to make an offer');
      return;
    }

    const token = getValidToken();
    if (!token) {
      showError('Please log in again to make an offer');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    // Calculate total copper from currency inputs
    const totalCopper = calculateTotalCopper(
      parseFloat(offerPlatinum) || 0,
      parseFloat(offerGold) || 0,
      parseFloat(offerSilver) || 0,
      parseFloat(offerCopper) || 0
    );

    if (totalCopper <= 0) {
      showError('Please enter a valid offer amount');
      return;
    }

    try {
      setSubmittingOffer(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      
      const response = await fetch(`${BACKEND_URL}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: parseInt(id),
          offer_amount: totalCopper,
          message: offerMessage
        })
      });

      if (response.status === 401) {
        showError('Your session has expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }, 2000);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        setShowOfferForm(false);
        setOfferPlatinum('0');
        setOfferGold('0');
        setOfferSilver('0');
        setOfferCopper('0');
        setOfferMessage('');
        setOfferPriceDisplayMode('Each');
        fetchOffers(); // Refresh offers
        showSuccess('Offer submitted successfully!');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to submit offer');
      }
    } catch (err) {
      console.error('Error submitting offer:', err);
      showError('Failed to submit offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleOfferAction = async (offerId, action) => {
    if (!loggedInUser) {
      showError('Please log in to manage offers');
      return;
    }

    const token = getValidToken();
    if (!token) {
      showError('Please log in again to manage offers');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
      
      const response = await fetch(`${BACKEND_URL}/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.status === 401) {
        showError('Your session has expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }, 2000);
        return;
      }

      if (response.ok) {
        fetchOffers(); // Refresh offers
        showSuccess(`Offer ${action}ed successfully!`);
      } else {
        const errorData = await response.json();
        showError(errorData.error || `Failed to ${action} offer`);
      }
    } catch (err) {
      console.error(`Error ${action}ing offer:`, err);
      showError(`Failed to ${action} offer`);
    }
  };

  // Helper function to get current user ID from token
  const getCurrentUserId = () => {
    const token = getValidToken();
    if (!token) return null;
    
    try {
      const payload = jwtDecode(token);
      return payload.id;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  };

  const cancelOffer = async (offerId) => {
    if (!loggedInUser) {
      showError('Please log in to cancel offers');
      return;
    }

    const token = getValidToken();
    if (!token) {
      showError('Please log in again to cancel offers');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    showConfirm('Are you sure you want to cancel this offer?', async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '/api';
        
        const response = await fetch(`${BACKEND_URL}/offers/${offerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          showError('Your session has expired. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }, 2000);
          return;
        }

        if (response.ok) {
          fetchOffers(); // Refresh offers
          showSuccess('Offer cancelled successfully!');
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Failed to cancel offer');
        }
      } catch (err) {
        console.error('Error cancelling offer:', err);
        showError('Failed to cancel offer');
      }
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex flex-col`}>
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4">Loading listing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex flex-col`}>
        <Helmet>
          <title>Listing Not Found | BS Bazaar</title>
          <meta name="description" content="The requested listing could not be found." />
        </Helmet>
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="mb-6">{error || 'The listing you are looking for does not exist or has been removed.'}</p>
            <button
              onClick={() => navigate('/alllistings')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              Back to All Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} flex flex-col`}>
      <Helmet>
        <title>{`${listing.item} - ${formatPrice(listing.platinum, listing.gold, listing.silver, listing.copper)} | BS Bazaar`}</title>
        <meta name="description" content={`${listing.item} listing by ${listing.seller} - ${formatPrice(listing.platinum, listing.gold, listing.silver, listing.copper)} for ${listing.quantity}x on BS Bazaar`} />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={`${listing.item} - ${formatPrice(listing.platinum, listing.gold, listing.silver, listing.copper)} | BS Bazaar`} />
        <meta property="og:description" content={`${listing.item} listing by ${listing.seller} - ${formatPrice(listing.platinum, listing.gold, listing.silver, listing.copper)} for ${listing.quantity}x`} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BS Bazaar" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${listing.item} - ${formatPrice(listing.platinum, listing.gold, listing.silver, listing.copper)} | BS Bazaar`} />
        <meta name="twitter:description" content={`${listing.item} listing by ${listing.seller} - ${formatPrice(listing.platinum, listing.gold, listing.silver, listing.copper)} for ${listing.quantity}x`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/alllistings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-black'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Listings
          </button>
        </div>

        {/* Main listing content */}
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{listing.item}</h1>
          
          {/* Listing card */}
          <div className="mb-8">
            <ItemCard
              item={listing.item}
              type={listing.type}
              platinum={listing.platinum}
              gold={listing.gold}
              silver={listing.silver}
              copper={listing.copper}
              quantity={listing.quantity}
              notes={listing.notes}
              priceDisplayMode={listing.priceMode}
              combatCategory={listing.combatCategory}
              combatLevel={listing.combatLevel}
              combatStrength={listing.combatStrength}
              combatDmgType={listing.combatDmgType}
              combatDmgPercent={listing.combatDmgPercent}
              combatImpact={listing.combatImpact}
              combatCryonae={listing.combatCryonae}
              combatArborae={listing.combatArborae}
              combatTempestae={listing.combatTempestae}
              combatInfernae={listing.combatInfernae}
              combatNecromae={listing.combatNecromae}
              rarity={listing.rarity}
              loggedInUser={loggedInUser}
              darkMode={darkMode}
              isListing={true}
              onEdit={() => startEditing(listing)}
              onDelete={() => deleteListing(listing.id)}
              seller={listing.seller}
              sellerAvatar={listing.sellerAvatar}
              timestamp={listing.timestamp}
              userId={listing.userId}
              id={listing.id}
              IGN={listing.IGN}
              totalPrice={listing.totalPrice}
              contactInfo={listing.contactInfo}
            />
          </div>

          {/* Offers Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Offers</h2>
              {loggedInUser && listing && loggedInUser.id !== listing.userId && (
                <button
                  onClick={() => setShowOfferForm(!showOfferForm)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Make an Offer
                </button>
              )}
            </div>

            {/* Make Offer Form */}
            {showOfferForm && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg mb-4 border`}>
                <h3 className="font-semibold mb-3">Make an Offer</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Offer Amount
                    </label>
                    <CurrencyInput
                      platinum={offerPlatinum}
                      gold={offerGold}
                      silver={offerSilver}
                      copper={offerCopper}
                      handleChange={handleOfferCurrencyChange}
                      handleKeyPress={handleOfferCurrencyKeyPress}
                      priceDisplayMode={offerPriceDisplayMode}
                      setPriceDisplayMode={setOfferPriceDisplayMode}
                      quantity={listing?.quantity || 1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-black'
                      }`}
                      placeholder="Add a message with your offer..."
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={submitOffer}
                      disabled={submittingOffer}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                    </button>
                    <button
                      onClick={() => setShowOfferForm(false)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        darkMode 
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-black'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Offers List */}
            {loadingOffers ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="mt-2 text-sm">Loading offers...</p>
              </div>
            ) : offers.length === 0 ? (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No offers have been made on this listing yet.
              </p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`p-4 rounded-xl border shadow-lg transition-all duration-300 ${
                      offer.status === 'accepted' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      offer.status === 'rejected' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      ''
                    }`}
                    style={{
                      background: offer.status === 'pending' 
                        ? (darkMode 
                            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(42, 42, 62, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)')
                        : undefined,
                      color: offer.status === 'pending' 
                        ? (darkMode ? '#F5E6A3' : '#6B4E3D')
                        : undefined,
                      border: offer.status === 'pending' 
                        ? '1px solid #FFD700'
                        : undefined,
                      backdropFilter: offer.status === 'pending' 
                        ? 'blur(10px)'
                        : undefined,
                      boxShadow: offer.status === 'pending' 
                        ? (darkMode 
                            ? '0 8px 32px rgba(212, 175, 55, 0.15)'
                            : '0 8px 32px rgba(184, 134, 11, 0.15)')
                        : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {offer.user_avatar && (
                            <img
                              src={offer.user_avatar}
                              alt={offer.username}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <UserLink 
                            username={offer.username}
                            userId={offer.user_id}
                            className="font-semibold"
                            darkMode={true}
                          />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            offer.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            offer.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </span>
                        </div>
                        
                        {/* Message formatted exactly like Notes in ItemCard */}
                        {offer.message && offer.message.trim() && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 mb-2" style={{borderLeft: '4px solid rgb(255, 215, 0)'}}>
                            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">Message:</div>
                            <div className="text-gray-700 dark:text-gray-300 text-sm break-words">{offer.message.trim()}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
                        {/* Top section: action buttons and timestamp */}
                        <div className="flex flex-col items-end gap-2">
                          {/* Action buttons */}
                          <div className="flex gap-2">
                            {/* Show accept/reject buttons for listing owner */}
                            {loggedInUser && listing && String(getCurrentUserId()) === String(listing.userId) && offer.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleOfferAction(offer.id, 'accept')}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleOfferAction(offer.id, 'reject')}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {/* Show cancel button for offer creator */}
                            {loggedInUser && String(offer.user_id) === String(getCurrentUserId()) && offer.status === 'pending' && (
                              <div className="relative group">
                                <button
                                  onClick={() => cancelOffer(offer.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors cursor-pointer border border-red-600 hover:border-red-800 dark:border-red-400 dark:hover:border-red-200 rounded w-8 h-8 flex items-center justify-center"
                                >
                                  ✕
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                  Cancel Offer
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Timestamp below buttons - matching ItemCard layout */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            {formatTimeAgo(offer.created_at)}
                          </div>
                        </div>

                        {/* Price display at bottom right - matching ItemCard style with gold border */}
                        <div className="flex flex-col items-end">
                          <span 
                            className="font-semibold"
                            style={{
                              background: darkMode 
                                ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)',
                              color: darkMode ? '#D4AF37' : '#B8860B',
                              padding: '0.5em 0.75em',
                              borderRadius: '0.75em',
                              border: `1px solid ${darkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.3)'}`,
                              boxShadow: darkMode 
                                ? '0 4px 15px rgba(212, 175, 55, 0.2)'
                                : '0 4px 15px rgba(184, 134, 11, 0.2)',
                              fontSize: '1.1em',
                              display: 'inline-block',
                              minWidth: 'max-content',
                              textAlign: 'right',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.25em'}}>
                              {(() => {
                                const eachPrice = listing?.quantity && Number(listing.quantity) > 1 
                                  ? Math.floor(offer.offer_amount / Number(listing.quantity)) 
                                  : offer.offer_amount;
                                const totalPrice = offer.offer_amount;
                                
                                return (
                                  <>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                      {formatPriceMedium(eachPrice)}
                                      <span className="text-xs font-normal text-gray-400">each</span>
                                    </div>
                                    {listing?.quantity && Number(listing.quantity) > 1 && (
                                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
                                        {formatPriceMedium(totalPrice)}
                                        <span className="text-xs font-normal text-gray-400">total</span>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal for confirmations and notifications */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        showCancel={modal.showCancel}
      />
    </div>
  );
};

export default ListingDetail;
