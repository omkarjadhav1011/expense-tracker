import React from 'react';
import './ExpenseBreakdown.css';

const ExpenseBreakdown = ({ data }) => {
  // Use actual data if available, otherwise use placeholder
  const categories = data && data.length > 0 ? data.map((item, index) => ({
    name: item.categoryName,
    amount: item.totalAmount,
    percentage: Math.round((item.totalAmount / data.reduce((sum, cat) => sum + cat.totalAmount, 0)) * 100),
    color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][index % 6]
  })) : [
    { name: 'Food & Dining', amount: 450, percentage: 35, color: '#ef4444' },
    { name: 'Transportation', amount: 280, percentage: 22, color: '#f97316' },
    { name: 'Entertainment', amount: 180, percentage: 14, color: '#eab308' },
    { name: 'Utilities', amount: 150, percentage: 12, color: '#22c55e' },
    { name: 'Other', amount: 200, percentage: 17, color: '#3b82f6' }
  ];

  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="expense-breakdown">
      <div className="expense-breakdown-header">
        <h3 className="expense-breakdown-title">Expense Breakdown</h3>
        <span className="expense-breakdown-period">This Month</span>
      </div>

      <div className="expense-breakdown-chart">
        {/* Placeholder for donut chart */}
        <div className="chart-placeholder">
          <div className="donut-chart">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className="donut-segment"
                style={{
                  background: category.color,
                  transform: `rotate(${index * 72}deg)`
                }}
              />
            ))}
            <div className="donut-center">
              <span className="donut-total">${totalAmount.toFixed(2)}</span>
              <span className="donut-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="expense-breakdown-legend">
        {categories.map((category) => (
          <div key={category.name} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: category.color }}
            />
            <div className="legend-info">
              <span className="legend-name">{category.name}</span>
              <span className="legend-amount">${category.amount}</span>
            </div>
            <span className="legend-percentage">{category.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;