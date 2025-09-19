import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import { groupAPI, ratingAPI, sellerAPI } from '../../services/api';
import axios from 'axios';

const GroupStatus = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    fetchGroups();
    
    // Set up an interval to refresh groups data every 5 minutes instead of 30 seconds
    // This reduces server load while still keeping data relatively fresh
    const intervalId = setInterval(() => {
      fetchGroups();
    }, 300000); // 5 minutes in milliseconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Effect to fetch groups when activeTab changes
  useEffect(() => {
    try {
      console.log('activeTab changed to:', activeTab);
      fetchGroups();
    } catch (error) {
      console.error('Error in activeTab useEffect:', error);
      toast.error('Error loading groups for this tab');
    }
  }, [activeTab]);
  
  // Show a success popup when component mounts

  
  // Function to fetch seller information for groups that don't have it
const fetchSellerInfo = async (groups) => {
  try {
    const sellerMap = {};

    for (const group of groups) {
      // Skip if group is null or undefined
      if (!group) continue;
      
      // Check if seller_id exists
      if (group.seller_id) {
        try {
          // First try to get seller info from the group's seller_id
          const response = await axios.get(`/api/seller/${group.seller_id}`);
          const sellerData = response.data;
          
          // Check if the seller data has valid address and contact
          const hasValidAddress = sellerData && sellerData.address && sellerData.address !== "Seller address will be available soon";
          const hasValidContact = sellerData && sellerData.contact && sellerData.contact !== "Seller contact will be available soon";
          
          if (sellerData && hasValidAddress && hasValidContact) {
            // Use the seller data if it has valid information
            sellerMap[group.seller_id] = sellerData;
            group.seller = {
              user_id: sellerData.user_id,
              shop_name: sellerData.shop_name,
              address: sellerData.address,
              contact: sellerData.contact
            };
          } else if (group.product && group.product.seller_id) {
            // If the group's seller has placeholder data, try to get info from the product's seller
            try {
              const productSellerResponse = await axios.get(`/api/seller/${group.product.seller_id}`);
              const productSellerData = productSellerResponse.data;
              if (productSellerData) {
                sellerMap[group.seller_id] = productSellerData;
                group.seller = {
                  user_id: productSellerData.user_id,
                  shop_name: productSellerData.shop_name,
                  address: productSellerData.address,
                  contact: productSellerData.contact
                };
                console.log(`Using product seller info for group ${group.id}`);
              } else {
                // Use placeholder if productSellerData is null
                group.seller = {
                  user_id: group.seller_id,
                  shop_name: `Shop #${group.seller_id}`,
                  address: "Seller address will be available soon",
                  contact: "Seller contact will be available soon"
                };
              }
            } catch (productSellerError) {
              // If both fail, use the original seller data with placeholders
              console.error(`Failed to fetch product seller info for ID ${group.product.seller_id}:`, productSellerError);
              if (sellerData) {
                group.seller = {
                  user_id: sellerData.user_id,
                  shop_name: sellerData.shop_name,
                  address: sellerData.address,
                  contact: sellerData.contact
                };
              } else {
                // Use placeholder if sellerData is null
                group.seller = {
                  user_id: group.seller_id,
                  shop_name: `Shop #${group.seller_id}`,
                  address: "Seller address will be available soon",
                  contact: "Seller contact will be available soon"
                };
              }
            }
          } else if (sellerData) {
            // Use the original seller data even if it has placeholders
            group.seller = {
              user_id: sellerData.user_id,
              shop_name: sellerData.shop_name,
              address: sellerData.address,
              contact: sellerData.contact
            };
          } else {
            // Use placeholder if sellerData is null
            group.seller = {
              user_id: group.seller_id,
              shop_name: `Shop #${group.seller_id}`,
              address: "Seller address will be available soon",
              contact: "Seller contact will be available soon"
            };
          }
        } catch (error) {
          console.error(`Failed to fetch seller info for ID ${group.seller_id}:`, error);
          
          // If the group has a product with a seller_id, try to get that seller's info
          if (group.product && group.product.seller_id) {
            try {
              const productSellerResponse = await axios.get(`/api/seller/${group.product.seller_id}`);
              const productSellerData = productSellerResponse.data;
              if (productSellerData) {
                sellerMap[group.seller_id] = productSellerData;
                group.seller = {
                  user_id: productSellerData.user_id,
                  shop_name: productSellerData.shop_name,
                  address: productSellerData.address,
                  contact: productSellerData.contact
                };
                console.log(`Using product seller info for group ${group.id} after primary seller fetch failed`);
              } else {
                // Use placeholder if productSellerData is null
                group.seller = {
                  user_id: group.seller_id,
                  shop_name: `Shop #${group.seller_id}`,
                  address: "Seller address will be available soon",
                  contact: "Seller contact will be available soon"
                };
              }
            } catch (productSellerError) {
              console.error(`Failed to fetch product seller info for ID ${group.product.seller_id}:`, productSellerError);
              // If both fail, use placeholder data
              group.seller = {
                user_id: group.seller_id,
                shop_name: `Shop #${group.seller_id}`,
                address: "Seller address will be available soon",
                contact: "Seller contact will be available soon"
              };
            }
          } else {
            // If there's no product seller to try, use placeholder data
            group.seller = {
              user_id: group.seller_id,
              shop_name: `Shop #${group.seller_id}`,
              address: "Seller address will be available soon",
              contact: "Seller contact will be available soon"
            };
          }
        }
      }
    }

    return groups;
  } catch (error) {
    console.error("Error fetching seller information:", error);
    return groups;
  }
};


  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await groupAPI.getMyGroups();
      
      // Make sure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array from getMyGroups, got:', typeof data);
        toast.error('Invalid data format received from server');
        setGroups([]);
        return;
      }
      
      // Process groups to ensure they all have seller information
      const processedGroups = await fetchSellerInfo(data);
      
      // We no longer need to check API ratings since we're using localStorage
      // to track individual product ratings
      
      // Add has_rating flag to each group
      processedGroups.forEach(group => {
        // Skip if group is null or undefined or doesn't have an id
        if (!group || !group.id) {
          console.warn('Invalid group object found:', group);
          return;
        }
        
        try {
          // ONLY check if we have a record in localStorage for this specific group
          // This allows users to rate each product individually, even from the same seller
          const ratedGroups = JSON.parse(localStorage.getItem('ratedGroups') || '{}');
          console.log('Rated groups from localStorage:', ratedGroups);
          console.log('Current group ID:', group.id, 'Type:', typeof group.id);
          
          // Check if the group ID exists in localStorage
          // Convert to string to ensure proper comparison
          const hasRated = ratedGroups.hasOwnProperty(group.id.toString());
          console.log('Has rated from localStorage:', hasRated);
          
          // We no longer check seller ratings - each product can be rated individually
          // This allows customers to rate different products from the same seller
          
          group.has_rating = hasRated;
          console.log('Final has_rating value for group', group.id, ':', group.has_rating);
        } catch (localStorageError) {
          console.error('Error processing localStorage data:', localStorageError);
          group.has_rating = false;
        }
      });
      
      setGroups(processedGroups);
    } catch (error) {
      toast.error('Failed to load groups');
      console.error('Error in fetchGroups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not locked yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
 
  const isWeekend = () => {
    const today = new Date().getDay();
    return today === 6 || today === 0 || today === 5; // 6 is Saturday, 0 is Sunday, 1 is Monday
  };


  const handleSubmitRating = async () => {
    setIsSubmittingRating(true);
    try {
      if (!selectedGroup) {
        toast.error('Group information is not available');
        return;
      }
      
      let sellerId = null;
      
      if (selectedGroup.seller && selectedGroup.seller.user_id) {
        sellerId = selectedGroup.seller.user_id;
      }
      else if (selectedGroup.seller_id) {
        sellerId = selectedGroup.seller_id;
      }
      else if (selectedGroup.product && selectedGroup.product.seller_id) {
        sellerId = selectedGroup.product.seller_id;
      }
      
      if (!sellerId) {
        toast.error('Seller information is not available');
        return;
      }
      
      // Create the rating
      const ratingResponse = await ratingAPI.createRating({
        seller_id: sellerId,
        score: rating,
        feedback: feedback,
        product_id: selectedGroup.product.id
      });
      
      const ratedGroups = JSON.parse(localStorage.getItem('ratedGroups') || '{}');
      console.log('Before update - Rated groups:', ratedGroups);
      console.log('Adding rating for group ID:', selectedGroup.id, 'Rating ID:', ratingResponse.id);
      console.log('Product ID being used:', selectedGroup.product.id);
      
      ratedGroups[selectedGroup.id.toString()] = ratingResponse.id;
      localStorage.setItem('ratedGroups', JSON.stringify(ratedGroups));
      
      setGroups(prevGroups => {
        return prevGroups.map(group => {
          if (group.id === selectedGroup.id) {
            return { ...group, has_rating: true };
          }
          return group;
        });
      });
      
      const verifyStorage = JSON.parse(localStorage.getItem('ratedGroups') || '{}');
      console.log('After update - Rated groups:', verifyStorage);
      
      toast.success('Thank you for your feedback!');
      setShowRatingModal(false);
      setRating(5);
      setFeedback('');
      
      // Update only the current group's has_rating flag
      setGroups(prevGroups => prevGroups.map(group => {
        if (group.id === selectedGroup.id) {
          return { ...group, has_rating: true };
        }
        return group;
      }));
    } catch (error) {
      toast.error('Failed to submit rating');
      console.error(error);
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  // Pickup verification functionality removed

  const filteredGroups = groups.filter(group => {
    if (activeTab === 'active') return !group.locked_at;
    if (activeTab === 'locked') return group.locked_at && !group.is_picked_up;
    if (activeTab === 'completed') return group.is_picked_up;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="My Groups"
        subtitle="View and manage your group purchases"
        showBackButton={true}
        backButtonPath="/customer/dashboard"
        className="p-8 bg-gradient-to-r from-customer-600 to-customer-500 text-white rounded-xl shadow-lg mb-8"
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              try {
                setActiveTab('active');
              } catch (error) {
                console.error('Error setting active tab:', error);
                toast.error('Error changing tab');
              }
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Active
          </button>
          <button
            onClick={() => {
              try {
                setActiveTab('locked');
              } catch (error) {
                console.error('Error setting locked tab:', error);
                toast.error('Error changing tab');
              }
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'locked' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {isWeekend() ? 'Locked' : 'Unlock'}
          </button>
          <button
            onClick={() => {
              try {
                setActiveTab('completed');
              } catch (error) {
                console.error('Error setting completed tab:', error);
                toast.error('Error changing tab');
              }
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Completed
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading groups...</p>
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold">{group.product.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${group.is_picked_up ? 'bg-green-100 text-green-800' : group.locked_at ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {group.is_picked_up ? 'Completed' : group.locked_at ? (isWeekend() ? 'Locked' : 'Unlock') : 'Active'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>₹{group.product.price} per {group.product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Quantity:</span>
                    <span>{group.quantity} {group.product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Total:</span>
                    <span className="font-medium">₹{group.user_total_price ? group.user_total_price.toFixed(2) : (group.product.price * group.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Group Total:</span>
                    <span className="font-medium">₹{group.total_price ? group.total_price.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span>{group.members} / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span>{group.locked_at ? `${isWeekend() ? 'Locked' : 'Unlock'} on ${formatDate(group.locked_at)}` : 'Waiting for more members'}</span>
                  </div>
                </div>

                {group.locked_at && !group.is_picked_up && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="font-medium mb-2">Pickup Information</h3>
                    {group.seller ? (
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Seller:</span> {group.seller.shop_name}</p>
                        <p><span className="text-gray-600">Seller ID:</span> {group.seller.id || group.seller_id}</p>
                        <p><span className="text-gray-600">Address:</span> {group.seller.address}</p>
                        <p><span className="text-gray-600">Contact:</span> {group.seller.contact}</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        <p className="text-yellow-600">Seller information not available</p>
                      </div>
                    )}
                    <div className="bg-yellow-50 p-3 rounded-md mt-4">
                      <p className="text-sm text-yellow-800 flex items-center">
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Please wait for the seller to verify your pickup on Saturday or Sunday.
                      </p>
                    </div>
                  </div>
                )}

                {!group.locked_at && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <p className="text-sm text-yellow-800">
                        This group will lock automatically on Saturday if it reaches ₹1000 total value and has 10+ members.
                      </p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(100, (group.total_price / 1000) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>₹{group.total_price.toFixed(2)}</span>
                        <span>₹1,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {group.is_picked_up && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-800 flex items-center">
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Picked up on {formatDate(group.picked_up_at)}
                      </p>
                      <p className="text-sm text-green-800 mt-2 font-semibold">Order Completed</p>
                      
                      {/* Add Review Button for completed orders */}
                      {!group.has_rating && (
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowRatingModal(true);
                          }}
                          className="mt-3 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-200"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">
            {activeTab === 'active' && 'You have no active groups. Join a product group to get started!'}
            {activeTab === 'locked' && `You have no ${isWeekend() ? 'locked' : 'unlock'} groups waiting for pickup.`}
            {activeTab === 'completed' && 'You have no completed pickups yet.'}
          </p>
          {activeTab === 'active' && (
            <a href="/customer/products" className="btn-primary">
              Browse Products
            </a>
          )}
        </div>
      )}

      {/* Pickup Verification Modal removed - now handled by seller */}

      {/* Rating Modal */}
      {showRatingModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Rate Your Experience</h2>
            <p className="mb-4 text-gray-600">
              How was your experience with {selectedGroup.seller?.shop_name || 
                selectedGroup.product?.seller_name || 
                `Shop #${selectedGroup.seller_id || selectedGroup.product?.seller_id || 'Unknown'}`}?
            </p>
            <p className="mb-4 text-sm text-gray-500">
              Shop: {selectedGroup.seller?.shop_name || 
                selectedGroup.product?.seller_name || 
                `Shop #${selectedGroup.seller_id || selectedGroup.product?.seller_id || 'Unknown'}`}
            </p>
            <p className="mb-2 text-sm text-gray-500">
              Product: {selectedGroup.product?.name || 'Unknown Product'}
            </p>
            <div className="mb-4">
              <div className="flex justify-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rating ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-300">★</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mb-4">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                rows="3"
                className="form-input"
                placeholder="Share your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRatingModal(false)}
                className="btn-secondary"
                disabled={isSubmittingRating}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                className="btn-primary"
                disabled={isSubmittingRating}
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pickup verification modal removed */}
    </div>
  );
};

export default GroupStatus;