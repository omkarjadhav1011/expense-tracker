import axiosInstance from './axiosInstance';

const categoryApi = {
  // Get categories by type (INCOME or EXPENSE) - filtered by current user
  getCategoriesByType: async (type) => {
    const response = await axiosInstance.get(`/categories?type=${type}`);
    return response.data;
  },

  // Get all categories for current user
  getAllCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/categories', categoryData);
    return response.data;
  },

  // Update a category
  updateCategory: async (id, categoryData) => {
    const response = await axiosInstance.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete a category
  deleteCategory: async (id) => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};

export default categoryApi;