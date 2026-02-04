import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import transactionApi from '../../api/transactionApi';
import categoryApi from '../../api/categoryApi';
import './AddTransaction.css';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [formData.type]);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getCategoriesByType(formData.type);
      setCategories(response);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field, value) => {
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

    // Reset category when type changes
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        categoryId: ''
      }));
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

    setLoading(true);
    setErrors({});

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        transactionDate: formData.date,
        categoryId: parseInt(formData.categoryId),
        description: formData.description || null,
        type: formData.type
      };

      await transactionApi.addTransaction(transactionData);

      // Reset form
      setFormData({
        amount: '',
        categoryId: '',
        date: '',
        description: '',
        type: 'EXPENSE'
      });
      setErrors({});

      // Show success message and navigate
      alert('Transaction added successfully!');
      navigate('/dashboard');

    } catch (err) {
      console.error('Error creating transaction:', err);
      if (err.response?.data?.message) {
        setErrors({ submit: err.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create transaction. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-transaction-container">
      <div className="add-transaction-card">
        {/* Header */}
        <div className="add-transaction-header">
          <button
            className="add-transaction-back-button"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="add-transaction-title">Add Transaction</h1>
        </div>

        {/* Form */}
        <form className="add-transaction-form" onSubmit={handleSubmit}>
          <div className="add-transaction-form-content">
            {/* Transaction Type */}
            <div className="add-transaction-type-selector">
              <label className="add-transaction-type-label">Transaction Type</label>
              <div className="add-transaction-type-buttons">
                <button
                  type="button"
                  className={`add-transaction-type-button ${formData.type === 'INCOME' ? 'active' : ''}`}
                  onClick={() => handleInputChange('type', 'INCOME')}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`add-transaction-type-button ${formData.type === 'EXPENSE' ? 'active' : ''}`}
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
            <div className="add-transaction-form-group">
              <label className="add-transaction-form-label">
                Category <span className="add-transaction-required">*</span>
              </label>
              <select
                className={`add-transaction-select ${errors.categoryId ? 'error' : ''}`}
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 'Select a category'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <div className="add-transaction-error-message">{errors.categoryId}</div>
              )}
              {!loadingCategories && categories.length === 0 && (
                <div className="add-transaction-field-note">
                  No categories found. <a href="/add-category" style={{color: '#059669'}}>Create a category first</a>
                </div>
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
            <div className="add-transaction-form-group">
              <label className="add-transaction-form-label">Description (Optional)</label>
              <textarea
                className="add-transaction-textarea"
                placeholder="Add a note about this transaction..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="add-transaction-submit-error">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              className="add-transaction-submit-button"
              disabled={loading}
            >
              {loading ? 'Creating Transaction...' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;