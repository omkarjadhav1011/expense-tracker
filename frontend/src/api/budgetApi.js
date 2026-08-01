import axiosInstance from './axiosInstance';

/**
 * Budgets are split in two on the server:
 *   /budgets/monthly  — one overall cap per month
 *   /budgets/category — per-category caps, keyed by categoryId
 *
 * Both take `month` (1-12) and `year` as separate integers, not a "YYYY-MM"
 * string, and the user comes from the JWT. The server enforces that the
 * per-category caps never total more than the monthly cap, so a monthly cap has
 * to exist before any category cap can be set.
 */
const budgetApi = {
  // Returns null when no cap is set for the month — that is a normal state.
  getMonthlyBudget: async (month, year) => {
    const response = await axiosInstance.get('/budgets/monthly', {
      params: { month, year },
    });
    return response.data || null;
  },

  // Upserts on (month, year).
  saveMonthlyBudget: async ({ month, year, amount, currency }) => {
    const response = await axiosInstance.post('/budgets/monthly', {
      month,
      year,
      amount,
      currency,
    });
    return response.data;
  },

  deleteMonthlyBudget: async (month, year) => {
    await axiosInstance.delete('/budgets/monthly', { params: { month, year } });
  },

  getCategoryBudgets: async (month, year) => {
    const response = await axiosInstance.get('/budgets/category', {
      params: { month, year },
    });
    return response.data;
  },

  // Upserts on (categoryId, month, year).
  saveCategoryBudget: async ({ categoryId, month, year, allocatedAmount }) => {
    const response = await axiosInstance.post('/budgets/category', {
      categoryId,
      month,
      year,
      allocatedAmount,
    });
    return response.data;
  },

  deleteCategoryBudget: async (id) => {
    await axiosInstance.delete(`/budgets/category/${id}`);
  },

  // Caps vs actual spend, computed server-side from the transaction ledger.
  getMonthlySummary: async (month, year) => {
    const response = await axiosInstance.get('/budgets/monthly/summary', {
      params: { month, year },
    });
    return response.data;
  },

  getCategorySummary: async (month, year) => {
    const response = await axiosInstance.get('/budgets/category/summary', {
      params: { month, year },
    });
    return response.data;
  },
};

export default budgetApi;
