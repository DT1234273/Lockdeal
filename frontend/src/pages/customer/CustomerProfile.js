import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import AddressModal from '../../components/AddressModal';
import { toast } from 'react-toastify';

const CustomerProfile = () => {
  const { user, customerAddress: savedAddress } = useAuth();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(null);
  
  // Load address from context if available
  useEffect(() => {
    if (savedAddress) {
      setCustomerAddress(savedAddress.address);
      setCustomerPhone(savedAddress.phone);
    }
  }, [savedAddress]);

  const handleAddressSuccess = (data) => {
    setCustomerAddress(data.address);
    setCustomerPhone(data.phone);
    setShowAddressModal(false);
    toast.success('Address saved successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal information and settings"
        showBackButton={true}
        backButtonPath="/customer/dashboard"
        className="p-8 bg-gradient-to-r from-customer-600 to-customer-500 text-white rounded-xl shadow-lg mb-8"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Profile info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-customer-700 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h2>
              <button 
                className="text-customer-600 hover:text-customer-800 text-sm font-medium bg-customer-50 px-3 py-1 rounded-lg transition-colors"
                onClick={() => {}}
              >
                Edit
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-customer-500">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-800">{user?.name || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-customer-500">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-800">{user?.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-customer-700 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Address
              </h2>
              <button 
                className="text-customer-600 hover:text-customer-800 text-sm font-medium bg-customer-50 px-3 py-1 rounded-lg transition-colors"
                onClick={() => setShowAddressModal(true)}
              >
                {customerAddress ? 'Update' : 'Add'}
              </button>
            </div>
            
            {customerAddress ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-customer-500">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium text-gray-800">{customerAddress}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-customer-500">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-800">{customerPhone}</p>
                </div>
              </div>
            ) : (
              <div className="bg-customer-50 rounded-lg p-6 text-center border border-dashed border-customer-300">
                <svg className="h-12 w-12 text-customer-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600 mb-3">No delivery address added yet</p>
                <button 
                  className="mt-2 btn-primary py-2 px-4 rounded-lg transition-all hover:shadow-lg"
                  onClick={() => setShowAddressModal(true)}
                >
                  Add Address
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Account settings */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl duration-300">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-semibold text-customer-700 flex items-center">
                <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Account Settings
              </h2>
            </div>
            
            <div className="space-y-4">
              <button className="w-full text-left py-3 px-4 rounded-lg bg-gray-50 hover:bg-customer-50 transition-colors flex justify-between items-center border-l-4 border-customer-500">
                <span className="font-medium text-gray-800">Change Password</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-customer-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 flex justify-between items-center">
                <span className="font-medium">Notification Preferences</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 flex justify-between items-center text-red-600 hover:text-red-800">
                <span className="font-medium">Delete Account</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Modal */}
      <AddressModal 
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={handleAddressSuccess}
        initialAddress={savedAddress?.address || customerAddress}
        initialPhone={savedAddress?.phone || customerPhone}
      />
    </div>
  );
};

export default CustomerProfile;