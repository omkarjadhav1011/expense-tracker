import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, PiggyBank, Receipt } from 'lucide-react';
import dashboardApi from '../../api/dashboardApi';
import { useAppShell } from '../../app/AppShellContext';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import IncomeExpenseChart from '../../components/IncomeExpenseChart/IncomeExpenseChart';
import ExpenseBreakdown from '../../components/ExpenseBreakdown/ExpenseBreakdown';
import RecentTransactions from '../../components/RecentTransactions/RecentTransactions';
import { colorForIndex } from '../../lib/categoryVisuals';
import { downloadCsv } from '../../lib/csv';
import { formatMoney, toIsoDate } from '../../lib/format';
import './Dashboard.css';

const RANGES = [
  { key: '1M', label: 'This month', months: 1 },
  { key: '3M', label: '3 months', months: 3 },
  { key: '6M', label: '6 months', months: 6 },
  { key: '1Y', label: 'This year', months: 12 },
];

// A window of whole calendar months ending `offset` windows back from today.
const monthWindow = (months, offset = 0) => {
  const now = new Date();
  const anchor = new Date(now.getFullYear(), now.getMonth() - offset * months, 1);
  const start = new Date(anchor.getFullYear(), anchor.getMonth() - (months - 1), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { start: toIsoDate(start), end: toIsoDate(end) };
};

const captionFor = ({ start, end }) => {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
    return `1 – ${to.getDate()} ${to.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
  }
  const fromLabel = from.toLocaleDateString('en-GB', {
    month: 'short',
    ...(from.getFullYear() === to.getFullYear() ? {} : { year: 'numeric' }),
  });
  const toLabel = to.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return `${fromLabel} – ${toLabel}`;
};

const sumBy = (rows, type) =>
  rows.filter((t) => t.type === type).reduce((total, t) => total + Number(t.amount || 0), 0);

// Percent change against the previous window; null when there is no baseline.
const percentDelta = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

const formatDelta = (value) =>
  value === null ? 'No baseline' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

const Dashboard = () => {
  const { transactions, currency, loading, openDrawer } = useAppShell();
  const [range, setRange] = useState('1M');
  const [trend, setTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);

  const months = RANGES.find((r) => r.key === range)?.months ?? 1;
  const trendMonths = range === '1Y' ? 12 : 6;

  // Refetches when the range widens to a year, and after the ledger changes.
  useEffect(() => {
    let cancelled = false;
    dashboardApi
      .getMonthlyTrend(trendMonths)
      .then((rows) => {
        if (!cancelled) setTrend(rows || []);
      })
      .catch(() => {
        if (!cancelled) setTrend([]);
      })
      .finally(() => {
        if (!cancelled) setTrendLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trendMonths, transactions]);

  const period = useMemo(() => monthWindow(months), [months]);
  const previousPeriod = useMemo(() => monthWindow(months, 1), [months]);

  const inRange = useMemo(
    () =>
      transactions.filter(
        (t) => t.transactionDate >= period.start && t.transactionDate <= period.end,
      ),
    [transactions, period],
  );

  const inPrevious = useMemo(
    () =>
      transactions.filter(
        (t) => t.transactionDate >= previousPeriod.start && t.transactionDate <= previousPeriod.end,
      ),
    [transactions, previousPeriod],
  );

  const income = sumBy(inRange, 'INCOME');
  const expense = sumBy(inRange, 'EXPENSE');
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
  const expenseCount = inRange.filter((t) => t.type === 'EXPENSE').length;

  const incomeDelta = percentDelta(income, sumBy(inPrevious, 'INCOME'));
  const expenseDelta = percentDelta(expense, sumBy(inPrevious, 'EXPENSE'));

  // Top five expense categories, everything else rolled into "Other".
  const slices = useMemo(() => {
    const totals = new Map();
    inRange
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const name = t.categoryName || 'Uncategorised';
        totals.set(name, (totals.get(name) || 0) + Number(t.amount || 0));
      });

    const sorted = [...totals.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((total, row) => total + row.amount, 0);
    if (rest > 0) top.push({ name: 'Other', amount: rest });

    const total = top.reduce((sum, row) => sum + row.amount, 0);
    return top.map((row, index) => ({
      ...row,
      color: colorForIndex(index),
      percent: total > 0 ? (row.amount / total) * 100 : 0,
    }));
  }, [inRange]);

  const spendTotal = slices.reduce((total, slice) => total + slice.amount, 0);

  const recent = useMemo(
    () =>
      [...inRange]
        .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
        .slice(0, 5),
    [inRange],
  );

  const handleExport = () => {
    downloadCsv(
      `budgetwise-${period.start}-to-${period.end}.csv`,
      ['Date', 'Description', 'Category', 'Type', 'Amount'],
      [...inRange]
        .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
        .map((t) => [
          t.transactionDate,
          t.description || '',
          t.categoryName || '',
          t.type,
          Number(t.amount || 0),
        ]),
    );
  };

  return (
    <div className="dash">
      <div className="dash-toolbar">
        <div className="dash-segment">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`dash-segment-option${range === option.key ? ' active' : ''}`}
              onClick={() => setRange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="dash-caption">{captionFor(period)}</span>
        <div className="dash-toolbar-spacer" />
        <button
          type="button"
          className="dash-ghost-button"
          onClick={handleExport}
          disabled={inRange.length === 0}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <div className="dash-stats">
        <SummaryCard
          label="Income"
          value={formatMoney(income, currency)}
          icon={ArrowDownLeft}
          tone="brand"
          loading={loading}
          delta={formatDelta(incomeDelta)}
          deltaTone={incomeDelta === null ? 'muted' : incomeDelta >= 0 ? 'positive' : 'negative'}
          foot="vs previous period"
        />
        <SummaryCard
          label="Spend"
          value={formatMoney(expense, currency)}
          icon={ArrowUpRight}
          tone="neutral"
          loading={loading}
          delta={formatDelta(expenseDelta)}
          deltaTone={expenseDelta === null ? 'muted' : expenseDelta > 0 ? 'warning' : 'positive'}
          foot="vs previous period"
        />
        <SummaryCard
          label="Net saved"
          value={formatMoney(balance, currency)}
          icon={PiggyBank}
          tone="brand"
          accent={balance >= 0}
          loading={loading}
          delta={`${savingsRate}%`}
          deltaTone={savingsRate >= 20 ? 'positive' : 'warning'}
          foot="of income kept"
        />
        <SummaryCard
          label="Transactions"
          value={String(inRange.length)}
          icon={Receipt}
          tone="neutral"
          loading={loading}
          delta={formatMoney(expenseCount ? expense / expenseCount : 0, currency)}
          deltaTone="muted"
          foot="average expense"
        />
      </div>

      <div className="dash-charts">
        <IncomeExpenseChart
          data={trend}
          currency={currency}
          loading={trendLoading}
          subtitle={`Monthly totals — last ${trendMonths} months`}
        />
        <ExpenseBreakdown
          slices={slices}
          total={spendTotal}
          currency={currency}
          loading={loading}
        />
      </div>

      <RecentTransactions transactions={recent} currency={currency} loading={loading} />

      {!loading && transactions.length === 0 && (
        <div className="dash-onboard">
          <div className="dash-onboard-title">Your ledger is empty</div>
          <div className="dash-onboard-body">
            Log your first income or expense and every figure on this page starts filling in.
          </div>
          <button type="button" className="dash-onboard-cta" onClick={() => openDrawer()}>
            Add transaction
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
