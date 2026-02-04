import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, User, ArrowLeft, Save, Loader } from 'lucide-react';
import userApi from '../../api/userApi';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
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
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <Link to="/dashboard" className="profile-back-button">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="profile-title">Profile Settings</h1>
        </div>

        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <User className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="profile-form-title">Edit Profile</h2>
          <p className="profile-form-subtitle">Update your personal information</p>
        </div>

        {/* Form */}
        <form className="profile-form" onSubmit={handleSubmit}>
          {error && (
            <div className="profile-error">
              {error}
            </div>
          )}

          <div className="profile-form-group">
            <Input
              label="Email Address"
              type="email"
              value={user.email}
              disabled
              note="Email cannot be changed"
            />
          </div>

          <div className="profile-form-group">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
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

          <div className="profile-form-actions">
            <Button
              type="submit"
              disabled={saving}
              className="w-full"
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
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;