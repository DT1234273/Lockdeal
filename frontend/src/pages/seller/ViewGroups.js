import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { groupAPI } from '../../services/api';

const ViewGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('locked');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ViewGroups component mounted');
    console.log('Current user:', user);
    fetchGroups();
    fetchAvailableGroups();
  }, []);
  
  // Define filteredGroups before using it in useEffect
  const filteredGroups = groups.filter(group => {
    // Check if the product belongs to the current seller
    const isOwnProduct = user?.id && group.product?.seller_id === user.id;
    
    if (activeTab === 'locked') {
      // For locked tab, show all seller's own products that are not accepted/picked up
      // OR show locked groups from other sellers
      return (isOwnProduct && !group.is_accepted && !group.is_picked_up) || 
             (group.locked_at && !group.is_accepted && !group.is_picked_up);
    }
    if (activeTab === 'accepted') {
      // For accepted tab, show groups that are accepted, not picked up, and have at least 1 member
      return group.is_accepted && !group.is_picked_up && group.members > 0;
    }
    if (activeTab === 'completed') {
      // For completed tab, show groups that are picked up OR have 0 members
      return group.is_picked_up || (group.is_accepted && group.members === 0);
    }
    if (activeTab === 'available') return false; // Available groups are handled separately
    return true;
  });
  
  // Add a useEffect to monitor groups state changes
  useEffect(() => {
    console.log('Groups state updated:', groups);
    console.log('Active tab:', activeTab);
    console.log('Filtered groups:', filteredGroups);
  }, [groups, activeTab, filteredGroups]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching groups for seller...');
      const data = await groupAPI.getMyGroups();
      console.log('Groups data received:', data);
      setGroups(data);
    } catch (error) {
      const errorMessage = error.detail || 'Failed to load groups';
      toast.error(errorMessage);
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAvailableGroups = async () => {
    setIsLoadingAvailable(true);
    try {
      console.log('Fetching available groups...');
      const data = await groupAPI.getAvailableGroups();
      console.log('Available groups data received:', data);
      
      // Filter out groups that are already accepted
      const filteredData = data.filter(group => !group.is_accepted);
      console.log('Filtered available groups (excluding accepted):', filteredData);
      
      setAvailableGroups(filteredData);
    } catch (error) {
      const errorMessage = error.detail || 'Failed to load available groups';
      toast.error(errorMessage);
      console.error('Error fetching available groups:', error);
    } finally {
      setIsLoadingAvailable(false);
    }
  };

 const handleAcceptGroup = (group) => {
    setSelectedGroup(group);
    
    // Check if group is already accepted
    if (group.is_accepted) {
      toast.info('This group is already accepted');
      return;
    }
    
    // If group meets criteria, accept directly without showing modal
    if (group.members >= 10 || group.total_price >= 1000) {
      confirmAcceptGroup();
    } else {
      // For regular locked groups, show confirmation modal
      setShowAcceptModal(true);
    }
  };
  
  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  };
  
  const handleAcceptAvailableGroup = async (groupId) => {
    try {
      // Check if the group meets the criteria
      const group = selectedGroup || availableGroups.find(g => g.id === groupId);
      
      if (!group) {
        toast.error('Group not found');
        return;
      }
      
      // Check if the group is already accepted
      if (group.is_accepted) {
        toast.info('This group is already accepted');
        fetchGroups();
        fetchAvailableGroups();
        setShowDetailsModal(false);
        setActiveTab('accepted');
        return;
      }
      
      // First lock the group if not already locked
      if (!group.locked_at) {
        try {
          await groupAPI.lockGroup(groupId);
          console.log('Group locked successfully');
        } catch (lockError) {
          // If the group is already locked, we can proceed to accept it
          if (!lockError.detail?.includes('already locked')) {
            // If it's another error, show it and stop
            const errorMessage = lockError.detail || 'Failed to lock group';
            toast.error(errorMessage);
            console.error('Error locking group:', lockError);
            return;
          }
        }
      } else {
        console.log('Group was already locked, proceeding to accept');
      }
      
      // Then accept the group
      await groupAPI.acceptGroup(groupId);
      toast.success('Group accepted successfully');
      setShowAcceptModal(false);
      fetchGroups();
      fetchAvailableGroups();
      setShowDetailsModal(false);
      setActiveTab('accepted');
    } catch (error) {
      const errorMessage = error.detail || 'Failed to accept group';
      toast.error(errorMessage);
      console.error('Error accepting group:', error);
    }
  };
  const confirmAcceptGroup = async () => {
    if (!selectedGroup) return;
    
    // Check if the group is already accepted
    if (selectedGroup.is_accepted) {
      toast.info(`Group for ${selectedGroup.product.name} is already accepted`);
      setShowAcceptModal(false);
      setActiveTab('accepted');
      return;
    }
    
    setIsAccepting(true);
    try {
      await groupAPI.acceptGroup(selectedGroup.id);
      toast.success('Group accepted successfully');
      
      // Update the group status locally without showing popup
      setGroups(prevGroups => {
        return prevGroups.map(group => {
          if (group.id === selectedGroup.id) {
            return {
              ...group,
              is_accepted: true,
              accepted_at: new Date().toISOString()
            };
          }
          return group;
        });
      });
      
      // Refresh all groups to ensure the accepted group is correctly displayed
      fetchGroups();
      // Change active tab to 'accepted'
      setActiveTab('accepted');
      
      toast.success(`Group for ${selectedGroup.product.name} accepted successfully!`);
      setShowAcceptModal(false);
    } catch (error) {
      toast.error(error.detail || 'Failed to accept group');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleVerifyPickup = (group) => {
    // Navigate to customer orders page for order confirmation
    navigate('/seller/customer-orders');
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

  // Debug groups data
  useEffect(() => {
    console.log('ViewGroups - Groups data:', groups);
    console.log('ViewGroups - Filtered groups:', filteredGroups);
    console.log('ViewGroups - Active tab:', activeTab);
  }, [groups, filteredGroups, activeTab]);

  // Debug user state
  useEffect(() => {
    console.log('ViewGroups - Current user state:', user);
    console.log('ViewGroups - Seller paid status:', user?.seller?.paid_99);
    
    // Check localStorage as well
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('ViewGroups - User from localStorage:', storedUser);
    console.log('ViewGroups - Seller paid status from localStorage:', storedUser?.seller?.paid_99);
  }, [user]);
  
  // If seller hasn't paid the fee, show access denied screen
  if (!user?.seller?.paid_99) {
    console.log('ViewGroups - Access denied: seller has not paid fee');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
          <div className="inline-block p-4 rounded-full bg-red-100 text-red-600 mb-6">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m-3 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            You need to pay the seller onboarding fee of ₹99 to access group management features.
          </p>
          <Link 
            to="/seller/dashboard" 
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Go to Dashboard & Pay Fee
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title="Manage Groups"
        subtitle="View and manage your product groups"
        backButtonPath="/seller/dashboard"
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('locked')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'locked' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Locked Groups
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'accepted' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Accepted Groups
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Completed Groups
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'available' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Available Groups
          </button>
        </nav>
      </div>

      {/* Available Groups Tab Content */}
      {activeTab === 'available' && (
        <>
          {isLoadingAvailable ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading available groups...</p>
            </div>
          ) : availableGroups.length > 0 ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800 text-sm">
                  <span className="font-medium">Note:</span> These are groups created by customers that you can accept and fulfill.
                  <br />Groups are visible when they meet at least one of these criteria:
                  <br />1. The group has <span className="font-medium">10 or more members</span>
                  <br />2. The total order value is <span className="font-medium">₹1000 or more</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableGroups.map((group) => (
                  <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-lg font-semibold">{group.product.name}</h2>
                        <span className={`text-xs px-2 py-1 rounded-full ${(group.members >= 10 || group.total_price >= 1000) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {(group.members >= 10 || group.total_price >= 1000) ? 'Ready to Accept' : 'Available'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span>₹{group.product.price} per {group.product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Quantity:</span>
                          <span>{group.total_quantity} {group.product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Group Total:</span>
                          <span className="font-medium">₹{group.total_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Members:</span>
                          <span>{group.members}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created On:</span>
                          <span>{formatDate(group.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(group)}
                          className="btn-secondary flex-1"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAcceptAvailableGroup(group.id)}
                          className="btn-primary flex-1"
                        >
                          Accept Group
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 mb-4">No available groups found.</p>
              <p className="text-sm text-gray-600">
                Groups will appear here when:<br/>
                1. They reach ₹1000 total value<br/>
                2. OR they have 10+ members
              </p>
            </div>
          )}
        </>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading groups...</p>
        </div>
      ) : filteredGroups.length > 0 ? (
        <>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 text-sm">
              <span className="font-medium">Note:</span> Groups are visible when they meet at least one of these criteria:
              <br />1. <span className="font-medium">The product belongs to you as a seller</span> (all your product groups are shown)
              <br />2. The group has <span className="font-medium">10 or more members</span>
              <br />3. The total order value is <span className="font-medium">₹1000 or more</span>
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md mb-6">
            <p className="text-sm text-yellow-800 flex items-center">
              <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Groups can be accepted anytime, but distribution will only happen on Saturday or Sunday.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold">{group.product.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${group.is_picked_up ? 'bg-green-100 text-green-800' : group.is_accepted ? 'bg-blue-100 text-blue-800' : (group.members >= 10 || group.total_price >= 1000) ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {group.is_picked_up ? 'Completed' : group.is_accepted ? 'Accepted' : (group.members >= 10 || group.total_price >= 1000) ? 'Ready to Accept' : 'Locked'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>₹{group.product.price} per {group.product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Quantity:</span>
                    <span>{group.total_quantity} {group.product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Group Total:</span>
                    <span className="font-medium">₹{group.total_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span>{group.members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Locked On:</span>
                    <span>{formatDate(group.locked_at)}</span>
                  </div>
                  {group.is_accepted && (
                    <div className="flex justify-between">
                      <span>Accepted On:</span>
                      <span>{formatDate(group.accepted_at)}</span>
                    </div>
                  )}
                  {group.is_picked_up && (
                    <div className="flex justify-between">
                      <span>Picked Up On:</span>
                      <span>{formatDate(group.picked_up_at)}</span>
                    </div>
                  )}
                </div>

                {activeTab === 'locked' && (
                  <button
                    onClick={() => handleAcceptGroup(group)}
                    className="btn-primary w-full"
                  >
                    Accept Group
                  </button>
                )}

                {activeTab === 'accepted' && (
                  <>
                    <div className="bg-yellow-50 p-3 rounded-md mb-3">
                      <p className="text-sm text-yellow-800 flex items-center">
                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Pickup is only allowed on Saturday or Sunday
                      </p>
                    </div>
                    <button
                      onClick={() => handleVerifyPickup(group)}
                      className="btn-primary w-full"
                    >
                      Verify Pickup
                    </button>
                  </>
                )}

                {activeTab === 'completed' && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-800 flex items-center">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {group.members === 0 ? 
                        "Completed (No members remaining)" : 
                        `Completed on ${formatDate(group.picked_up_at)}`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
         </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">
            {activeTab === 'locked' && 'No locked groups or your own product groups waiting for acceptance.'}
            {activeTab === 'accepted' && 'No accepted groups waiting for pickup.'}
            {activeTab === 'completed' && 'No completed groups or groups with zero members yet.'}
          </p>
          {activeTab === 'locked' && (
            <p className="text-sm text-gray-600">
              Groups will appear here when:<br/>
              1. They are your own product groups (regardless of size or value)<br/>
              2. OR they reach ₹1000 total value<br/>
              3. OR they have 10+ members
            </p>
          )}
        </div>
      )}

      {/* Accept Group Modal */}
      {showAcceptModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Accept Group Order</h2>
            <p className="mb-4 text-gray-600">
              Are you sure you want to accept this group order for {selectedGroup.product.name}?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span>{selectedGroup.total_quantity} {selectedGroup.product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₹{selectedGroup.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Customers:</span>
                  <span>{selectedGroup.members}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              By accepting, you agree to prepare this order for customer pickup.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                className="btn-secondary"
                disabled={isAccepting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAcceptGroup}
                className="btn-primary"
                disabled={isAccepting}
              >
                {isAccepting ? 'Accepting...' : 'Accept Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal removed */}
    
      {/* Group Details Modal */}
      {showDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{selectedGroup.product.name}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Product Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span>₹{selectedGroup.product.price} per {selectedGroup.product.unit}</span>
                    <span className="text-gray-600">Category:</span>
                    <span>{selectedGroup.product.category}</span>
                    <span className="text-gray-600">Description:</span>
                    <span className="col-span-2">{selectedGroup.product.description}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Group Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Total Members:</span>
                    <span>{selectedGroup.members}</span>
                    <span className="text-gray-600">Total Quantity:</span>
                    <span>{selectedGroup.total_quantity} {selectedGroup.product.unit}</span>
                    <span className="text-gray-600">Total Value:</span>
                    <span>₹{selectedGroup.total_price.toFixed(2)}</span>
                    <span className="text-gray-600">Created On:</span>
                    <span>{formatDate(selectedGroup.created_at)}</span>
                    <span className="text-gray-600">Locked On:</span>
                    <span>{formatDate(selectedGroup.locked_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAcceptAvailableGroup(selectedGroup.id);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Accept Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Group Confirmation Modal */}
      {showAcceptModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Accept Group</h2>
              <p className="mb-6">
                Are you sure you want to accept this group for {selectedGroup.product.name}?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isAccepting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAcceptGroup}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                  disabled={isAccepting}
                >
                  {isAccepting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Accept Group'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewGroups;