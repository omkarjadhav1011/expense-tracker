import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import './Register.css';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registerData } = formData;
      await authApi.register(registerData);
      alert('Registration successful! Please login.');
      // window.location.href = '/login';
    } catch (err) {
  const data = err?.response?.data;

  if (data?.errors) {
    const firstErrorMessage = Object.values(data.errors)[0];
    setError(firstErrorMessage);
  }

  else if (data?.message) {
    setError(data.message);
  }

  else {
    setError('Registration failed');
  }
}

 finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Left Panel - Branding */}
      <div className="register-branding-panel">
        <div className="register-branding-bg"></div>

        <div>
          <div className="register-logo">
            <div className="register-logo-icon">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-white">ExpenseTracker</span>
          </div>

          <h1 className="register-title">
            Take Control of<br />Your Finances
          </h1>
          <p className="register-subtitle">
            Track expenses, analyze spending patterns, and achieve your financial goals with intelligent insights.
          </p>
        </div>

        <div className="register-features">
          <div className="register-feature-card">
            <DollarSign className="register-feature-icon" />
            <p className="register-feature-text">Smart Budgeting</p>
          </div>
          <div className="register-feature-card">
            <PieChart className="register-feature-icon" />
            <p className="register-feature-text">Visual Analytics</p>
          </div>
          <div className="register-feature-card">
            <BarChart3 className="register-feature-icon" />
            <p className="register-feature-text">Detailed Reports</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="register-form-panel">
        <div className="register-form-container">
          {/* Mobile Logo */}
          <div className="register-mobile-logo">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ExpenseTracker</span>
          </div>

          <div className="register-form-card">
            <h2 className="register-form-title">
              Create Account
            </h2>
            <p className="register-form-subtitle">
              Fill in your details to get started
            </p>

            {error && (
              <div className="register-error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="register-form-group">
                <label className="register-form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="register-form-input"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="register-form-group">
                <label className="register-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="register-form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="register-form-group">
                <label className="register-form-label">
                  Password
                </label>
                <div className="register-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="register-form-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="register-password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="register-form-group">
                <label className="register-form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="register-form-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="register-submit-button"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="register-form-footer">
              Already have an account?{' '}
              <Link to="/login" className="register-form-link">
                Sign In
              </Link>
            </div>
          </div>

          <p className="register-security-note">
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;