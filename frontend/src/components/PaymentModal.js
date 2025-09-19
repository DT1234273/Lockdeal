import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const { paySellerFee } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length <= 16) {
      const parts = [];
      for (let i = 0; i < value.length; i += 4) {
        parts.push(value.substring(i, i + 4));
      }
      setCardNumber(parts.join(' ').trim());
    }
  };

  // Format expiry date as MM/YY
  const handleExpiryDateChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      if (value.length > 2) {
        setExpiryDate(value.substring(0, 2) + '/' + value.substring(2));
      } else {
        setExpiryDate(value);
      }
    }
  };

  // Limit CVV to 3 digits
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (cardNumber.replace(/\s+/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }
    
    if (expiryDate.length !== 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return;
    }
    
    if (name.trim() === '') {
      toast.error('Please enter the cardholder name');
      return;
    }
    
    setIsProcessing(true);
    try {
      // In a real app, this would process the payment through a payment gateway
      // For this demo, we'll just simulate a successful payment
      await paySellerFee();
      toast.success('Payment successful! Your seller account is now active.');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  Seller Onboarding Fee
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    To activate your seller account, please pay the one-time onboarding fee of ₹99. This fee helps us maintain quality service for all sellers.
                  </p>
                  
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-5 rounded-xl mb-6 shadow-sm border border-gray-100 transform transition-all hover:shadow-md hover:scale-[1.01] duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Onboarding Fee:
                      </span>
                      <span className="font-medium">₹99.00</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-gray-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tax:
                      </span>
                      <span className="font-medium">₹0.00</span>
                    </div>
                    <div className="border-t border-gray-200 my-3"></div>
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-primary-600">₹99.00</span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="mb-4 group">
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                        Card Number
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="cardNumber"
                          className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="group">
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                          Expiry Date
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="expiryDate"
                            className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                          CVV
                        </label>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="cvv"
                            className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                            placeholder="123"
                            value={cvv}
                            onChange={handleCvvChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4 group">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-primary-600 transition-colors duration-200">
                        Cardholder Name
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="name"
                          className="form-input pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:border-primary-300"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
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
                        className="relative overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-medium text-sm group"
                        disabled={isProcessing}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-all duration-200"></span>
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <LoadingSpinner size="small" />
                            <span className="ml-2">Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Pay ₹99
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

export default PaymentModal;