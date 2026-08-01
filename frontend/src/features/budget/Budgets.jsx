import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import budgetApi from '../../api/budgetApi';
import { useAppShell } from '../../app/AppShellContext';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { colorForIndex } from '../../lib/categoryVisuals';
import { formatMonthLabel, formatMoney, toMonthKey } from '../../lib/format';
import './Budgets.css';

const OVERALL = '__OVERALL__';

/**
 * Budgets screen.
 *
 * Caps come from `/budgets`, but spend is derived from the transaction ledger
 * rather than the backend's budget summary endpoints — those compute spend from
 * the legacy `expenses` table, which nothing in this app writes to, so they
 * would always report zero.
 */
const Budgets = () => {
  const { transactions, categories, currency, user } = useAppShell();
  const month = toMonthKey();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ category: OVERALL, amount: '' });
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const userId = user?.id;

  const loadBudgets = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const rows = await budgetApi.getBudgetsForMonth(userId, month);
      setBudgets(rows || []);
      setError('');
    } catch {
      setBudgets([]);
      setError('Could not load budgets.');
    } finally {
      setLoading(false);
    }
  }, [userId, month]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Actual spend this month, per category name, from the ledger.
  const spendByCategory = useMemo(() => {
    const totals = new Map();
    transactions
      .filter((t) => t.type === 'EXPENSE' && (t.transactionDate || '').startsWith(month))
      .forEach((t) => {
        const name = t.categoryName || 'Uncategorised';
        totals.set(name, (totals.get(name) || 0) + Number(t.amount || 0));
      });
    return totals;
  }, [transactions, month]);

  const monthSpend = useMemo(
    () => [...spendByCategory.values()].reduce((total, value) => total + value, 0),
    [spendByCategory],
  );

  const overallBudget = budgets.find((budget) => !budget.category) || null;
  const categoryBudgets = budgets.filter((budget) => budget.category);

  const categoryCapTotal = categoryBudgets.reduce(
    (total, budget) => total + Number(budget.amount || 0),
    0,
  );
  const overallCap = Number(overallBudget?.amount || 0) || categoryCapTotal;
  const overallPct = overallCap > 0 ? Math.min(100, (monthSpend / overallCap) * 100) : 0;

  const rows = categoryBudgets.map((budget, index) => {
    const spent = spendByCategory.get(budget.category) || 0;
    const cap = Number(budget.amount || 0);
    const pct = cap > 0 ? Math.min(100, (spent / cap) * 100) : 0;
    const over = cap > 0 && spent > cap;
    const close = !over && pct >= 80;
    return {
      id: budget.id,
      name: budget.category,
      color: colorForIndex(index),
      spent,
      cap,
      pct,
      tag: over ? 'Over' : close ? 'Close' : 'On track',
      state: over ? 'over' : close ? 'close' : 'ok',
    };
  });

  const expenseCategories = categories.filter((category) => category.type === 'EXPENSE');

  const handleSave = async (event) => {
    event.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError('Enter a cap greater than zero.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await budgetApi.saveBudget({
        userId,
        month,
        category: form.category === OVERALL ? null : form.category,
        amount,
      });
      setForm({ category: OVERALL, amount: '' });
      setFormOpen(false);
      await loadBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save that budget.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await budgetApi.deleteBudget(pendingDelete.id);
      setPendingDelete(null);
      await loadBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete that budget.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="budgets">
      <div className="budget-overview">
        <div className="budget-overview-main">
          <div className="budget-overview-head">
            <span className="budget-overview-title">
              Monthly budget used · {formatMonthLabel(month)}
            </span>
            <span className="budget-overview-pct">
              {overallCap > 0 ? `${Math.round((monthSpend / overallCap) * 100)}% used` : 'No cap set'}
            </span>
          </div>
          <div className="budget-track">
            <div
              className={`budget-fill${monthSpend > overallCap && overallCap > 0 ? ' over' : ''}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="budget-overview-caption">
            {overallCap > 0
              ? `${formatMoney(monthSpend, currency)} spent against ${formatMoney(overallCap, currency)} of caps`
              : `${formatMoney(monthSpend, currency)} spent this month — set a cap to track it`}
          </span>
        </div>

        <div className="budget-overview-divider" />

        <div className="budget-overview-left">
          <span className="budget-overview-left-value">
            {formatMoney(Math.max(0, overallCap - monthSpend), currency)}
          </span>
          <span className="budget-overview-left-label">left to spend</span>
        </div>
      </div>

      {error && <div className="budget-error">{error}</div>}

      <div className="budget-card">
        <div className="budget-card-head">
          <div className="budget-card-title">Category budgets</div>
          <button
            type="button"
            className="budget-ghost-button"
            onClick={() => setFormOpen((open) => !open)}
          >
            <Plus size={15} />
            New budget
          </button>
        </div>

        {formOpen && (
          <form className="budget-form" onSubmit={handleSave}>
            <div className="budget-form-field">
              <label className="budget-form-label" htmlFor="budget-category">Applies to</label>
              <select
                id="budget-category"
                className="budget-form-control"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              >
                <option value={OVERALL}>Overall monthly budget</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="budget-form-field">
              <label className="budget-form-label" htmlFor="budget-amount">Cap</label>
              <input
                id="budget-amount"
                className="budget-form-control"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <button type="submit" className="budget-submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save budget'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="budget-row">
            <div className="ns-skeleton budget-skeleton" />
          </div>
        ) : rows.length === 0 ? (
          <div className="budget-empty">
            <div className="budget-empty-glyph">
              <Target size={26} />
            </div>
            <div className="budget-empty-title">No category budgets yet</div>
            <div className="budget-empty-body">
              Set a cap per category and this page will track it against what you actually spent.
            </div>
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="budget-row">
              <div className="budget-row-head">
                <span className="budget-dot" style={{ background: row.color }} />
                <span className="budget-name">{row.name}</span>
                <span className="budget-numbers">
                  {formatMoney(row.spent, currency)} of {formatMoney(row.cap, currency)}
                </span>
                <span className={`budget-tag ${row.state}`}>{row.tag}</span>
                <button
                  type="button"
                  className="budget-delete"
                  title="Delete budget"
                  onClick={() => setPendingDelete(row)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="budget-track small">
                <div className={`budget-fill ${row.state}`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        busy={deleting}
        title="Delete this budget?"
        body={`The cap for “${pendingDelete?.name}” will be removed. Your transactions are not affected.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default Budgets;
