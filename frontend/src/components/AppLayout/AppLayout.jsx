import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plus,
  Receipt,
  RefreshCw,
  Settings,
  Tags,
  Target,
  User,
} from 'lucide-react';
import userApi from '../../api/userApi';
import transactionApi from '../../api/transactionApi';
import categoryApi from '../../api/categoryApi';
import { AppShellContext } from '../../app/AppShellContext';
import TransactionDrawer from '../TransactionDrawer/TransactionDrawer';
import mark from '../../assets/mark.png';
import { initials, toMonthKey } from '../../lib/format';
import './AppLayout.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt, badge: 'transactions' },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/categories', label: 'Categories', icon: Tags, badge: 'categories' },
  { to: '/profile', label: 'Profile', icon: User },
];

const SCREEN_META = {
  '/dashboard': ['Dashboard', 'An honest look at this month'],
  '/transactions': ['Transactions', 'Every entry in your ledger'],
  '/budgets': ['Budgets', 'Caps you set, spend you made'],
  '/categories': ['Categories', 'How your spending is labelled'],
  '/profile': ['Profile', 'Account and preferences'],
};

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, transaction: null });

  const profileRef = useRef(null);

  // A partial failure should still render whatever did load, so this settles
  // all three and applies each one independently.
  const applyResults = useCallback(([userResult, txnResult, catResult]) => {
    if (userResult.status === 'fulfilled') setUser(userResult.value);
    if (txnResult.status === 'fulfilled') setTransactions(txnResult.value || []);
    if (catResult.status === 'fulfilled') setCategories(catResult.value || []);

    const failed = [userResult, txnResult, catResult].some((r) => r.status === 'rejected');
    setLoadError(failed ? 'Some data could not be loaded. Try refreshing.' : '');
  }, []);

  const fetchAll = useCallback(
    () =>
      Promise.allSettled([
        userApi.getCurrentUser(),
        transactionApi.getAllTransactions(),
        categoryApi.getAllCategories(),
      ]),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    fetchAll().then((results) => {
      if (cancelled) return;
      applyResults(results);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchAll, applyResults]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    applyResults(await fetchAll());
    setRefreshing(false);
  }, [fetchAll, applyResults]);

  // Close the profile menu on an outside click or Escape.
  useEffect(() => {
    if (!profileOpen) return undefined;
    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  const openDrawer = useCallback((transaction = null) => {
    setDrawer({ open: true, transaction });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer((prev) => ({ ...prev, open: false }));
  }, []);

  const currency = user?.currency || 'INR';

  // Sidebar coaching card — this month only, so it always reads "this month".
  const savings = useMemo(() => {
    const month = toMonthKey();
    const inMonth = transactions.filter((t) => (t.transactionDate || '').startsWith(month));
    const income = inMonth
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = inMonth
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const rate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    return { income, rate, hasData: inMonth.length > 0 };
  }, [transactions]);

  const badgeCounts = {
    transactions: transactions.length,
    categories: categories.length,
  };

  const [screenTitle, screenSub] = SCREEN_META[location.pathname] || ['BudgetWise', ''];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const shellValue = useMemo(
    () => ({
      user,
      setUser,
      currency,
      transactions,
      categories,
      loading,
      refreshing,
      loadError,
      refresh,
      openDrawer,
    }),
    [user, currency, transactions, categories, loading, refreshing, loadError, refresh, openDrawer],
  );

  return (
    <AppShellContext.Provider value={shellValue}>
      <div className="shell">
        <aside className="shell-sidebar">
          <div className="shell-brand">
            <img src={mark} alt="" className="shell-brand-mark" />
            <div className="shell-brand-text">
              <span className="shell-brand-name">BudgetWise</span>
              <span className="shell-brand-by">by NonStop io</span>
            </div>
          </div>

          <div className="shell-nav-heading">Menu</div>
          <nav className="shell-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `shell-nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="shell-nav-icon">
                    <Icon size={18} />
                  </span>
                  <span className="shell-nav-label">{item.label}</span>
                  {item.badge && badgeCounts[item.badge] > 0 && (
                    <span className="shell-nav-count">{badgeCounts[item.badge]}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="shell-sidebar-spacer" />

          <div className="shell-tip">
            <div className="shell-tip-title">
              {!savings.hasData
                ? 'Nothing logged yet'
                : savings.rate >= 20
                  ? 'Healthy month'
                  : 'Watch the spend'}
            </div>
            <div className="shell-tip-body">
              {!savings.hasData
                ? 'Add a transaction and this month’s savings rate will show up here.'
                : `You have kept ${savings.rate}% of income this month. Keep it above 20% to stay on track.`}
            </div>
          </div>
        </aside>

        <div className="shell-main">
          <header className="shell-header">
            <div className="shell-header-titles">
              <span className="shell-header-title">{screenTitle}</span>
              <span className="shell-header-sub">{screenSub}</span>
            </div>

            <div className="shell-header-spacer" />

            <button
              type="button"
              className="shell-icon-button"
              title="Refresh data"
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw size={17} className={refreshing ? 'shell-spin' : undefined} />
            </button>

            <button type="button" className="shell-primary-button" onClick={() => openDrawer()}>
              <Plus size={16} />
              <span>Add transaction</span>
            </button>

            <div className="shell-header-divider" />

            <div className="shell-profile" ref={profileRef}>
              <button
                type="button"
                className="shell-profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
              >
                <span className="shell-avatar">{initials(user?.name)}</span>
                <span className="shell-profile-text">
                  <span className="shell-profile-name">{user?.name || 'Your account'}</span>
                  <span className="shell-profile-email">{user?.email || ''}</span>
                </span>
                <ChevronDown size={15} className="shell-profile-chevron" />
              </button>

              {profileOpen && (
                <div className="shell-menu">
                  <button
                    type="button"
                    className="shell-menu-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <Settings size={16} />
                    Profile settings
                  </button>
                  <a
                    className="shell-menu-item"
                    href="https://github.com/omkarjadhav1011/expense-tracker"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LifeBuoy size={16} />
                    Help
                  </a>
                  <div className="shell-menu-divider" />
                  <button type="button" className="shell-menu-item danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </header>

          <div className="shell-content">
            {loadError && <div className="shell-banner">{loadError}</div>}
            <Outlet />
          </div>
        </div>

        <TransactionDrawer
          open={drawer.open}
          transaction={drawer.transaction}
          categories={categories}
          currency={currency}
          onClose={closeDrawer}
          onSaved={() => {
            closeDrawer();
            refresh();
          }}
        />
      </div>
    </AppShellContext.Provider>
  );
};

export default AppLayout;
