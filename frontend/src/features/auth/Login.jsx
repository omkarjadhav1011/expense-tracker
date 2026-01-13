import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData);
      localStorage.setItem('token', response.token);
      // Redirect to dashboard or home
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel - Branding */}
      <div className="login-branding-panel">
        <div className="login-branding-bg"></div>

        <div>
          <div className="login-logo">
            <div className="login-logo-icon">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-white">ExpenseTracker</span>
          </div>

          <h1 className="login-title">
            Take Control of<br />Your Finances
          </h1>
          <p className="login-subtitle">
            Track expenses, analyze spending patterns, and achieve your financial goals with intelligent insights.
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature-card">
            <DollarSign className="login-feature-icon" />
            <p className="login-feature-text">Smart Budgeting</p>
          </div>
          <div className="login-feature-card">
            <PieChart className="login-feature-icon" />
            <p className="login-feature-text">Visual Analytics</p>
          </div>
          <div className="login-feature-card">
            <BarChart3 className="login-feature-icon" />
            <p className="login-feature-text">Detailed Reports</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Mobile Logo */}
          <div className="login-mobile-logo">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ExpenseTracker</span>
          </div>

          <div className="login-form-card">
            <h2 className="login-form-title">
              Welcome Back
            </h2>
            <p className="login-form-subtitle">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="login-error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label className="login-form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="login-form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="login-form-group">
                <label className="login-form-label">
                  Password
                </label>
                <div className="login-password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="login-form-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="login-form-options">
                <label className="login-checkbox-container">
                  <input
                    type="checkbox"
                    className="login-checkbox"
                  />
                  <span className="login-checkbox-label">Remember me</span>
                </label>
                <button className="login-forgot-password">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-submit-button"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="login-form-footer">
              Don't have an account?{' '}
              <Link to="/register" className="login-form-link">
                Sign Up
              </Link>
            </div>
          </div>

          <p className="login-security-note">
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;