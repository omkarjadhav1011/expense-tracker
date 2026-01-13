import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag
} from 'lucide-react';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import transactionApi from '../../api/transactionApi';
import './TransactionList.css';

const TransactionList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, transaction: null });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType]);

  const fetchTransactions = async () => {
    try {
      const response = await transactionApi.getAllTransactions();
      setTransactions(response || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
  };

  const handleDelete = (transaction) => {
    setDeleteModal({ isOpen: true, transaction });
  };

  const confirmDelete = async () => {
    try {
      await transactionApi.deleteTransaction(deleteModal.transaction.id);

      // Remove from local state
      setTransactions(prev => prev.filter(t => t.id !== deleteModal.transaction.id));
      setDeleteModal({ isOpen: false, transaction: null });

      // Show success message
      alert('Transaction deleted successfully!');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="transaction-list-container">
        <div className="transaction-list-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-white">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      <div className="transaction-list-card">
      {/* Header */}
      <header className="transaction-list-header">
        <button
          className="transaction-list-back-button"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <h1 className="transaction-list-title">All Transactions</h1>
        <div className="transaction-list-header-actions">
          <button
            className="transaction-list-add-category-button"
            onClick={() => navigate('/add-category')}
          >
            <Tag className="w-4 h-4" />
            Add Category
          </button>
          <button
            className="transaction-list-add-button"
            onClick={() => navigate('/add-transaction')}
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="transaction-list-filters">
        <div className="transaction-list-search">
          <Search className="transaction-list-search-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="transaction-list-search-input"
          />
        </div>

        <div className="transaction-list-filter-buttons">
          <button
            className={`transaction-list-filter-button ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All
          </button>
          <button
            className={`transaction-list-filter-button ${filterType === 'INCOME' ? 'active' : ''}`}
            onClick={() => setFilterType('INCOME')}
          >
            Income
          </button>
          <button
            className={`transaction-list-filter-button ${filterType === 'EXPENSE' ? 'active' : ''}`}
            onClick={() => setFilterType('EXPENSE')}
          >
            Expense
          </button>
        </div>
      </div>

        {/* Transaction Table */}
        {loading ? (
          <div className="transaction-list-loading">
            <div className="transaction-list-loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="transaction-list-empty">
            <p className="transaction-list-empty-text">
              {searchTerm || filterType !== 'ALL'
                ? 'No transactions match your filters'
                : 'No transactions yet'}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/add-transaction')}
            >
              <Plus className="w-4 h-4" />
              Add Your First Transaction
            </Button>
          </div>
        ) : (
          <div className="transaction-list-table-container">
            <table className="transaction-list-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.transactionDate || transaction.date)}</td>
                    <td>{transaction.categoryName || transaction.category?.name || transaction.category}</td>
                    <td>
                      <span className={`transaction-list-${transaction.type.toLowerCase()}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`transaction-list-amount-${transaction.type.toLowerCase()}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>{transaction.description}</td>
                    <td>
                      <div className="transaction-list-actions">
                        <button
                          className="transaction-list-edit-button transaction-list-action-button"
                          onClick={() => navigate(`/edit-transaction/${transaction.id}`)}
                          title="Edit transaction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="transaction-list-delete-button transaction-list-action-button"
                          onClick={() => handleDelete(transaction)}
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, transaction: null })}
        title="Delete Transaction"
        size="small"
      >
        <div className="transaction-delete-modal">
          <p className="transaction-delete-message">
            Are you sure you want to delete this transaction?
          </p>
          {deleteModal.transaction && (
            <div className="transaction-delete-details">
              <p className="transaction-delete-description">
                "{deleteModal.transaction.description}"
              </p>
              <p className="transaction-delete-amount">
                {deleteModal.transaction.type === 'INCOME' ? '+' : '-'}
                {formatCurrency(deleteModal.transaction.amount)}
              </p>
            </div>
          )}
          <div className="transaction-delete-actions">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, transaction: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>      </div>    </div>
  );
};

export default TransactionList;