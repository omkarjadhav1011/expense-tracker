import React, { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import userApi from '../../api/userApi';
import budgetApi from '../../api/budgetApi';
import { useAppShell } from '../../app/AppShellContext';
import { currencySymbol, initials, toMonthParts } from '../../lib/format';
import './Profile.css';

const CURRENCIES = [
  ['INR', 'INR — Indian Rupee'],
  ['USD', 'USD — US Dollar'],
  ['EUR', 'EUR — Euro'],
  ['GBP', 'GBP — British Pound'],
  ['JPY', 'JPY — Japanese Yen'],
  ['CAD', 'CAD — Canadian Dollar'],
  ['AUD', 'AUD — Australian Dollar'],
];

const Profile = () => {
  const { user, setUser, refresh } = useAppShell();
  const { month, year } = toMonthParts();

  const [form, setForm] = useState({ name: '', currency: 'INR', monthlyBudget: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // The monthly-budget field maps to this month's overall cap, which is a
  // separate resource from the user profile and so has to be loaded separately.
  const hydrate = useCallback(async () => {
    if (!user) return;
    let budget = null;
    try {
      budget = await budgetApi.getMonthlyBudget(month, year);
    } catch {
      budget = null;
    }
    setForm({
      name: user.name || '',
      currency: user.currency || 'INR',
      monthlyBudget: budget?.amount != null ? String(budget.amount) : '',
    });
  }, [user, month, year]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Your name cannot be empty.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const updated = await userApi.updateCurrentUser({
        name: form.name.trim(),
        currency: form.currency,
      });
      setUser(updated);

      const amount = parseFloat(form.monthlyBudget);
      if (form.monthlyBudget !== '' && (!amount || amount <= 0)) {
        throw new Error('Monthly budget must be greater than zero.');
      }
      if (amount > 0) {
        // Upserts on (month, year), so this updates the existing cap rather than
        // adding a second one for the same month.
        await budgetApi.saveMonthlyBudget({
          month,
          year,
          amount,
          currency: form.currency,
        });
      }

      setSaved(true);
      await refresh();
      await hydrate();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile">
      <div className="profile-identity">
        <div className="profile-avatar">{initials(user?.name)}</div>
        <div className="profile-identity-name">{user?.name || '—'}</div>
        <div className="profile-identity-email">{user?.email || ''}</div>
        <div className="profile-identity-pill">
          {currencySymbol(user?.currency || 'INR')} {user?.currency || 'INR'}
        </div>
      </div>

      <form className="profile-details" onSubmit={handleSubmit}>
        <div>
          <div className="profile-details-title">Account details</div>
          <div className="profile-details-sub">Changes save to your account immediately.</div>
        </div>

        <div className="profile-grid">
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              className="profile-control"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
            />
          </div>

          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              className="profile-control disabled"
              value={user?.email || ''}
              disabled
            />
            <span className="profile-note">Email cannot be changed.</span>
          </div>

          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-currency">Currency</label>
            <select
              id="profile-currency"
              className="profile-control"
              value={form.currency}
              onChange={(event) => update('currency', event.target.value)}
            >
              {CURRENCIES.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-budget">
              Monthly budget
            </label>
            <input
              id="profile-budget"
              className="profile-control"
              type="number"
              min="0"
              step="0.01"
              placeholder="Not set"
              value={form.monthlyBudget}
              onChange={(event) => update('monthlyBudget', event.target.value)}
            />
            <span className="profile-note">Overall cap for {month}. Tracked on the Budgets page.</span>
          </div>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {saved && !error && (
          <div className="profile-success">
            <Check size={16} />
            Saved.
          </div>
        )}

        <div className="profile-divider" />

        <div className="profile-actions">
          <button type="submit" className="profile-save" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className="profile-cancel" onClick={hydrate} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
