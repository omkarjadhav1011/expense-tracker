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
import dashboardApi from '../../api/dashboardApi';
import Button from '../../components/Button/Button';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import ExpenseBreakdown from '../../components/ExpenseBreakdown/ExpenseBreakdown';
import IncomeExpenseChart from '../../components/IncomeExpenseChart/IncomeExpenseChart';
import RecentTransactions from '../../components/RecentTransactions/RecentTransactions';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

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
      // Fetch all dashboard data in parallel
      const [summaryResponse, categoryBreakdownResponse, recentTransactionsResponse] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getCategoryBreakdown('EXPENSE'),
        dashboardApi.getRecentTransactions(5)
      ]);

      // Set summary data
      setSummary({
        totalIncome: summaryResponse.totalIncome || 0,
        totalExpense: summaryResponse.totalExpense || 0,
        balance: summaryResponse.balance || 0,
        monthlyIncome: summaryResponse.totalIncome || 0, // Assuming monthly = total for now
        monthlyExpense: summaryResponse.totalExpense || 0,
        monthlyBalance: summaryResponse.balance || 0
      });

      // Set category breakdown data
      setCategoryBreakdown(categoryBreakdownResponse || []);

      // Set recent transactions
      setRecentTransactions(recentTransactionsResponse || []);
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
      setCategoryBreakdown([]);
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
            <p className="dashboard-page-subtitle">Track your financial progress and manage expenses.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-summary-section">
          <div className="summary-cards-grid">
            <SummaryCard
              title="Total Income"
              value={formatCurrency(summary.monthlyIncome)}
              subtitle="This Month"
              accentColor="green"
            />
            <SummaryCard
              title="Total Expenses"
              value={formatCurrency(summary.monthlyExpense)}
              subtitle="This Month"
              accentColor="red"
            />
            <SummaryCard
              title="Net Balance"
              value={`${summary.monthlyBalance >= 0 ? '+' : ''}${formatCurrency(summary.monthlyBalance)}`}
              subtitle={summary.monthlyBalance >= 0 ? 'Surplus' : 'Deficit'}
              accentColor="neutral"
            />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="dashboard-analytics-section">
          <div className="analytics-grid">
            <ExpenseBreakdown data={categoryBreakdown} />
            <IncomeExpenseChart />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-transactions-section">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;