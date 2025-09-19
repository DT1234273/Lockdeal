import axios from './axiosConfig';

export const dealAPI = {
  getAllDeals: async () => {
    try {
      const response = await axios.get('/api/deals/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch deals' };
    }
  },
  
  getSellerDeals: async () => {
    try {
      const response = await axios.get('/api/deals/seller');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch seller deals' };
    }
  },
  
  getDeal: async (id) => {
    try {
      const response = await axios.get(`/api/deals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch deal' };
    }
  },
  
  createDeal: async (dealData) => {
    try {
      const response = await axios.post('/api/deals/', dealData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to create deal' };
    }
  },
  
  updateDeal: async (id, dealData) => {
    try {
      const response = await axios.put(`/api/deals/${id}`, dealData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update deal' };
    }
  },
  
  getCustomerProducts: async (customerId) => {
    try {
      const response = await axios.get(`/api/deals/customer-products/${customerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch customer products' };
    }
  },
  
  confirmOrder: async (groupMemberId) => {
    try {
      const response = await axios.post(`/api/deals/confirm-order/${groupMemberId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to confirm order' };
    }
  }
};