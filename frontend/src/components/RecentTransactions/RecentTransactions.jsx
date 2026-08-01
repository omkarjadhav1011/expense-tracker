import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categoryIcon } from '../../lib/categoryVisuals';
import { formatShortDate, formatSigned } from '../../lib/format';
import './RecentTransactions.css';

const RecentTransactions = ({ transactions = [], currency = 'INR', loading = false }) => (
  <div className="recent-card">
    <div className="recent-head">
      <div className="recent-title">Recent activity</div>
      <Link to="/transactions" className="recent-view-all">
        View all
        <ArrowRight size={14} />
      </Link>
    </div>

    {loading ? (
      <div className="recent-list">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="recent-row">
            <div className="ns-skeleton recent-skeleton-glyph" />
            <div className="ns-skeleton recent-skeleton-line" />
            <div className="ns-skeleton recent-skeleton-amount" />
          </div>
        ))}
      </div>
    ) : transactions.length === 0 ? (
      <div className="recent-empty">Nothing logged in this period yet.</div>
    ) : (
      <div className="recent-list">
        {transactions.map((transaction) => {
          const Icon = categoryIcon(transaction.categoryName);
          const income = transaction.type === 'INCOME';
          return (
            <div key={transaction.id} className="recent-row">
              <span className={`recent-glyph${income ? ' income' : ''}`}>
                <Icon size={16} />
              </span>
              <div className="recent-text">
                <span className="recent-description">
                  {transaction.description || transaction.categoryName}
                </span>
                <span className="recent-meta">
                  {transaction.categoryName} · {formatShortDate(transaction.transactionDate)}
                </span>
              </div>
              <span className={`recent-amount${income ? ' income' : ''}`}>
                {formatSigned(transaction.amount, transaction.type, currency)}
              </span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default RecentTransactions;
