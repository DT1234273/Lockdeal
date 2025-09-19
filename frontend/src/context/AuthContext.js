import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tempEmail, setTempEmail] = useState('');
  
  // Customer address state
  const [customerAddress, setCustomerAddress] = useState(null);
  
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'An error occurred while fetching user profile' };
    }
  };
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUserData = JSON.parse(userData);
      setUser(parsedUserData);
      setIsAuthenticated(true);
      
      // Fetch complete user profile if we have a token
      if (parsedUserData && parsedUserData.id) {
        fetchUserProfile()
          .then(profileData => {
            // Update user data with complete profile
            const updatedUserData = { ...parsedUserData, ...profileData };
            setUser(updatedUserData);
            localStorage.setItem('user', JSON.stringify(updatedUserData));
          })
          .catch(error => {
            console.error('Failed to fetch user profile:', error);
          });
      }
      
      // Token is handled by axios interceptors in axiosConfig.js
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setTempEmail(email);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'An error occurred during login' };
    }
  };
  
  const register = async (name, email, password, confirmPassword, role) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, confirm_password: confirmPassword, role });
      setTempEmail(email);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'An error occurred during registration' };
    }
  };
  
  const resendOTP = async (email) => {
    try {
      const response = await axios.post('/api/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'An error occurred while resending OTP' };
    }
  };

  const verifyOTP = async (email, otp_code) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp_code });
      const { access_token, user_id, role } = response.data;
      
      // Save token and user data
      localStorage.setItem('token', access_token);
      const userData = { id: user_id, email, role };
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user in state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Token is handled by axios interceptors in axiosConfig.js
      
      // Fetch complete user profile after successful login
      try {
        const profileData = await fetchUserProfile();
        const updatedUserData = { ...userData, ...profileData };
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // If user is a seller, create seller profile if it doesn't exist
        if (role === 'seller' && !profileData.seller) {
          console.log('Creating seller profile for user:', user_id);
          try {
            // Default seller data
            const defaultSellerData = {
              shop_name: profileData.name + "'s Shop",
              address: "",
              contact: ""
            };
            
            // Register seller profile
            await registerSeller(defaultSellerData);
            
            // Fetch updated profile after seller registration
            const updatedProfileData = await fetchUserProfile();
            const finalUserData = { ...updatedUserData, ...updatedProfileData };
            setUser(finalUserData);
            localStorage.setItem('user', JSON.stringify(finalUserData));
          } catch (sellerError) {
            console.error('Failed to create seller profile:', sellerError);
          }
        }
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'An error occurred during OTP verification' };
    }
  };
  
  const logout = () => {
    // Remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Token removal is handled by axios interceptors in axiosConfig.js
  };
  
  const registerSeller = async (sellerData) => {
    try {
      console.log('Registering seller with data:', sellerData);
      console.log('User ID:', user.id);
      const response = await axios.post(`/api/auth/register-seller?user_id=${user.id}`, sellerData);
      console.log('Seller registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Seller registration error:', error);
      throw error.response?.data || { detail: 'An error occurred during seller registration' };
    }
  };
  
  const updateSellerAddress = async (addressData) => {
    try {
      console.log('Updating seller address for user ID:', user.id);
      const response = await axios.put('/api/auth/update-seller-profile', { 
        address: addressData.address,
        contact: addressData.contact
      });
      
      // Fetch updated profile after address update
      const profileData = await fetchUserProfile();
      const updatedUserData = { ...user, ...profileData };
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return response.data;
    } catch (error) {
      console.error('Failed to update seller address:', error);
      throw error.response?.data || { detail: 'An error occurred while updating seller address' };
    }
  };
  
  const updateCustomerAddress = async (addressData) => {
    try {
      // Store address in local storage for now (frontend-only implementation)
      // In a real implementation, this would call a backend API endpoint
      setCustomerAddress(addressData);
      
      // Update the user object with the address information
      const updatedUserData = { 
        ...user, 
        customerAddress: addressData 
      };
      
      setUser(updatedUserData);
      localStorage.setItem('customerAddress', JSON.stringify(addressData));
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      toast.success('Address updated successfully!');
      return { success: true, message: 'Address updated successfully' };
    } catch (error) {
      console.error('Failed to update customer address:', error);
      // Removed toast.error to prevent 'not found' popup
      throw error.response?.data || { detail: 'An error occurred while updating customer address' };
    }
  };
  
  const paySellerFee = async () => {
    try {
      console.log('Processing payment for user ID:', user.id);
      const response = await axios.post(`/api/auth/pay-seller-fee/${user.id}`);
      
      console.log('Payment successful, updating user data...');
      console.log('Payment response:', response.data);
      console.log('Current user state:', user);
      
      // Use the seller data from the response if available
      const sellerFromResponse = response.data.seller;
      
      // Always fetch the complete profile after payment to ensure we have the latest data
      try {
        const profileData = await fetchUserProfile();
        console.log('Fetched profile data:', profileData);
        
        // Create updated user with paid_99 set to true
        const updatedUserData = { 
          ...user, 
          ...profileData,
          seller: {
            ...(profileData.seller || {}),
            paid_99: true
          }
        };
        
        console.log('Updated user data:', updatedUserData);
        
        // Update state and localStorage
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
      } catch (profileError) {
        console.error('Failed to fetch updated user profile:', profileError);
        
        // Fallback: Use seller data from response if available
        if (sellerFromResponse && sellerFromResponse.paid_99) {
          console.log('Using seller data from response as fallback');
          const updatedSeller = { ...user.seller, paid_99: sellerFromResponse.paid_99 };
          const updatedUser = { ...user, seller: updatedSeller };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          // Last resort fallback
          console.log('Using hardcoded fallback for seller data');
          const updatedSeller = { ...user.seller, paid_99: true };
          const updatedUser = { ...user, seller: updatedSeller };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Payment error:', error);
      // Don't show toast.error for payment errors
      throw error.response?.data || { detail: 'An error occurred during payment. Please try again.' };
    }
  };
  
  // Load customer address from localStorage on initialization
  useEffect(() => {
    const savedAddress = localStorage.getItem('customerAddress');
    if (savedAddress) {
      try {
        setCustomerAddress(JSON.parse(savedAddress));
      } catch (error) {
        console.error('Failed to parse saved customer address:', error);
      }
    }
  }, []);
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        tempEmail,
        customerAddress,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        registerSeller,
        updateSellerAddress,
        updateCustomerAddress,
        paySellerFee,
        fetchUserProfile,
        setTempEmail
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};