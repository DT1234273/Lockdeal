import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import DealsList from '../../components/seller/DealsList';
import AddressModal from '../../components/AddressModal';
import { useAuth } from '../../context/AuthContext';
import { groupAPI, productAPI, ratingAPI } from '../../services/api';

const Dashboard = () => {
  const { user, setUser, paySellerFee, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [lockedGroups, setLockedGroups] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [processingAcceptId, setProcessingAcceptId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Check if seller has paid the fee
        if (user && user.seller && user.seller.paid_99) {
          console.log('User is a paid seller, fetching data...');
          console.log('Current user data:', user);
          setSellerData(user.seller);
          
          // Fetch seller's products
          console.log('Fetching seller products...');
          try {
            const productsData = await productAPI.getSellerProducts();
            console.log('Seller products:', productsData);
            setProducts(productsData);
          } catch (productError) {
            console.error('Error fetching products:', productError);
          }
          
          // Fetch locked groups
          console.log('Fetching groups...');
          try {
            const groupsData = await groupAPI.getMyGroups();
            console.log('Groups data:', groupsData);
            // Only include locked groups with status 'Ready to Accept'
            setLockedGroups(groupsData.filter(g => g.locked_at && !g.is_picked_up && g.status === 'Ready to Accept'));
          } catch (groupError) {
            console.error('Error fetching groups:', groupError);
          }
          
          // Fetch seller ratings
          console.log('Fetching ratings...');
          try {
            const ratingsData = await ratingAPI.getSellerRatings(user.id);
            console.log('Ratings data:', ratingsData);
            setRatings(ratingsData);
          } catch (ratingError) {
            console.error('Error fetching ratings:', ratingError);
          }
        } else {
          console.log('User is not a paid seller or user data is incomplete:', user);
        }
      } catch (error) {
        console.error('Main dashboard error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePayFee = async () => {
    setIsProcessingPayment(true);
    try {
      console.log('Initiating payment process...');
      const paymentResult = await paySellerFee();
      console.log('Payment result:', paymentResult);
      
      toast.success('Payment successful! Your seller dashboard is now active.');
      setShowPaymentModal(false);
      
      console.log('Payment successful, forcing profile refresh before navigation');
      
      // Force a refresh of the user profile before redirecting
      try {
        const profileData = await fetchUserProfile();
        console.log('Refreshed profile data after payment:', profileData);
        
        // Verify the paid status is correctly set
        if (profileData && profileData.seller && profileData.seller.paid_99) {
          console.log('Verified paid status is true in profile data');
        } else {
          console.warn('Warning: paid_99 status may not be properly set in profile');
        }
        
        // Short delay to ensure state updates before navigation
        setTimeout(() => {
          // Redirect to view-groups page
          navigate('/seller/view-groups');
        }, 1000); // Increased delay for more reliable state update
      } catch (error) {
        console.error('Error refreshing profile after payment:', error);
        // Still redirect even if refresh fails, but with a longer delay
        setTimeout(() => {
          navigate('/seller/view-groups');
        }, 1500);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.detail || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAcceptGroup = async (group) => {
    if (!group) return;
    if (group.is_accepted) {
      toast.info('This group is already accepted');
      return;
    }
    setProcessingAcceptId(group.id);
    try {
      await groupAPI.acceptGroup(group.id);
      toast.success(`Group for ${group.product?.name || 'product'} accepted successfully`);
      // Refresh locked groups list
      try {
        const groupsData = await groupAPI.getMyGroups();
        setLockedGroups(groupsData.filter(g => g.locked_at && !g.is_picked_up && g.status === 'Ready to Accept'));
      } catch (err) {
        console.error('Failed to refresh groups after accept:', err);
      }
    } catch (error) {
      console.error('Error accepting group:', error);
      toast.error(error.detail || 'Failed to accept group');
    } finally {
      setProcessingAcceptId(null);
    }
  };

  const calculateAverageRating = () => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return parseFloat((sum / ratings.length).toFixed(1));
  };

  const averageRating = calculateAverageRating();

  // Average Rating Section
  const renderAverageRatingSection = () => {
    if (ratings.length === 0) return null;
    
    return (
      <div className="bg-gradient-to-br from-white to-seller-50 rounded-xl shadow-md p-6 mt-6 border border-seller-100 transition-all-standard hover:shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-seller-700 flex items-center">
          <svg className="h-6 w-6 mr-2 text-seller-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Average Rating
        </h2>
        <div className="flex items-center bg-white p-4 rounded-lg shadow-sm">
          <div className="flex mr-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star} 
                className={`h-8 w-8 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-200'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-3xl font-bold text-seller-700">{averageRating.toFixed(1)}</span>
          <span className="text-gray-600 ml-1 text-lg">/ 5</span>
          <div className="ml-4 px-3 py-1 bg-seller-100 rounded-full">
            <span className="text-sm font-medium text-seller-700">{ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}</span>
          </div>
        </div>
      </div>
    );
  };

  // Call the renderAverageRatingSection in the return statement
  const averageRatingSection = renderAverageRatingSection();

  // If seller hasn't paid the fee, show payment screen
  if (!user?.seller?.paid_99) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <PageHeader
            title="Activate Your Seller Account"
            subtitle="Unlock all seller features with a one-time payment of just ₹99"
            showBackButton={true}
            backButtonPath="/"
            className="p-8 bg-gradient-to-r from-seller-50 to-white border-seller-100"
          >
            <div className="flex justify-center mt-4">
              <div className="inline-block p-3 rounded-full bg-seller-100 text-seller-600 transition-transform-bounce hover:scale-110">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </PageHeader>
            
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-seller-50 to-white p-6 rounded-xl mb-8 border border-seller-100 shadow-sm transition-all-standard hover:shadow-lg animate-scale-in mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-medium text-gray-800 transition-all-standard hover:text-seller-600">Seller Onboarding Fee</span>
              <span className="text-3xl font-bold text-seller-600 transition-all-standard hover:scale-110 inline-block">₹99</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start transition-all-standard hover:translate-x-1">
                <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 transition-transform-bounce hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg transition-all-standard hover:text-seller-600">Upload and manage your products</span>
              </li>
              <li className="flex items-start transition-all-standard hover:translate-x-1" style={{animationDelay: '100ms'}}>
                <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 transition-transform-bounce hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg transition-all-standard hover:text-seller-600">Accept group orders from customers</span>
              </li>
              <li className="flex items-start transition-all-standard hover:translate-x-1" style={{animationDelay: '200ms'}}>
                <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 transition-transform-bounce hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg transition-all-standard hover:text-seller-600">Receive customer ratings and build your reputation</span>
              </li>
              <li className="flex items-start transition-all-standard hover:translate-x-1" style={{animationDelay: '300ms'}}>
                <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 transition-transform-bounce hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg transition-all-standard hover:text-seller-600">Access to customer groups and order management</span>
              </li>
              <li className="flex items-start transition-all-standard hover:translate-x-1" style={{animationDelay: '400ms'}}>
                <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 transition-transform-bounce hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-lg transition-all-standard hover:text-seller-600">One-time payment, no recurring fees</span>
              </li>
            </ul>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3 px-8 bg-seller-600 hover:bg-seller-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all-standard text-lg flex items-center justify-center hover:scale-105 animate-bounce-in"
              style={{animationDelay: '500ms'}}
            >
              <svg className="h-5 w-5 mr-2 transition-transform-bounce hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pay ₹99 & Activate Now
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-6 animate-fade-in" style={{animationDelay: '600ms'}}>
            <p className="transition-all-standard hover:text-seller-600">By activating your seller account, you agree to LockDeal's terms and conditions for sellers.</p>
          </div>
        </div>
        
        {/* Payment Modal */}
        {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-200 animate-scale-in transition-all-standard">
            <div className="flex justify-between items-center mb-6 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-800 transition-all-standard hover:text-seller-600">Complete Payment</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-seller-600 focus:outline-none transition-all-standard hover:rotate-90"
                disabled={isProcessingPayment}
              >
                <svg className="h-6 w-6 transition-transform-bounce hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 transition-all-standard hover:shadow-md animate-slide-up" style={{animationDelay: '100ms'}}>
              <div className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500 transition-transform-bounce hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm transition-all-standard hover:text-blue-800">
                  This is a demo payment. No actual transaction will occur. In a real application, this would connect to a secure payment gateway.
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-5 mb-6 bg-gray-50 transition-all-standard hover:shadow-md animate-slide-up" style={{animationDelay: '200ms'}}>
              <div className="flex justify-between mb-3">
                <span className="text-gray-700 transition-all-standard hover:text-seller-600">Seller Onboarding Fee</span>
                <span className="font-medium transition-all-standard hover:text-seller-600">₹99.00</span>
              </div>
              <div className="flex justify-between font-bold pt-3 border-t border-gray-200 text-lg">
                <span className="transition-all-standard hover:text-seller-600">Total</span>
                <span className="text-seller-600 transition-all-standard hover:scale-110 inline-block">₹99.00</span>
              </div>
            </div>
            
            <div className="flex justify-between space-x-4 animate-slide-up" style={{animationDelay: '300ms'}}>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-all-standard hover:shadow-md hover:scale-105"
                disabled={isProcessingPayment}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayFee}
                className="flex-1 py-2 px-4 bg-seller-600 hover:bg-seller-700 text-white font-medium rounded-full shadow-sm hover:shadow-lg transition-all-standard hover:scale-105 flex items-center justify-center"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2 transition-transform-bounce hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Pay ₹99
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    );
  }

  // Regular seller dashboard
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <PageHeader
        title={sellerData?.shop_name || `${user?.name || 'Seller'}'s Shop`}
        subtitle={sellerData?.address || 'Address not provided'}
        showBackButton={true}
        backButtonPath="/"
        className="p-6 bg-gradient-to-r from-seller-50 to-white border-seller-100"
      >
        {sellerData?.paid_99 && (
          <div className="mt-2 flex items-center">
            <button 
              onClick={() => setShowAddressModal(true)}
              className="text-seller-600 hover:text-seller-700 text-sm flex items-center transition-all-standard hover:scale-105"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {sellerData?.address ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        )}
        <div className="flex items-center mt-3 animate-slide-in-right" style={{animationDelay: '200ms'}}>
          <span className="text-2xl font-bold text-yellow-500 mr-1 transition-all-standard hover:text-yellow-400">{calculateAverageRating().toFixed(1)}</span>
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star} 
                className={`h-5 w-5 ${star <= Math.round(calculateAverageRating()) ? 'text-yellow-400' : 'text-gray-300'} transition-transform-bounce hover:scale-110`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-500 transition-all-standard hover:text-seller-500">{ratings.length} customer ratings</p>
        </div>
      </PageHeader>

      {/* Deals List */}
      <DealsList />
      
      {/* Navigation Cards */}
      
       
        

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left column - Quick stats */}
        <div className="bg-gradient-to-br from-white to-seller-50 rounded-xl shadow-md p-6 transition-all-standard hover:shadow-lg animate-slide-up border border-seller-100" style={{animationDelay: '300ms'}}>
          <h2 className="text-xl font-semibold mb-4 text-seller-700 flex items-center">
            <svg className="h-6 w-6 mr-2 text-seller-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm transition-all-standard hover:bg-seller-50 hover:shadow hover:scale-105" style={{animationDelay: '400ms'}}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-seller-100 mr-3">
                  <svg className="h-5 w-5 text-seller-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Products</span>
              </div>
              <span className="font-bold text-seller-700 text-lg">{products.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm transition-all-standard hover:bg-seller-50 hover:shadow hover:scale-105" style={{animationDelay: '500ms'}}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-seller-100 mr-3">
                  <svg className="h-5 w-5 text-seller-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Locked Groups</span>
              </div>
              <span className="font-bold text-seller-700 text-lg">{lockedGroups.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm transition-all-standard hover:bg-seller-50 hover:shadow hover:scale-105" style={{animationDelay: '600ms'}}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 mr-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Total Value</span>
              </div>
              <span className="font-bold text-green-600 text-lg">
                ₹{lockedGroups.reduce((acc, group) => acc + group.total_price, 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <Link to="/seller/upload-product" className="w-full py-3 px-4 bg-seller-600 hover:bg-seller-700 text-white font-medium rounded-lg shadow-sm hover:shadow-lg transition-all-standard flex items-center justify-center hover:scale-105">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Product
            </Link>
            <Link to="/seller/view-groups" className="w-full py-3 px-4 bg-white border border-seller-300 hover:bg-seller-50 text-seller-700 font-medium rounded-lg shadow-sm hover:shadow-lg transition-all-standard flex items-center justify-center hover:scale-105">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Manage Groups
            </Link>
          </div>
        </div>

        {/* Middle column - Recent groups */}
        <div className="bg-gradient-to-br from-white to-seller-50 rounded-xl shadow-md p-6 border border-seller-100 transition-all-standard hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-seller-700 flex items-center">
            <svg className="h-6 w-6 mr-2 text-seller-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Recent Locked Groups
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-8 w-8 text-seller-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : lockedGroups.length > 0 ? (
            <div className="space-y-4">
              {lockedGroups.slice(0, 3).map((group) => (
                <div key={group.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all-standard hover:scale-102 border border-seller-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{group.product.name}</span>
                    <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                      Locked
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">₹{group.total_price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-seller-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{group.members} members</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Locked on: {new Date(group.locked_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleAcceptGroup(group)}
                      className="py-2 px-4 bg-seller-600 hover:bg-seller-700 text-white font-medium rounded-full shadow-sm hover:shadow-lg transition-all-standard flex items-center"
                      disabled={processingAcceptId === group.id}
                    >
                      {processingAcceptId === group.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Accepting...
                        </>
                      ) : (
                        'Accept Group'
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <Link to="/seller/view-groups" className="block text-center text-seller-600 hover:text-seller-700 text-sm font-medium mt-4 py-2 px-4 rounded-lg border border-seller-200 hover:bg-seller-50 transition-all-standard">
                View all groups →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-dashed border-seller-200">
              <svg className="h-12 w-12 mx-auto text-seller-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 font-medium mb-2">No locked groups yet</p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Groups will appear here when they reach ₹1000 total value and have 10+ members.
              </p>
            </div>
          )}
        </div>

        {/* Right column - Recent ratings */}
        <div className="bg-gradient-to-br from-white to-seller-50 rounded-xl shadow-md p-6 border border-seller-100 transition-all-standard hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-seller-700 flex items-center">
            <svg className="h-6 w-6 mr-2 text-seller-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Recent Ratings
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-8 w-8 text-seller-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all-standard hover:scale-102 border border-seller-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${i < rating.score ? 'text-yellow-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium text-seller-700">{rating.score}/5</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(rating.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  {rating.feedback && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-2 border-seller-300 italic">
                      <svg className="h-4 w-4 text-gray-400 inline-block mr-1 mb-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      {rating.feedback}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/seller/ratings" className="block text-center text-seller-600 hover:text-seller-700 text-sm font-medium mt-4 py-2 px-4 rounded-lg border border-seller-200 hover:bg-seller-50 transition-all-standard">
                View all ratings →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-dashed border-seller-200">
              <svg className="h-12 w-12 mx-auto text-seller-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-gray-600 font-medium mb-2">No ratings yet</p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Ratings will appear here when customers review your products.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSuccess={(data) => {
            setShowAddressModal(false);
            toast.success('Address updated successfully!');
            // Refresh user profile to get updated address
            fetchUserProfile().then(profileData => {
              const updatedUserData = { ...user, ...profileData };
              console.log('Dashboard: user before setUser', user);
              console.log('Dashboard: profileData before setUser', profileData);
              console.log('Dashboard: setUser function', setUser);
              setUser(updatedUserData);
              localStorage.setItem('user', JSON.stringify(updatedUserData));
              // Update seller data state
              setSellerData(profileData.seller);
            });
          }}
          initialAddress={sellerData?.address || ''}
          initialPhone={sellerData?.contact || ''}
        />
      )}
    </div>
  );
};

export default Dashboard;