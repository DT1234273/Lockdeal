import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dealAPI } from '../../services/dealAPI';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import { Link } from 'react-router-dom';

const SellerDealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const data = await dealAPI.getSellerDeals();
        setDeals(data);
        setFilteredDeals(data);
      } catch (error) {
        toast.error(error.detail || 'Failed to fetch deals');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'seller') {
      fetchDeals();
    }
  }, [user]);

  useEffect(() => {
    let tempDeals = [...deals];

    // Filter by status
    if (statusFilter !== 'all') {
      tempDeals = tempDeals.filter(deal => deal.status === statusFilter);
    }

    // Filter by date range
    if (startDateFilter) {
      const start = new Date(startDateFilter);
      tempDeals = tempDeals.filter(deal => new Date(deal.created_at) >= start);
    }
    if (endDateFilter) {
      const end = new Date(endDateFilter);
      tempDeals = tempDeals.filter(deal => new Date(deal.created_at) <= end);
    }

    setFilteredDeals(tempDeals);
  }, [deals, statusFilter, startDateFilter, endDateFilter]);

  const handleUpdateStatus = async (dealId, newStatus) => {
    try {
      setLoading(true);
      await dealAPI.updateDeal(dealId, { status: newStatus });
      
      // Refresh deals list
      const updatedDeals = await dealAPI.getSellerDeals();
      setDeals(updatedDeals);
      toast.success(`Deal status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.detail || 'Failed to update deal status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Your Deals"
        subtitle="Manage all your deals and track their status."
        showBackButton={true}
        backButtonPath="/seller/dashboard"
      />

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">All Deals</h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="statusFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDateFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDateFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <p className="text-gray-500">No deals found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{deal.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{deal.group_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{deal.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deal.total_members}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        deal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        deal.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {deal.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(deal.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(deal.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {deal.status !== 'pending' && (
                        <span className="text-gray-400">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDealsPage;