import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import transactionApi from '../../api/transactionApi';
import categoryApi from '../../api/categoryApi';
import './EditTransaction.css';

const EditTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    date: '',
    description: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      // Fetch transaction details
      const transaction = await transactionApi.getTransactionById(id);

      // Fetch categories for the transaction type
      const categoriesResponse = await categoryApi.getCategoriesByType(transaction.type);
      setCategories(categoriesResponse || []);

      // Set form data
      const formData = {
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.categoryId || transaction.category?.id?.toString() || '',
        date: transaction.transactionDate,
        description: transaction.description || ''
      };

      setFormData(formData);
      setOriginalData(formData);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      navigate('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // If type changes, fetch new categories and reset category selection
    if (field === 'type') {
      try {
        const categoriesResponse = await categoryApi.getCategoriesByType(value);
        setCategories(categoriesResponse.data || []);
        setFormData(prev => ({
          ...prev,
          categoryId: ''
        }));
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        transactionDate: formData.date,
        categoryId: parseInt(formData.categoryId),
        description: formData.description || null,
        type: formData.type
      };

      await transactionApi.updateTransaction(id, transactionData);

      // Show success message and navigate
      alert('Transaction updated successfully!');
      navigate('/transactions');

    } catch (err) {
      console.error('Error updating transaction:', err);
      if (err.response?.data?.message) {
        setErrors({ submit: err.response.data.message });
      } else {
        setErrors({ submit: 'Failed to update transaction. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (loading) {
    return (
      <div className="edit-transaction-container">
        <div className="edit-transaction-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-white">Loading transaction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-transaction-container">
      {/* Header */}
      <header className="edit-transaction-header">
        <button
          className="edit-transaction-back-button"
          onClick={() => navigate('/transactions')}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Transactions
        </button>
        <h1 className="edit-transaction-title">Edit Transaction</h1>
      </header>

      {/* Form */}
      <main className="edit-transaction-main">
        <div className="edit-transaction-form-container">
          <form className="edit-transaction-form" onSubmit={handleSubmit}>
            {/* Transaction Type */}
            <div className="edit-transaction-type-selector">
              <label className="edit-transaction-type-label">Transaction Type</label>
              <div className="edit-transaction-type-buttons">
                <button
                  type="button"
                  className={`edit-transaction-type-button ${formData.type === 'INCOME' ? 'active income' : ''}`}
                  onClick={() => handleInputChange('type', 'INCOME')}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`edit-transaction-type-button ${formData.type === 'EXPENSE' ? 'active expense' : ''}`}
                  onClick={() => handleInputChange('type', 'EXPENSE')}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Amount */}
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              error={errors.amount}
              required
              step="0.01"
              min="0"
            />

            {/* Category */}
            <div className="edit-transaction-form-group">
              <label className="edit-transaction-form-label">
                Category <span className="edit-transaction-required">*</span>
              </label>
              <select
                className={`edit-transaction-select ${errors.categoryId ? 'error' : ''}`}
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <div className="edit-transaction-error-message">{errors.categoryId}</div>
              )}
            </div>

            {/* Date */}
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={errors.date}
              required
            />

            {/* Description */}
            <div className="edit-transaction-form-group">
              <label className="edit-transaction-form-label">Description (Optional)</label>
              <textarea
                className="edit-transaction-textarea"
                placeholder="Add a note about this transaction..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="edit-transaction-submit-error">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              className="edit-transaction-submit-button"
              disabled={saving || !hasChanges()}
            >
              {saving ? 'Updating Transaction...' : 'Update Transaction'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditTransaction;