import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import transactionApi from '../../api/transactionApi';
import { buildColorMap } from '../../lib/categoryVisuals';
import { currencySymbol, toIsoDate } from '../../lib/format';
import './TransactionDrawer.css';

const emptyForm = () => ({
  type: 'EXPENSE',
  amount: '',
  categoryId: '',
  date: toIsoDate(new Date()),
  description: '',
});

const TransactionDrawer = ({
  open,
  transaction,
  categories,
  currency = 'INR',
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(transaction);

  // Reset (or hydrate) the form each time the drawer opens.
  useEffect(() => {
    if (!open) return;
    setError('');
    setSaving(false);
    setForm(
      transaction
        ? {
            type: transaction.type,
            amount: String(transaction.amount ?? ''),
            categoryId: String(transaction.categoryId ?? ''),
            date: transaction.transactionDate || toIsoDate(new Date()),
            description: transaction.description || '',
          }
        : emptyForm(),
    );
  }, [open, transaction]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const colorMap = useMemo(
    () => buildColorMap(categories.map((category) => category.name)),
    [categories],
  );

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type],
  );

  if (!open) return null;

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const changeType = (type) => {
    // Categories are type-scoped, so the current pick can't carry across.
    setForm((prev) => ({ ...prev, type, categoryId: '' }));
    setError('');
  };

  const handleSave = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (!form.categoryId) {
      setError('Pick a category for this entry.');
      return;
    }
    if (!form.date) {
      setError('Pick a date for this entry.');
      return;
    }

    setSaving(true);
    const payload = {
      amount,
      type: form.type,
      categoryId: Number(form.categoryId),
      transactionDate: form.date,
      description: form.description.trim() || null,
    };

    try {
      if (isEdit) {
        await transactionApi.updateTransaction(transaction.id, payload);
      } else {
        await transactionApi.addTransaction(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this transaction. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="drawer-root">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Transaction">
        <div className="drawer-head">
          <div>
            <div className="drawer-title">{isEdit ? 'Edit transaction' : 'Add transaction'}</div>
            <div className="drawer-sub">
              {isEdit ? 'Changes save to your ledger right away.' : 'Saves to your ledger right away.'}
            </div>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-field">
            <label className="drawer-label">Type</label>
            <div className="drawer-segment">
              <button
                type="button"
                className={`drawer-segment-option${form.type === 'EXPENSE' ? ' active' : ''}`}
                onClick={() => changeType('EXPENSE')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`drawer-segment-option${form.type === 'INCOME' ? ' active' : ''}`}
                onClick={() => changeType('INCOME')}
              >
                Income
              </button>
            </div>
          </div>

          <div className="drawer-field">
            <label className="drawer-label" htmlFor="drawer-amount">Amount</label>
            <div className="drawer-amount-wrap">
              <span className="drawer-amount-symbol">{currencySymbol(currency)}</span>
              <input
                id="drawer-amount"
                className="drawer-amount-input"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                value={form.amount}
                onChange={(event) => update('amount', event.target.value)}
              />
            </div>
          </div>

          <div className="drawer-field">
            <label className="drawer-label">Category</label>
            {visibleCategories.length === 0 ? (
              <div className="drawer-empty-note">
                No {form.type.toLowerCase()} categories yet.{' '}
                <Link to="/categories" onClick={onClose}>Create one first</Link>.
              </div>
            ) : (
              <div className="drawer-chips">
                {visibleCategories.map((category) => {
                  const selected = String(category.id) === String(form.categoryId);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={`drawer-chip${selected ? ' active' : ''}`}
                      onClick={() => update('categoryId', String(category.id))}
                    >
                      <span
                        className="drawer-chip-dot"
                        style={{ background: colorMap[category.name] }}
                      />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="drawer-field">
            <label className="drawer-label" htmlFor="drawer-date">Date</label>
            <input
              id="drawer-date"
              className="drawer-input"
              type="date"
              value={form.date}
              onChange={(event) => update('date', event.target.value)}
            />
          </div>

          <div className="drawer-field">
            <label className="drawer-label" htmlFor="drawer-note">
              Note <span className="drawer-label-optional">optional</span>
            </label>
            <textarea
              id="drawer-note"
              className="drawer-textarea"
              rows={3}
              placeholder="What was this for?"
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </div>

          {error && (
            <div className="drawer-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        <div className="drawer-foot">
          <button
            type="button"
            className="drawer-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save transaction'}
          </button>
          <button type="button" className="drawer-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDrawer;
