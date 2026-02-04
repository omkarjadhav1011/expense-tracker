import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import userApi from '../../api/userApi';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState({ name: 'User', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="home-logo">
          <div className="home-logo-icon">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-white">ExpenseTracker</span>
        </div>

        {/* User Profile Section */}
        <div className="home-profile-section">
          <button 
            className="home-profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <User className="w-5 h-5 text-white" />
            <span className="text-white ml-2">{user.name}</span>
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
          <div className={`home-profile-menu ${showProfileMenu ? 'show' : ''}`}>
            <div className="home-profile-header">
              <div className="home-profile-avatar">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="home-profile-name">{user.name}</p>
                <p className="home-profile-email">{user.email}</p>
              </div>
            </div>
            <Link to="/profile" className="home-profile-menu-item">
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </Link>
            <div className="home-profile-menu-item" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <div className="home-welcome">
          <h1 className="home-title">Welcome back, {user.name}!</h1>
          <p className="home-subtitle">Take control of your finances with intelligent expense tracking.</p>
        </div>

        <div className="home-features">
          <div className="home-feature-card">
            <TrendingUp className="home-feature-icon" />
            <h3 className="home-feature-title">Track Expenses</h3>
            <p className="home-feature-description">Monitor your spending patterns and categorize expenses.</p>
          </div>
          <div className="home-feature-card">
            <TrendingUp className="home-feature-icon" />
            <h3 className="home-feature-title">Visual Analytics</h3>
            <p className="home-feature-description">Get insights with beautiful charts and reports.</p>
          </div>
          <div className="home-feature-card">
            <TrendingUp className="home-feature-icon" />
            <h3 className="home-feature-title">Smart Budgeting</h3>
            <p className="home-feature-description">Set budgets and achieve your financial goals.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;