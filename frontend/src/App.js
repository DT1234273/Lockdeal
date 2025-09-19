import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';

// Customer Components
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerProducts from './pages/customer/Products';
import CustomerGroupStatus from './pages/customer/GroupStatus';
import CustomerProfile from './pages/customer/CustomerProfile';
import Reviews from './pages/customer/Reviews';
import CustomerDeals from './pages/customer/Deals';

// Seller Components
import SellerDashboard from './pages/seller/Dashboard';
import SellerUploadProduct from './pages/seller/UploadProduct';
import SellerViewGroups from './pages/seller/ViewGroups';
import SellerVerifyOTP from './pages/seller/VerifyOTP';
import SellerRatings from './pages/seller/Ratings';
import CustomerOrders from './pages/seller/CustomerOrders';

// Layout Components
import CustomerLayout from './components/layouts/CustomerLayout';
import SellerLayout from './components/layouts/SellerLayout';
import Layout from './components/Layout';

// Auth Context
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';



function App() {
  const { user, fetchUserProfile } = useAuth();
  
  // Global user data refresh mechanism
  useEffect(() => {
    // Refresh user data every time App component mounts
    const refreshUserData = async () => {
      try {
        if (user) {
          console.log('App: Refreshing user data...');
          const profileData = await fetchUserProfile();
          console.log('App: User data refreshed:', profileData);
        }
      } catch (error) {
        console.error('App: Failed to refresh user data:', error);
      }
    };
    
    refreshUserData();
  }, [user, fetchUserProfile]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OTPVerification />} />
        </Route>
        
        {/* Customer Routes */}
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="products" element={<CustomerProducts />} />
          <Route path="group-status" element={<CustomerGroupStatus />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="deals" element={<CustomerDeals />} />
        </Route>
        
        {/* Seller Routes */}
        <Route 
          path="/seller" 
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="upload-product" element={<SellerUploadProduct />} />
          <Route path="view-groups" element={<SellerViewGroups />} />
          <Route path="verify-otp" element={<SellerVerifyOTP />} />
          <Route path="ratings" element={<SellerRatings />} />
          <Route path="/seller/customer-orders" element={<CustomerOrders />} />
        </Route>
        
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;