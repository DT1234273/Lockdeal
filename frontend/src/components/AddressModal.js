import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AddressModal = ({ isOpen, onClose, onSuccess, initialAddress, initialPhone }) => {
  const { user, customerAddress, updateCustomerAddress, updateSellerAddress } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  
  // Handle form field updates based on modal state
  useEffect(() => {
    if (!isOpen) {
      // Reset form fields when modal is closed
      setIsProcessing(false);
      return;
    }
    
    // Clear form fields first
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setPhone('');
    
    // Then load data if available
    // First try to use initialAddress prop if provided
    if (initialAddress) {
      // Parse the full address if it exists
      const addressParts = initialAddress.split(', ');
      if (addressParts.length >= 3) {
        setAddress(addressParts[0]);
        setCity(addressParts[1]);
        
        // Handle state and pincode which are in format "State - Pincode"
        const stateAndPincode = addressParts[2].split(' - ');
        if (stateAndPincode.length === 2) {
          setState(stateAndPincode[0]);
          setPincode(stateAndPincode[1]);
        }
      }
    } else if (customerAddress && customerAddress.address) {
      // Fallback to context data if props not provided
      const addressParts = customerAddress.address.split(', ');
      if (addressParts.length >= 3) {
        setAddress(addressParts[0]);
        setCity(addressParts[1]);
        
        // Handle state and pincode which are in format "State - Pincode"
        const stateAndPincode = addressParts[2].split(' - ');
        if (stateAndPincode.length === 2) {
          setState(stateAndPincode[0]);
          setPincode(stateAndPincode[1]);
        }
      }
    }
    
    // Set phone number
    if (initialPhone) {
      setPhone(initialPhone);
    } else if (customerAddress && customerAddress.phone) {
      setPhone(customerAddress.phone);
    }
  }, [customerAddress, initialAddress, initialPhone, isOpen]);

  // Format phone number
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  // Format pincode
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length <= 6) {
      setPincode(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (address.trim() === '') {
      toast.error('Please enter your address');
      return;
    }
    
    if (city.trim() === '') {
      toast.error('Please enter your city');
      return;
    }
    
    if (state.trim() === '') {
      toast.error('Please enter your state');
      return;
    }
    
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Format the complete address
      const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
      
      // Check if user is a seller or customer and update accordingly
      if (user?.role === 'seller') {
        // Update seller address
        await updateSellerAddress({
          address: fullAddress,
          contact: phone
        });
      } else {
        // Save address using the context function
        const addressData = {
          address: fullAddress,
          phone: phone
        };
        
        await updateCustomerAddress(addressData);
      }
      
      // Call the success callback if provided
      onSuccess && onSuccess({
        address: fullAddress,
        phone: phone
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save address. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with blur effect */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
        </div>

        {/* Modal panel with animation */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 animate-bounce-in">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-400 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary-400 rounded-full opacity-20 blur-xl"></div>
          <div className="bg-gradient-to-b from-white to-gray-50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative overflow-hidden">
            <div className="sm:flex sm:items-start relative z-10">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-primary-100 text-primary-600 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  Delivery Address
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Please provide your delivery address where you'd like to receive your group purchases.
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="mb-4 group">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                        Address
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="address"
                          className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                          placeholder="House/Flat No., Building, Street"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="group">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                          City
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="city"
                            className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                          State
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="state"
                            className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="group">
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                          Pincode
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="pincode"
                            className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                            placeholder="6-digit Pincode"
                            value={pincode}
                            onChange={handlePincodeChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                          Phone Number
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="phone"
                            className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                            placeholder="10-digit Phone Number"
                            value={phone}
                            onChange={handlePhoneChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105 shadow-sm font-medium text-sm"
                        onClick={onClose}
                        disabled={isProcessing}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-all duration-200"></span>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105 shadow-md font-medium text-sm"
                        disabled={isProcessing}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-all duration-200"></span>
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <LoadingSpinner size="small" />
                            <span className="ml-2">Saving...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Address
                          </div>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;