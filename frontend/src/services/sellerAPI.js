import axios from 'axios';

export const sellerAPI = {
  getSellerById: async (sellerId) => {
    try {
      const response = await axios.get(`/api/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch seller information' };
    }
  }
};