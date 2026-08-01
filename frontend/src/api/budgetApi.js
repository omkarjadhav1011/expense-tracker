import axiosInstance from './axiosInstance';

// The user is derived from the JWT on the server, so no id is passed here.
const budgetApi = {
  // Budgets the user has set for a "YYYY-MM" month. A null `category` is the
  // overall monthly cap; a non-null one is a per-category cap.
  getBudgetsForMonth: async (month) => {
    const response = await axiosInstance.get('/budgets', { params: { month } });
    return response.data;
  },

  getAllBudgets: async () => {
    const response = await axiosInstance.get('/budgets');
    return response.data;
  },

  // Upserts on (month, category), so saving the same pair twice updates the
  // existing cap rather than adding a duplicate row.
  saveBudget: async ({ month, category, amount }) => {
    const response = await axiosInstance.post('/budgets', { month, category, amount });
    return response.data;
  },

  deleteBudget: async (id) => {
    await axiosInstance.delete(`/budgets/${id}`);
  },
};

export default budgetApi;
