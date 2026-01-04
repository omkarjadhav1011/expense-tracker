import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Plus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  BarChart3,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import userApi from '../../api/userApi';
import transactionApi from '../../api/transactionApi';
import Button from '../../components/Button/Button';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');
  const [user, setUser] = useState({ name: 'User', email: '' });
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlyBalance: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch recent transactions
      const transactionsResponse = await transactionApi.getAllTransactions();

      // Sort by date (newest first) and take first 5
      const recentTransactions = transactionsResponse
        .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
        .slice(0, 5);

      // Get current month's start and end dates
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Calculate monthly summary
      const monthlyTransactions = transactionsResponse.filter(t => {
        const tDate = new Date(t.transactionDate);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyExpense = monthlyTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyBalance = monthlyIncome - monthlyExpense;

      // Calculate all-time summary
      const allTransactions = transactionsResponse;
      const totalIncome = allTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpense = allTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const balance = totalIncome - totalExpense;

      setSummary({
        totalIncome,
        totalExpense,
        balance,
        monthlyIncome,
        monthlyExpense,
        monthlyBalance
      });

      setRecentTransactions(recentTransactions);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Set default values if API fails
      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlyBalance: 0
      });
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-logo">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span className="text-lg font-bold text-white">BudgetWise</span>
          </div>
          <button
            className="dashboard-sidebar-toggle-mobile"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="dashboard-sidebar-nav">
          <div className="dashboard-nav-item active">
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </div>
          <div className="dashboard-nav-item" onClick={() => navigate('/transactions')}>
            <Wallet className="w-5 h-5" />
            <span>Transactions</span>
          </div>
          <div className="dashboard-nav-item">
            <DollarSign className="w-5 h-5" />
            <span>Budgets</span>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header with Profile */}
        <header className="dashboard-top-header">
          <button
            className="dashboard-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="dashboard-header-space" />

          {/* User Profile Dropdown */}
          <div className="dashboard-profile-dropdown">
            <button
              className="dashboard-profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="dashboard-profile-avatar-small">
                <User className="w-5 h-5" />
              </div>
              <div className="dashboard-profile-info">
                <p className="dashboard-profile-name-small">{user.name}</p>
                <p className="dashboard-profile-email-small">{user.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="dashboard-profile-menu">
                <Link to="/profile" className="dashboard-menu-item">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  className="dashboard-menu-item logout"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Title */}
        <div className="dashboard-page-header">
          <div className="dashboard-page-title-section">
            <h1 className="dashboard-page-title">Dashboard</h1>
            <p className="dashboard-page-subtitle">Here's your financial overview.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            OPERATIONAL VIEW
          </button>
          <button
            className={`dashboard-tab ${activeTab === 'alltime' ? 'active' : ''}`}
            onClick={() => setActiveTab('alltime')}
          >
            MONTHLY SUMMARY
          </button>
        </div>

        {/* Summary Cards */}
        {activeTab === 'monthly' && (
          <div className="dashboard-summary-section">
            <h3 className="dashboard-summary-label">MONTHLY SUMMARY</h3>
            <div className="dashboard-cards-grid">
              <div className="dashboard-summary-card">
                <p className="dashboard-summary-title">Monthly Balance</p>
                <p className={`dashboard-summary-value ${summary.monthlyBalance >= 0 ? 'positive' : 'negative'}`}>
                  {summary.monthlyBalance >= 0 ? '+' : ''}{formatCurrency(summary.monthlyBalance)}
                </p>
                <p className="dashboard-summary-meta">
                  {summary.monthlyBalance >= 0 ? 'Net Savings' : 'Not Savings'}
                </p>
              </div>
              <div className="dashboard-summary-card">
                <p className="dashboard-summary-title">Monthly Income</p>
                <p className="dashboard-summary-value positive">
                  {formatCurrency(summary.monthlyIncome)}
                </p>
                <p className="dashboard-summary-meta">This Month</p>
              </div>
              <div className="dashboard-summary-card">
                <p className="dashboard-summary-title">Monthly Expenses</p>
                <p className="dashboard-summary-value negative">
                  {formatCurrency(summary.monthlyExpense)}
                </p>
                <p className="dashboard-summary-meta">This Month</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alltime' && (
          <div className="dashboard-summary-section">
            <h3 className="dashboard-summary-label">ALL-TIME SUMMARY</h3>
            <div className="dashboard-cards-grid">
              <div className="dashboard-summary-card">
                <p className="dashboard-summary-title">Total Balance (All Time)</p>
                <p className={`dashboard-summary-value ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
                  {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
                </p>
              </div>
              <div className="dashboard-summary-card">
                <p className="dashboard-summary-title">Total Income (All Time)</p>
                <p className="dashboard-summary-value positive">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div className="dashboard-summary-card">
                <p className="dashboard-summary-title">Total Expenses (All Time)</p>
                <p className="dashboard-summary-value negative">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="dashboard-content-grid">
          {/* Spending Breakdown */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Spending Breakdown</h2>
              <span className="dashboard-section-badge">MONTHLY</span>
            </div>
            <div className="dashboard-chart-placeholder">
              <p>Chart will be displayed here</p>
            </div>
          </div>

          {/* Income Overview */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Income Overview</h2>
              <span className="dashboard-section-badge">MONTHLY</span>
            </div>
            <div className="dashboard-income-mix">
              <div className="dashboard-income-item">
                <span className="dashboard-income-percentage">50,000 (0%)</span>
              </div>
              <div className="dashboard-income-item">
                <span className="dashboard-income-percentage">₹0 (100%)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Quick Actions</h2>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/add-transaction')}
              className="dashboard-quick-action-btn"
            >
              <TrendingUp className="w-4 h-4" />
              Add Transaction
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;