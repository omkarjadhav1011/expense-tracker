import React from 'react';
import { formatMoney, formatMonthShort } from '../../lib/format';
import './IncomeExpenseChart.css';

/**
 * Paired income/expense bars, one column per month.
 * `data` is the raw `/dashboard/monthly-trend` payload:
 * [{ month: "2026-07", totalIncome, totalExpense }]
 */
const IncomeExpenseChart = ({ data = [], currency = 'INR', subtitle, loading = false }) => {
  const peak = data.reduce(
    (max, row) => Math.max(max, Number(row.totalIncome || 0), Number(row.totalExpense || 0)),
    0,
  );

  const heightOf = (value) => (peak > 0 ? `${(Number(value || 0) / peak) * 100}%` : '0%');

  return (
    <div className="trend-card">
      <div className="trend-head">
        <div>
          <div className="trend-title">Income vs expense</div>
          <div className="trend-sub">{subtitle || 'Monthly totals'}</div>
        </div>
        <div className="trend-legend">
          <span className="trend-legend-item">
            <span className="trend-swatch income" />
            Income
          </span>
          <span className="trend-legend-item">
            <span className="trend-swatch expense" />
            Expense
          </span>
        </div>
      </div>

      {loading ? (
        <div className="ns-skeleton trend-skeleton" />
      ) : data.length === 0 ? (
        <div className="trend-empty">No monthly history yet.</div>
      ) : (
        <div className="trend-plot">
          {data.map((row) => (
            <div key={row.month} className="trend-column">
              <div className="trend-bars">
                <div
                  className="trend-bar income"
                  style={{ height: heightOf(row.totalIncome) }}
                  title={`Income ${formatMoney(row.totalIncome, currency)}`}
                />
                <div
                  className="trend-bar expense"
                  style={{ height: heightOf(row.totalExpense) }}
                  title={`Expense ${formatMoney(row.totalExpense, currency)}`}
                />
              </div>
              <span className="trend-month">{formatMonthShort(row.month)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseChart;
