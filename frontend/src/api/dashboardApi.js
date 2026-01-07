import axiosInstance from './axiosInstance';

const dashboardApi = {
  // Get monthly summary (totalIncome, totalExpense, balance)
  getSummary: async () => {
    const response = await axiosInstance.get('/dashboard/summary');
    return response.data;
  },

  // Get category-wise breakdown
  getCategoryBreakdown: async (type = 'EXPENSE') => {
    const response = await axiosInstance.get(`/dashboard/category-breakdown?type=${type}`);
    return response.data;
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 5) => {
    const response = await axiosInstance.get(`/dashboard/recent-transactions?limit=${limit}`);
    return response.data;
  },

  // Get monthly trend data
  getMonthlyTrend: async (months = 6) => {
    const response = await axiosInstance.get(`/dashboard/monthly-trend?months=${months}`);
    return response.data;
  },
};

export default dashboardApi;