import React, { useEffect, useState } from 'react';
import { dealAPI } from '../../services/dealAPI';
import { groupAPI } from '../../services/groupAPI';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';

const Deals = () => {
  const [allDeals, setAllDeals] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsData = await groupAPI.getMyGroups();
        setMyGroups(groupsData);

        const dealsData = await dealAPI.getAllDeals();
        const myGroupIds = groupsData.map(group => group.id);
        const filteredDeals = dealsData.filter(deal => myGroupIds.includes(deal.group_id));
        setAllDeals(filteredDeals);
      } catch (error) {
        toast.error(error.detail || 'Failed to fetch all deals');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader title="All My Deals" subtitle="View all your deals here." showBackButton={true} backButtonPath="/customer/dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {allDeals.length > 0 ? (
          allDeals.map((deal) => {
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
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">No deals found.</p>
        )}
      </div>
    </div>
  );
};

export default Deals;