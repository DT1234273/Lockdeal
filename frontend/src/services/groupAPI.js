import axios from './axiosConfig';

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
  
  getCompletedGroups: async () => {
    try {
      const response = await axios.get('/api/groups/completed');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch completed groups' };
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
  
  joinGroup: async (groupId, quantity) => {
    try {
      const response = await axios.post('/api/groups/join', {
        group_id: groupId,
        quantity: quantity
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
      const response = await axios.post(`/api/group/lock-and-accept/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to accept group' };
    }
  },
  
  // Pickup verification functionality removed
};