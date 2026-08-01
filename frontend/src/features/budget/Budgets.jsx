import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import budgetApi from '../../api/budgetApi';
import { useAppShell } from '../../app/AppShellContext';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { colorForIndex } from '../../lib/categoryVisuals';
import { formatMonthLabel, formatMoney, toMonthKey, toMonthParts } from '../../lib/format';
import './Budgets.css';

const OVERALL = '__OVERALL__';

/**
 * Budgets screen.
 *
 * The overall cap and the per-category caps are two separate resources
 * (`/budgets/monthly` and `/budgets/category`), and the server requires the
 * overall cap to exist first — it rejects category caps that would total more
 * than it.
 *
 * Caps come from the server; spend is computed here from the shared transaction
 * ledger, joined on `categoryId`. `/budgets/category/summary` returns the same
 * numbers, but the ledger is already in context, so deriving locally avoids a
 * round-trip and keeps these bars in step with the dashboard.
 */
const Budgets = () => {
  const { transactions, categories, currency } = useAppShell();
  const monthKey = toMonthKey();
  const { month, year } = toMonthParts();

  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ category: OVERALL, amount: '' });
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const [overall, perCategory] = await Promise.all([
        budgetApi.getMonthlyBudget(month, year),
        budgetApi.getCategoryBudgets(month, year),
      ]);
      setMonthlyBudget(overall);
      setCategoryBudgets(perCategory || []);
      setError('');
    } catch {
      setMonthlyBudget(null);
      setCategoryBudgets([]);
      setError('Could not load budgets.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Actual spend this month, per category id, from the ledger.
  const spendByCategoryId = useMemo(() => {
    const totals = new Map();
    transactions
      .filter((t) => t.type === 'EXPENSE' && (t.transactionDate || '').startsWith(monthKey))
      .forEach((t) => {
        totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + Number(t.amount || 0));
      });
    return totals;
  }, [transactions, monthKey]);

  const monthSpend = useMemo(
    () => [...spendByCategoryId.values()].reduce((total, value) => total + value, 0),
    [spendByCategoryId],
  );

  const overallCap = Number(monthlyBudget?.amount || 0);
  const overallPct = overallCap > 0 ? Math.min(100, (monthSpend / overallCap) * 100) : 0;

  const rows = categoryBudgets.map((budget, index) => {
    const spent = spendByCategoryId.get(budget.categoryId) || 0;
    const cap = Number(budget.allocatedAmount || 0);
    const pct = cap > 0 ? Math.min(100, (spent / cap) * 100) : 0;
    const over = cap > 0 && spent > cap;
    const close = !over && pct >= 80;
    return {
      id: budget.id,
      name: budget.categoryName,
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
      if (form.category === OVERALL) {
        await budgetApi.saveMonthlyBudget({
          month,
          year,
          amount,
          currency: currency || 'INR',
        });
      } else {
        await budgetApi.saveCategoryBudget({
          categoryId: Number(form.category),
          month,
          year,
          allocatedAmount: amount,
        });
      }
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
      await budgetApi.deleteCategoryBudget(pendingDelete.id);
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
              Monthly budget used · {formatMonthLabel(monthKey)}
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
              ? `${formatMoney(monthSpend, currency)} spent against a ${formatMoney(overallCap, currency)} cap`
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
                  <option key={category.id} value={category.id}>
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
              {overallCap > 0
                ? 'Set a cap per category and this page will track it against what you actually spent.'
                : 'Set the overall monthly budget first — category caps have to fit inside it.'}
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
