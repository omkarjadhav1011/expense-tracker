import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader } from 'lucide-react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import categoryApi from '../../api/categoryApi';
import './AddCategory.css';

const AddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Category type is required';
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

    try {
      await categoryApi.createCategory({
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim()
      });

      alert('Category created successfully!');
      navigate('/transactions'); // Navigate back to transactions or categories list
    } catch (err) {
      console.error('Error creating category:', err);
      if (err.response?.data?.message) {
        setErrors({ submit: err.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create category. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-container">
      <div className="add-category-card">
        {/* Header */}
        <div className="add-category-header">
          <button
            className="add-category-back-button"
            onClick={() => navigate('/transactions')}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Transactions
          </button>
          <h1 className="add-category-title">Add Category</h1>
        </div>

        {/* Form */}
        <form className="add-category-form" onSubmit={handleSubmit}>
          <div className="add-category-form-content">
            {/* Category Type */}
            <div className="add-category-type-selector">
              <label className="add-category-type-label">Category Type</label>
              <div className="add-category-type-buttons">
                <button
                  type="button"
                  className={`add-category-type-button ${formData.type === 'INCOME' ? 'active' : ''}`}
                  onClick={() => handleInputChange('type', 'INCOME')}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`add-category-type-button ${formData.type === 'EXPENSE' ? 'active' : ''}`}
                  onClick={() => handleInputChange('type', 'EXPENSE')}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Category Name */}
            <Input
              label="Category Name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter category name"
              error={errors.name}
              required
            />

            {/* Description */}
            <div className="add-category-form-group">
              <label className="add-category-form-label">Description (Optional)</label>
              <textarea
                className="add-category-textarea"
                placeholder="Add a description for this category..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="add-category-submit-error">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Category...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Category
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;