import axios from './axiosConfig';
import { dealAPI } from './dealAPI';
import { sellerAPI } from './sellerAPI';

// Product API
export const productAPI = {
  getAllProducts: async () => {
    try {
      const response = await axios.get('/api/product/');
      return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Failed to fetch products' };
      }
  },
  
  getSellerProducts: async () => {
    try {
      const response = await axios.get('/api/product/seller');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch seller products' };
    }
  },
  
  getProduct: async (id) => {
    try {
      const response = await axios.get(`/api/product/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch product' };
    }
  },
  
  createProduct: async (formData) => {
    try {
      const response = await axios.post('/api/product/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to create product' };
    }
  },
  
  updateProduct: async (id, formData) => {
    try {
      const response = await axios.put(`/api/product/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update product' };
    }
  },
  
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`/api/product/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to delete product' };
    }
  },
};

// Group API
export const groupAPI = {
  getAllGroups: async () => {
    try {
      const response = await axios.get('/api/groups/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch groups' };
    }
  },
  
  getMyGroups: async () => {
    try {
      const response = await axios.get('/api/groups/my-groups');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch your groups' };
    }
  },
  
  getGroup: async (id) => {
    try {
      const response = await axios.get(`/api/groups/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch group' };
    }
  },
  
  createGroup: async (productId) => {
    try {
      const response = await axios.post('/api/groups/', { product_id: productId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to create group' };
    }
  },
  
  joinGroup: async (groupId, quantity) => {
    try {
      const response = await axios.post('/api/groups/join', {
        group_id: groupId,
        quantity: quantity,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to join group' };
    }
  },
  
  lockGroup: async (groupId) => {
    try {
      const response = await axios.post(`/api/groups/lock/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to lock group' };
    }
  },
  
  acceptGroup: async (groupId) => {
    try {
      const response = await axios.post(`/api/groups/lock-and-accept/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to accept group' };
    }
  },
  
  // Pickup verification functionality removed
  
  sendDistributionOtp: async (groupId) => {
    try {
      const response = await axios.post(`/api/groups/send-distribution-otp/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to send distribution OTP' };
    }
  },
  
  verifyDistributionOtp: async (groupId, otp) => {
    try {
      const response = await axios.post('/api/groups/verify-distribution-otp', {
        group_id: groupId,
        otp: otp
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to verify distribution OTP' };
    }
  },
  
  getAvailableGroups: async () => {
    try {
      const response = await axios.get('/api/groups/available');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch available groups' };
    }
  },
  
  getAcceptedGroups: async () => {
    try {
      const response = await axios.get('/api/groups/accepted');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch accepted groups' };
    }
  },
};

// Rating API
export const ratingAPI = {
  getSellerRatings: async (sellerId) => {
    try {
      const response = await axios.get(`/api/ratings/seller/${sellerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch seller ratings' };
    }
  },
  
  createRating: async (ratingData) => {
    try {
      const response = await axios.post('/api/ratings/', ratingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to create rating' };
    }
  },
  
  getMyRatings: async () => {
    try {
      const response = await axios.get('/api/ratings/my-ratings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch your ratings' };
    }
  },
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendedProducts: async (limit = 5) => {
    try {
      const response = await axios.get(`/api/recommendations/products/recommended?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch recommended products' };
    }
  },
};

// Export dealAPI
export { dealAPI, sellerAPI };

