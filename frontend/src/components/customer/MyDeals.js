import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dealAPI } from '../../services/dealAPI';
import { groupAPI } from '../../services/groupAPI';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const MyDeals = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [deals, setDeals] = useState([]);
  const [allDeals, setAllDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get all groups the user is a member of
        const groupsData = await groupAPI.getMyGroups();
        setMyGroups(groupsData);
        
        // Then get all deals
        const dealsData = await dealAPI.getAllDeals();
        
        // Filter deals to only include those where the user is a member of the group
        const myGroupIds = groupsData.map(group => group.id);
        const myDeals = dealsData.filter(deal => myGroupIds.includes(deal.group_id));
        
        setAllDeals(myDeals);
        setDeals(myDeals.slice(0, 6)); // Show only 6 deals on dashboard
      } catch (error) {
        toast.error(error.detail || 'Failed to fetch deals');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'customer') {
      fetchData();
      
      // Set up an interval to refresh deals data every 30 seconds
      // This ensures that when a seller confirms an order, the UI updates
      const intervalId = setInterval(() => {
        fetchData();
      }, 30000);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Function to get group details for a deal
  const getGroupDetails = (groupId) => {
    return myGroups.find(group => group.id === groupId) || {};
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (allDeals.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">My Deals</h2>
        <p className="text-gray-500">You don't have any deals yet. When your groups are locked and accepted by sellers, they will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">My Deals</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {deals.map((deal) => {
          const group = getGroupDetails(deal.group_id);
          return (
            <div key={deal.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">Deal #{deal.id}</h3>
                <p className="text-sm text-gray-500">Group #{deal.group_id}</p>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{group.product?.name || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₹{deal.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-medium">{deal.total_members || 0}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    deal.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    deal.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {deal.status}
                  </span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(deal.created_at).toLocaleDateString()}</span>
                </div>
                
                {deal.completed_at && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">{new Date(deal.completed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border-t">
                {deal.status === 'pending' && (
                  <div className="text-center text-sm text-yellow-600">
                    Waiting for seller to complete this deal
                  </div>
                )}
                
                {deal.status === 'completed' && (
                  <div className="text-center text-sm text-green-600 font-semibold">
                    Order Completed! Your order has been confirmed.
                  </div>
                )}
                
                {deal.status === 'cancelled' && (
                  <div className="text-center text-sm text-red-600">
                    This deal was cancelled by the seller.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {allDeals.length > 6 && (
      <div className="text-center mt-4">
        <Link to="/customer/deals" className="btn-secondary">View All Deals</Link>
      </div>
      )}
    </>
  );  
};

export default MyDeals;