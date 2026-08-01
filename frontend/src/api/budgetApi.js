import axiosInstance from './axiosInstance';

// NOTE: BudgetController takes userId as a path variable rather than deriving it
// from the JWT, so every call here needs the id from `GET /users/me`.
const budgetApi = {
  // Budgets the user has set for a "YYYY-MM" month. A null `category` is the
  // overall monthly cap; a non-null one is a per-category cap.
  getBudgetsForMonth: async (userId, month) => {
    const response = await axiosInstance.get(`/budgets/user/${userId}/${month}`);
    return response.data;
  },

  getAllBudgets: async (userId) => {
    const response = await axiosInstance.get(`/budgets/user/${userId}`);
    return response.data;
  },

  // Creates a budget row. The endpoint accepts the Budget entity directly.
  saveBudget: async (budget) => {
    const response = await axiosInstance.post('/budgets', budget);
    return response.data;
  },

  deleteBudget: async (id) => {
    await axiosInstance.delete(`/budgets/${id}`);
  },
};

export default budgetApi;
