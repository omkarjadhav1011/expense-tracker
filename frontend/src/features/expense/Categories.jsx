import React, { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import categoryApi from '../../api/categoryApi';
import { useAppShell } from '../../app/AppShellContext';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { buildColorMap, categoryIcon } from '../../lib/categoryVisuals';
import './Categories.css';

const Categories = () => {
  const { categories, transactions, loading, refresh } = useAppShell();
  const [form, setForm] = useState({ name: '', type: 'EXPENSE' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const colorMap = useMemo(
    () => buildColorMap(categories.map((category) => category.name)),
    [categories],
  );

  const counts = useMemo(() => {
    const map = new Map();
    transactions.forEach((transaction) => {
      const key = transaction.categoryId;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [transactions]);

  const handleCreate = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError('Give the category a name.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await categoryApi.createCategory({ name, type: form.type });
      setForm({ name: '', type: form.type });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create that category.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await categoryApi.deleteCategory(pendingDelete.id);
      setPendingDelete(null);
      await refresh();
    } catch (err) {
      // Default categories are seeded at registration and the backend refuses
      // to delete them — surface whatever reason it gives.
      setError(err.response?.data?.message || 'Could not delete that category.');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="categories">
      <form className="category-form" onSubmit={handleCreate}>
        <div className="category-form-field">
          <label className="category-form-label" htmlFor="category-name">Category name</label>
          <input
            id="category-name"
            className="category-form-control"
            placeholder="e.g. Subscriptions"
            value={form.name}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, name: event.target.value }));
              setError('');
            }}
          />
        </div>
        <div className="category-form-field narrow">
          <label className="category-form-label" htmlFor="category-type">Applies to</label>
          <select
            id="category-type"
            className="category-form-control"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
        <button type="submit" className="category-submit" disabled={saving}>
          <Plus size={16} />
          {saving ? 'Adding…' : 'Add category'}
        </button>
      </form>

      {error && <div className="category-error">{error}</div>}

      {loading ? (
        <div className="category-grid">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <div key={key} className="ns-skeleton category-skeleton" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="category-empty">No categories yet. Add your first one above.</div>
      ) : (
        <div className="category-grid">
          {categories.map((category) => {
            const Icon = categoryIcon(category.name);
            const count = counts.get(category.id) || 0;
            return (
              <div key={`${category.type}-${category.id}`} className="category-card">
                <span
                  className="category-glyph"
                  style={{ color: colorMap[category.name] || 'var(--green-700)' }}
                >
                  <Icon size={17} />
                </span>
                <div className="category-text">
                  <span className="category-name">{category.name}</span>
                  <span className="category-meta">
                    {count} {count === 1 ? 'entry' : 'entries'} ·{' '}
                    {category.type === 'INCOME' ? 'Income' : 'Expense'}
                  </span>
                </div>
                <button
                  type="button"
                  className="category-delete"
                  title="Delete category"
                  onClick={() => setPendingDelete(category)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        busy={deleting}
        title="Delete this category?"
        body={`“${pendingDelete?.name}” will no longer be available when logging transactions.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default Categories;
