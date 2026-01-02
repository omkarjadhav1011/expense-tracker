import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, User, ArrowLeft, Save, Loader } from 'lucide-react';
import userApi from '../../api/userApi';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError('Failed to load profile');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const updatedUser = await userApi.updateCurrentUser({
        name: user.name,
        currency: user.currency
      });
      setUser(updatedUser);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <Link to="/home" className="profile-back-button">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        <div className="profile-logo">
          <div className="profile-logo-icon">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-white">ExpenseTracker</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-form-container">
          <div className="profile-form-card">
            <div className="profile-header-section">
              <div className="profile-avatar">
                <User className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="profile-form-title">Edit Profile</h2>
              <p className="profile-form-subtitle">Update your personal information</p>
            </div>

            {error && (
              <div className="profile-error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="profile-form-group">
                <label className="profile-form-label">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  className="profile-form-input"
                  disabled
                />
                <p className="profile-field-note">Email cannot be changed</p>
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="profile-form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Currency</label>
                <select
                  name="currency"
                  value={user.currency}
                  onChange={handleChange}
                  className="profile-form-input"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="profile-submit-button"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;