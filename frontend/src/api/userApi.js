import axiosInstance from './axiosInstance';

const userApi = {
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },

  updateCurrentUser: async (userData) => {
    const response = await axiosInstance.put('/users/me', userData);
    return response.data;
  },
};

export default userApi;