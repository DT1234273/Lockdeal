import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { groupAPI } from '../../services/api';

const AvailableGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [acceptedGroups, setAcceptedGroups] = useState([]);
  const [completedGroups, setCompletedGroups] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [distributingGroupId, setDistributingGroupId] = useState(null);
  const [sellerGroupId, setSellerGroupId] = useState(user?.seller_group_id || null);

  const fetchCompletedGroups = async () => {
    try {
      const data = await groupAPI.getCompletedGroups();
      setCompletedGroups(data);
    } catch (error) {
      const errorMessage = error.detail || 'Failed to load completed groups';
      toast.error(errorMessage);
      console.error('Error fetching completed groups:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchAcceptedGroups();
    fetchCompletedGroups();
  }, []);
  
  useEffect(() => {
    if (user?.seller_group_id) {
      setSellerGroupId(user.seller_group_id);
    }
  }, [user]);

  // Groups are already filtered by the API
  const eligibleGroups = groups;

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await groupAPI.getAvailableGroups();
      setGroups(data);
    } catch (error) {
      const errorMessage = error.detail || 'Failed to load available groups';
      toast.error(errorMessage);
      console.error('Error fetching available groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcceptedGroups = async () => {
    try {
      const data = await groupAPI.getAcceptedGroups();
      setAcceptedGroups(data);
    } catch (error) {
      const errorMessage = error.detail || 'Failed to load accepted groups';
      toast.error(errorMessage);
      console.error('Error fetching accepted groups:', error);
    }
  };

  const handleAcceptGroup = async (groupId) => {
    try {
      // Check if the group meets the criteria
      const group = selectedGroup || groups.find(g => g.id === groupId);
      
      if (!group) {
        toast.error('Group not found');
        return;
      }
      
      // Check if the group meets the criteria
      const hasEnoughMembers = group.members >= 10;
      const hasEnoughValue = group.total_price >= 1000;
      
      if (!hasEnoughMembers && !hasEnoughValue) {
        toast.error('Group does not meet the criteria. It must have 10 or more members OR a total value of ₹1000 or more.');
        return;
      }
      
      // First lock the group
      try {
        await groupAPI.lockGroup(groupId);
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
      
      // Then accept the group
      await groupAPI.acceptGroup(groupId);
      toast.success('Group accepted successfully');
      fetchGroups();
      fetchAcceptedGroups();
      setShowDetailsModal(false);
    } catch (error) {
      const errorMessage = error.detail || 'Failed to accept group';
      toast.error(errorMessage);
      console.error('Error accepting group:', error);
    }
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  };
  
  const isDistributionDay = () => {
    const today = new Date().getDay();
    // 6 is Saturday, 0 is Sunday
    return today === 6 || today === 0 || today === 3;
  };
  
  const handleDistributeGroup = (groupId) => {
    setDistributingGroupId(groupId);
    setShowOtpModal(true);
  };
  
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    
    try {
      await groupAPI.verifyDistributionOtp(distributingGroupId, otp);
      toast.success('Group distribution verified successfully');
      setShowOtpModal(false);
      setOtp('');
      fetchAcceptedGroups();
    } catch (error) {
      const errorMessage = error.detail || 'Failed to verify OTP';
      toast.error(errorMessage);
      console.error('Error verifying OTP:', error);
    }
  };
  
  const handleSendOtp = async () => {
    try {
      await groupAPI.sendDistributionOtp(distributingGroupId);
      toast.success('OTP sent successfully');
    } catch (error) {
      const errorMessage = error.detail || 'Failed to send OTP';
      toast.error(errorMessage);
      console.error('Error sending OTP:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not locked yet';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Available Groups"
        subtitle="Groups from other sellers with 10+ members or ₹1000+ total value"
        showBackButton={true}
        backButtonPath="/seller/dashboard"
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-seller-600"></div>
        </div>
      ) : eligibleGroups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Available Groups</h3>
          <p className="text-gray-500">
            There are currently no groups from other sellers that meet the criteria.
            Check back on Saturday when more groups may be available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eligibleGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">{group.product.name}</h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-seller-100 text-seller-800">
                    {group.members} members
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{group.product.unit}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-seller-600">{formatCurrency(group.total_price)}</span>
                  <span className="text-xs text-gray-500">Locked: {formatDate(group.locked_at)}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  {group.product.seller_name || "Other Seller"}
                </span>
                <button
                  onClick={() => handleViewDetails(group)}
                  className="px-3 py-1 bg-seller-600 text-white text-sm font-medium rounded hover:bg-seller-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seller-500 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group Details Modal */}
      {showDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedGroup.product.name}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Group Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Total Members</p>
                      <p className="text-lg font-semibold">{selectedGroup.members}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Value</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedGroup.total_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Locked On</p>
                      <p className="text-sm">{formatDate(selectedGroup.locked_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Product Unit</p>
                      <p className="text-sm">{selectedGroup.product.unit}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Product Information</h4>
                  <div className="flex items-center space-x-3 mb-3">
                    {selectedGroup.product.image_url && (
                      <img 
                        src={selectedGroup.product.image_url} 
                        alt={selectedGroup.product.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <p className="font-medium">{selectedGroup.product.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(selectedGroup.product.price)} per {selectedGroup.product.unit}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-blue-800 text-sm">
                      <span className="font-medium">Note:</span> Groups are available for viewing when they meet at least one of these criteria:
                      <br />1. The group has <span className="font-medium">10 or more members</span>
                      <br />2. The total order value is <span className="font-medium">₹1000 or more</span>
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-md mb-4">
                    <p className="text-sm text-yellow-800 flex items-center">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Groups can be accepted anytime, but distribution will only happen on Saturday or Sunday.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleAcceptGroup(selectedGroup.id)}
                      className="px-4 py-2 bg-seller-600 text-white rounded-md hover:bg-seller-700 transition-colors mr-2"
                    >
                      Accept Group
                    </button>
                    <Link
                      to={`/product/${selectedGroup.product.id}`}
                      className="px-4 py-2 bg-seller-600 text-white rounded-md hover:bg-seller-700 transition-colors"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Verify Distribution</h3>
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">Enter the OTP sent to the group members to verify distribution.</p>
                
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-seller-500 focus:border-seller-500"
                    placeholder="Enter OTP"
                    maxLength={6}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleSendOtp()}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Resend OTP
                  </button>
                  <button
                    onClick={() => handleVerifyOtp()}
                    className="px-4 py-2 bg-seller-600 text-white rounded-md hover:bg-seller-700 transition-colors"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Accepted Groups Section */}
      {acceptedGroups.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accepted Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">{group.product.name}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Accepted
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{group.product.unit}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-seller-600">{formatCurrency(group.total_price)}</span>
                    <span className="text-xs text-gray-500">Locked: {formatDate(group.locked_at)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {group.product.seller_name || "Other Seller"}
                  </span>
                  <div>
                    {isDistributionDay() && (
                      <button
                        onClick={() => handleDistributeGroup(group.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors mr-2"
                      >
                        Distribute
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(group)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Groups Section */}
      {completedGroups.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">{group.product.name}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{group.product.unit}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-seller-600">{formatCurrency(group.total_price)}</span>
                    <span className="text-xs text-gray-500">Completed: {formatDate(group.picked_up_at)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {group.product.seller_name || "Other Seller"}
                  </span>
                  <button
                    onClick={() => handleViewDetails(group)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableGroups;