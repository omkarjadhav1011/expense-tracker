import axiosInstance from './axiosInstance';

const transactionApi = {
  // Get all transactions
  getAllTransactions: async () => {
    const response = await axiosInstance.get('/transactions');
    return response.data;
  },

  // Get a single transaction by ID
  getTransactionById: async (id) => {
    const response = await axiosInstance.get(`/transactions/${id}`);
    return response.data;
  },

  // Add a new transaction
  addTransaction: async (transactionData) => {
    const response = await axiosInstance.post('/transactions', transactionData);
    return response.data;
  },

  // Update a transaction
  updateTransaction: async (id, transactionData) => {
    const response = await axiosInstance.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete a transaction
  deleteTransaction: async (id) => {
    await axiosInstance.delete(`/transactions/${id}`);
  },

  // Get transaction summary (total income, expense, balance)
  getTransactionSummary: async () => {
    const response = await axiosInstance.get('/transactions/summary');
    return response.data;
  },
};

export default transactionApi;