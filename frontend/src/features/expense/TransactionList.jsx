import React, { useMemo, useState } from 'react';
import { Pencil, Receipt, Search, Trash2 } from 'lucide-react';
import transactionApi from '../../api/transactionApi';
import { useAppShell } from '../../app/AppShellContext';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { buildColorMap } from '../../lib/categoryVisuals';
import { formatShortDate, formatSigned } from '../../lib/format';
import './TransactionList.css';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'INCOME', label: 'Income' },
  { key: 'EXPENSE', label: 'Expense' },
];

const TransactionList = () => {
  const { transactions, categories, currency, loading, refresh, openDrawer } = useAppShell();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const colorMap = useMemo(
    () => buildColorMap(categories.map((category) => category.name)),
    [categories],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions
      .filter((t) => filter === 'ALL' || t.type === filter)
      .filter(
        (t) =>
          !needle ||
          (t.description || '').toLowerCase().includes(needle) ||
          (t.categoryName || '').toLowerCase().includes(needle),
      )
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
  }, [transactions, query, filter]);

  const narrowed = Boolean(query.trim()) || filter !== 'ALL';

  const confirmDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await transactionApi.deleteTransaction(pendingDelete.id);
      setPendingDelete(null);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete that transaction.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ledger">
      <div className="ledger-toolbar">
        <div className="ledger-search">
          <Search size={16} className="ledger-search-icon" />
          <input
            className="ledger-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search description or category"
          />
        </div>

        <div className="ledger-segment">
          {FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`ledger-segment-option${filter === option.key ? ' active' : ''}`}
              onClick={() => setFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="ledger-toolbar-spacer" />
        <span className="ledger-count">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {error && <div className="ledger-error">{error}</div>}

      <div className="ledger-table">
        <div className="ledger-row ledger-head">
          <div>Date</div>
          <div>Description</div>
          <div>Category</div>
          <div>Type</div>
          <div className="align-right">Amount</div>
          <div />
        </div>

        {loading ? (
          [0, 1, 2, 3, 4].map((key) => (
            <div key={key} className="ledger-row">
              <div className="ns-skeleton ledger-skeleton" />
              <div className="ns-skeleton ledger-skeleton" />
              <div className="ns-skeleton ledger-skeleton" />
              <div className="ns-skeleton ledger-skeleton" />
              <div className="ns-skeleton ledger-skeleton" />
              <div />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="ledger-empty">
            <div className="ledger-empty-glyph">
              <Receipt size={26} />
            </div>
            <div className="ledger-empty-title">
              {narrowed ? 'Nothing matches that' : 'No transactions yet'}
            </div>
            <div className="ledger-empty-body">
              {narrowed
                ? 'Try a different search term, or clear the type filter to see everything.'
                : 'Add your first entry and the dashboard will start filling in.'}
            </div>
            <button
              type="button"
              className="ledger-empty-cta"
              onClick={() => {
                if (narrowed) {
                  setQuery('');
                  setFilter('ALL');
                } else {
                  openDrawer();
                }
              }}
            >
              {narrowed ? 'Clear filters' : 'Add transaction'}
            </button>
          </div>
        ) : (
          filtered.map((transaction) => {
            const income = transaction.type === 'INCOME';
            return (
              <div key={transaction.id} className="ledger-row ledger-body-row">
                <div className="ledger-date">{formatShortDate(transaction.transactionDate)}</div>
                <div className="ledger-description">
                  {transaction.description || transaction.categoryName}
                </div>
                <div>
                  <span className="ledger-chip">
                    <span
                      className="ledger-chip-dot"
                      style={{ background: colorMap[transaction.categoryName] || 'var(--neutral-400)' }}
                    />
                    {transaction.categoryName}
                  </span>
                </div>
                <div>
                  <span className={`ledger-badge${income ? ' income' : ''}`}>{transaction.type}</span>
                </div>
                <div className={`ledger-amount${income ? ' income' : ''}`}>
                  {formatSigned(transaction.amount, transaction.type, currency)}
                </div>
                <div className="ledger-actions">
                  <button
                    type="button"
                    className="ledger-action"
                    title="Edit transaction"
                    onClick={() => openDrawer(transaction)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="ledger-action danger"
                    title="Delete transaction"
                    onClick={() => setPendingDelete(transaction)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        busy={deleting}
        title="Delete this transaction?"
        body={
          <>
            “{pendingDelete?.description || pendingDelete?.categoryName}” will be removed from your
            ledger. This cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default TransactionList;
