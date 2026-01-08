import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './RecentTransactions.css';

const RecentTransactions = ({ transactions }) => {
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

  return (
    <div className="recent-transactions">
      <div className="transactions-header">
        <h3 className="transactions-title">Recent Transactions</h3>
        <Link to="/transactions" className="view-all-link">
          View All
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="transactions-table">
        <div className="table-header">
          <div className="header-cell">Date</div>
          <div className="header-cell">Category</div>
          <div className="header-cell">Description</div>
          <div className="header-cell">Amount</div>
          <div className="header-cell">Type</div>
        </div>

        <div className="table-body">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <div key={transaction.id || index} className="table-row">
                <div className="table-cell date-cell">
                  {formatDate(transaction.date || transaction.transactionDate)}
                </div>
                <div className="table-cell category-cell">
                  <span className="category-badge">
                    {transaction.category?.name || transaction.category || 'Uncategorized'}
                  </span>
                </div>
                <div className="table-cell description-cell">
                  {transaction.description || 'No description'}
                </div>
                <div className="table-cell amount-cell">
                  <span className={`amount ${transaction.type === 'INCOME' ? 'income' : 'expense'}`}>
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
                <div className="table-cell type-cell">
                  <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                    {transaction.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-transactions">
              <p>No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;