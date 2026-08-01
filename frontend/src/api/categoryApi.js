import axiosInstance from './axiosInstance';

const categoryApi = {
  // Get categories by type (INCOME or EXPENSE) - filtered by current user
  getCategoriesByType: async (type) => {
    const response = await axiosInstance.get(`/categories?type=${type}`);
    return response.data;
  },

  // Get all categories for current user. `GET /categories` requires the `type`
  // request param, so both types are fetched and merged here.
  getAllCategories: async () => {
    const [expense, income] = await Promise.all([
      categoryApi.getCategoriesByType('EXPENSE'),
      categoryApi.getCategoriesByType('INCOME'),
    ]);
    return [...(expense || []), ...(income || [])];
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/categories', categoryData);
    return response.data;
  },

  // Delete a category
  deleteCategory: async (id) => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};

export default categoryApi;