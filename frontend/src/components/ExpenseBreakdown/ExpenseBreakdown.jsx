import React from 'react';
import { formatMoney } from '../../lib/format';
import './ExpenseBreakdown.css';

/**
 * Donut + legend for spend by category.
 * `slices` is [{ name, amount, percent, color }] already sorted and capped.
 */
const ExpenseBreakdown = ({ slices = [], total = 0, currency = 'INR', loading = false }) => {
  // conic-gradient stops: each slice owns a contiguous arc.
  const stops = slices.reduce((acc, slice) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    const end = start + slice.percent;
    acc.push({ end, stop: `${slice.color} ${start.toFixed(2)}% ${end.toFixed(2)}%` });
    return acc;
  }, []).map((entry) => entry.stop);

  const donut =
    stops.length > 0 ? `conic-gradient(${stops.join(',')})` : 'conic-gradient(var(--neutral-100) 0% 100%)';

  return (
    <div className="breakdown-card">
      <div>
        <div className="breakdown-title">Where it went</div>
        <div className="breakdown-sub">Spend by category</div>
      </div>

      {loading ? (
        <div className="ns-skeleton breakdown-skeleton" />
      ) : slices.length === 0 ? (
        <div className="breakdown-empty">No expenses in this period yet.</div>
      ) : (
        <div className="breakdown-body">
          <div className="breakdown-donut" style={{ background: donut }}>
            <div className="breakdown-donut-hole">
              <span className="breakdown-total">{formatMoney(total, currency)}</span>
              <span className="breakdown-total-label">spent</span>
            </div>
          </div>

          <div className="breakdown-legend">
            {slices.map((slice) => (
              <div key={slice.name} className="breakdown-row">
                <span className="breakdown-dot" style={{ background: slice.color }} />
                <span className="breakdown-name">{slice.name}</span>
                <span className="breakdown-amount">{formatMoney(slice.amount, currency)}</span>
                <span className="breakdown-pct">{Math.round(slice.percent)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseBreakdown;
