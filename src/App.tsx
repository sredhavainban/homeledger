/* ═══════════════════════════════════════════════════════════════
   HomeLedger – Complete Frontend Application
   Premium dark-themed personal finance dashboard
   Zero external icon/chart dependencies — pure CSS + SVG
   ═══════════════════════════════════════════════════════════════ */
import { useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from 'react-router-dom';
import {
  FinanceProvider,
  useFinance,
} from './context/FinanceContext';
import { saveSupabaseConfig } from './lib/supabase';

/* ─────────────────────────────────────────────────────────
   Inline SVG Icons (no lucide-react needed)
   ───────────────────────────────────────────────────────── */
const sz = 18;
const Icons = {
  dashboard: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  wallet: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a1 1 0 0 0 0 4h4v-4Z"/></svg>,
  transfer: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>,
  piggy: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.5 a1 1 0 0 0 1 0"/></svg>,
  target: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  settings: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  plus: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  trendUp: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  trendDown: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>,
  dollar: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  search: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  bell: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  x: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  check: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  calendar: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  download: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  filter: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  eye: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>,
  dots: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  creditCard: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  menu: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  chevronLeft: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  trash: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  edit: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  refresh: (s = sz) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
};

/* ─────────────────────────────────────────────────────────
   Category emoji icons
   ───────────────────────────────────────────────────────── */
const CAT_EMOJI: Record<string, string> = {
  Housing: '🏠', Groceries: '🛒', Transport: '🚗', Utilities: '💡',
  Dining: '🍽️', Entertainment: '🎬', Healthcare: '🏥', Education: '📚',
  Fitness: '🏋️', Travel: '✈️', Gifts: '🎁', Salary: '💰',
  Shopping: '🛍️', Insurance: '🛡️', Savings: '🏦',
};

const MONTHLY_DATA = [
  { month: 'May', income: 750000, expenses: 420000 },
  { month: 'Jun', income: 680000, expenses: 445000 },
  { month: 'Jul', income: 720000, expenses: 390000 },
  { month: 'Aug', income: 810000, expenses: 510000 },
  { month: 'Sep', income: 770000, expenses: 460000 },
  { month: 'Oct', income: 770000, expenses: 359390 },
];

const NET_WORTH_DATA = [
  { month: 'May', value: 16200000 },
  { month: 'Jun', value: 16450000 },
  { month: 'Jul', value: 16900000 },
  { month: 'Aug', value: 17100000 },
  { month: 'Sep', value: 17600000 },
  { month: 'Oct', value: 18368930 },
];

/* ─────────────────────────────────────────────────────────
   Utilities
   ───────────────────────────────────────────────────────── */
function formatMoney(cents: number): string {
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rem = abs % 100;
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${dollars.toLocaleString()}.${String(rem).padStart(2, '0')}`;
}

function formatShort(cents: number): string {
  const abs = Math.abs(cents);
  const sign = cents < 0 ? '-' : '';
  if (abs >= 100_000_000) return `${sign}$${(abs / 100_000_000).toFixed(1)}M`;
  if (abs >= 100_000) return `${sign}$${(abs / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return formatMoney(cents);
}

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ');
}

function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

/* ─────────────────────────────────────────────────────────
   Pure CSS Bar Chart Component
   ───────────────────────────────────────────────────────── */
function BarChart({ data, barColors }: { data: { label: string; values: number[] }[]; barColors: string[] }) {
  const maxVal = Math.max(...data.flatMap(d => d.values), 1);
  return (
    <div className="flex items-end gap-3 h-52 pt-4 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-1 w-full h-44">
            {d.values.map((v, j) => (
              <div
                key={j}
                className="flex-1 rounded-t-sm transition-all duration-700 ease-out"
                style={{
                  height: `${(v / maxVal) * 100}%`,
                  backgroundColor: barColors[j],
                  opacity: 0.85,
                  minHeight: v > 0 ? '4px' : '0',
                }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pure CSS Donut Chart Component
   ───────────────────────────────────────────────────────── */
function DonutChart({ segments, size = 160 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const gradientParts = segments.map(seg => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-full shadow-inner"
        style={{
          width: size,
          height: size,
          background: gradientParts.length > 0 ? `conic-gradient(${gradientParts.join(', ')})` : '#2a2e3e',
          mask: `radial-gradient(circle ${size * 0.32}px at center, transparent 99%, black 100%)`,
          WebkitMask: `radial-gradient(circle ${size * 0.32}px at center, transparent 99%, black 100%)`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pure CSS Sparkline (area)
   ───────────────────────────────────────────────────────── */
function SparkArea({ data, color = '#6366f1', height = 120 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 300;
  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  });
  const pathD = `M${points.join(' L')}`;
  const areaD = `${pathD} L${w},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#','')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   UI Components
   ───────────────────────────────────────────────────────── */
function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-surface p-5',
      hover && 'transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5',
      'shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]',
      className,
    )}>
      {children}
    </div>
  );
}

function StatCard({ label, value, change, up, icon }: {
  label: string; value: string; change?: string; up?: boolean; icon: (s?: number) => ReactNode;
}) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{value}</p>
          {change && (
            <div className={cn('mt-2 flex items-center gap-1 text-xs font-semibold', up ? 'text-success' : 'text-danger')}>
              {up ? Icons.trendUp(13) : Icons.trendDown(13)}
              {change}
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {icon(20)}
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ value, max, color = '#6366f1', h = 'h-2' }: { value: number; max: number; color?: string; h?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : color;
  return (
    <div className={cn('w-full rounded-full bg-border/50 overflow-hidden', h)}>
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: barColor }} />
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'danger' | 'warning' }) {
  const cls: Record<string, string> = {
    default: 'bg-primary/15 text-primary', success: 'bg-success/15 text-success',
    danger: 'bg-danger/15 text-danger', warning: 'bg-warning/15 text-warning',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', cls[variant])}>{children}</span>;
}

/* ─────────────────────────────────────────────────────────
   MODAL: Quick-Add Transaction
   ───────────────────────────────────────────────────────── */
function QuickAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categories, accounts, addTransaction } = useFinance();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Set default category and account on open
  useEffect(() => {
    if (open) {
      const validCats = categories.filter(c => type === 'income' ? c.isIncome : !c.isIncome);
      if (validCats.length > 0) setCategory(validCats[0].name);
      if (accounts.length > 0) setAccount(accounts[0].name);
      setError('');
    }
  }, [open, type, categories, accounts]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount greater than $0');
      return;
    }
    if (!payee.trim()) {
      setError('Please enter a payee or description');
      return;
    }

    const cents = Math.round(val * 100);
    const finalAmount = type === 'expense' ? -cents : cents;

    addTransaction({
      payee: payee.trim(),
      amount: finalAmount,
      category: category || (type === 'income' ? 'Salary' : 'Other'),
      account: account || (accounts[0]?.name ?? 'Main Checking'),
      type,
      date,
      notes: notes.trim(),
    });

    setAmount('');
    setPayee('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-slide-down" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Add Transaction</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground">{Icons.x(18)}</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-background rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const expCats = categories.filter(c => !c.isIncome);
                if (expCats.length > 0) setCategory(expCats[0].name);
              }}
              className={cn('flex-1 py-2 rounded-lg text-sm font-semibold transition-all', type === 'expense' ? 'bg-danger text-white shadow' : 'text-muted hover:text-foreground')}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const incCats = categories.filter(c => c.isIncome);
                if (incCats.length > 0) setCategory(incCats[0].name);
              }}
              className={cn('flex-1 py-2 rounded-lg text-sm font-semibold transition-all', type === 'income' ? 'bg-success text-white shadow' : 'text-muted hover:text-foreground')}
            >
              Income
            </button>
          </div>

          {error && <div className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg font-medium">{error}</div>}

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 pl-8 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Payee / Description</label>
            <input
              type="text"
              placeholder="e.g. Whole Foods, Uber, Client payment"
              value={payee}
              onChange={e => setPayee(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                {categories.filter(c => type === 'income' ? c.isIncome : !c.isIncome).map(c => (
                  <option key={c.name} value={c.name}>{CAT_EMOJI[c.name] || '📂'} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Account</label>
            <select
              value={account}
              onChange={e => setAccount(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.name}>{a.emoji} {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Add details…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MODAL: New Savings Goal
   ───────────────────────────────────────────────────────── */
function NewGoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGoal } = useFinance();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('2027-12-31');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');

  const COLOR_OPTIONS = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Emerald', value: '#22c55e' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Red', value: '#ef4444' },
  ];

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a goal name');
      return;
    }
    const targetVal = parseFloat(target);
    if (isNaN(targetVal) || targetVal <= 0) {
      setError('Please enter a target amount greater than $0');
      return;
    }
    const currentVal = parseFloat(current) || 0;

    addGoal({
      name: name.trim(),
      target: Math.round(targetVal * 100),
      current: Math.round(currentVal * 100),
      deadline,
      color,
    });

    setName('');
    setTarget('');
    setCurrent('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-slide-down" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {Icons.target(18)}
            </div>
            <h2 className="text-lg font-bold text-foreground">Create New Goal</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground">{Icons.x(18)}</button>
        </div>

        {error && <div className="mb-4 text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Japan Trip, Home Down Payment, New MacBook"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Target Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5000"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 pl-8 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Current Saved ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 pl-8 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Target Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-2 uppercase tracking-wider">Accent Color</label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={cn(
                    'h-8 w-8 rounded-full transition-transform flex items-center justify-center',
                    color === c.value ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-surface' : 'opacity-70 hover:opacity-100 hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                >
                  {color === c.value && Icons.check(14)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MODAL: Set Budget
   ───────────────────────────────────────────────────────── */
function SetBudgetModal({ open, onClose, selectedCategory }: { open: boolean; onClose: () => void; selectedCategory?: string }) {
  const { categories, setBudget, updateAllBudgets } = useFinance();
  const expenseCategories = useMemo(() => categories.filter(c => !c.isIncome), [categories]);

  const [activeTab, setActiveTab] = useState<'single' | 'all'>('single');
  const [categoryName, setCategoryName] = useState(selectedCategory || expenseCategories[0]?.name || 'Groceries');
  const [singleAmount, setSingleAmount] = useState('');
  const [allBudgets, setAllBudgets] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (open) {
      const targetCat = selectedCategory || expenseCategories[0]?.name || 'Groceries';
      setCategoryName(targetCat);
      const catObj = expenseCategories.find(c => c.name === targetCat);
      setSingleAmount(catObj ? (catObj.budget / 100).toString() : '0');

      const map: Record<string, string> = {};
      expenseCategories.forEach(c => {
        map[c.name] = (c.budget / 100).toString();
      });
      setAllBudgets(map);
      setSuccessMsg('');
    }
  }, [open, selectedCategory, expenseCategories]);

  if (!open) return null;

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(singleAmount);
    if (isNaN(val) || val < 0) return;
    setBudget(categoryName, Math.round(val * 100));
    setSuccessMsg(`Budget for ${categoryName} updated to $${val.toFixed(2)}!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const centsMap: Record<string, number> = {};
    Object.entries(allBudgets).forEach(([name, valStr]) => {
      const val = parseFloat(valStr) || 0;
      centsMap[name] = Math.round(val * 100);
    });
    updateAllBudgets(centsMap);
    setSuccessMsg('All budgets updated successfully!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-slide-down max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {Icons.wallet(18)}
            </div>
            <h2 className="text-lg font-bold text-foreground">Set Budgets</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-foreground">{Icons.x(18)}</button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-5 p-1 bg-background rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all', activeTab === 'single' ? 'bg-primary text-white shadow' : 'text-muted hover:text-foreground')}
          >
            Adjust Single Category
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all', activeTab === 'all' ? 'bg-primary text-white shadow' : 'text-muted hover:text-foreground')}
          >
            Adjust All Categories ({expenseCategories.length})
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 text-xs text-success bg-success/15 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5">
            {Icons.check(14)} {successMsg}
          </div>
        )}

        {activeTab === 'single' ? (
          <form onSubmit={handleSaveSingle} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Select Category</label>
              <select
                value={categoryName}
                onChange={e => {
                  setCategoryName(e.target.value);
                  const catObj = expenseCategories.find(c => c.name === e.target.value);
                  setSingleAmount(catObj ? (catObj.budget / 100).toString() : '0');
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              >
                {expenseCategories.map(c => (
                  <option key={c.name} value={c.name}>{CAT_EMOJI[c.name] || '📂'} {c.name} (Current: ${formatMoney(c.budget)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1.5 uppercase tracking-wider">Monthly Budget ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold">$</span>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={singleAmount}
                  onChange={e => setSingleAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 pl-8 text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-bold text-lg"
                />
              </div>
            </div>

            {/* Quick stats for this category */}
            {(() => {
              const currentCat = expenseCategories.find(c => c.name === categoryName);
              if (!currentCat) return null;
              const newBudgetVal = parseFloat(singleAmount) || 0;
              const newBudgetCents = Math.round(newBudgetVal * 100);
              const remainingCents = newBudgetCents - currentCat.spent;
              return (
                <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Already Spent (Oct):</span>
                    <span className="font-semibold text-foreground">{formatMoney(currentCat.spent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Projected Remaining:</span>
                    <span className={cn('font-semibold', remainingCents >= 0 ? 'text-success' : 'text-danger')}>
                      {formatMoney(remainingCents)}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow"
              >
                Save Budget
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSaveAll} className="space-y-3">
            <p className="text-xs text-muted">Update monthly budget allocations across all categories:</p>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {expenseCategories.map(cat => (
                <div key={cat.name} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-background border border-border/40">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="text-base">{CAT_EMOJI[cat.name] || '📂'}</span>
                    <span className="text-xs font-semibold text-foreground">{cat.name}</span>
                  </div>
                  <div className="relative flex-1 max-w-[140px]">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs font-bold">$</span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={allBudgets[cat.name] ?? ''}
                      onChange={e => setAllBudgets({ ...allBudgets, [cat.name]: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface px-2 py-1 pl-6 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-right"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow"
              >
                Save All Budgets
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Sidebar (collapsible: push on desktop, overlay on mobile)
   ───────────────────────────────────────────────────────── */
const SIDEBAR_ID = 'hl-sidebar';

function Sidebar({ onQuickAdd, isOpen, onClose }: {
  onQuickAdd: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  const links = [
    { to: '/', label: 'Dashboard', icon: Icons.dashboard },
    { to: '/accounts', label: 'Accounts', icon: Icons.creditCard },
    { to: '/transactions', label: 'Transactions', icon: Icons.transfer },
    { to: '/budgets', label: 'Budgets', icon: Icons.wallet },
    { to: '/goals', label: 'Goals', icon: Icons.target },
    { to: '/settings', label: 'Settings', icon: Icons.settings },
  ];

  useEffect(() => {
    if (isOpen && !isDesktop && sidebarRef.current) {
      const firstFocusable = sidebarRef.current.querySelector<HTMLElement>('button, a');
      firstFocusable?.focus();
    }
  }, [isOpen, isDesktop]);

  useEffect(() => {
    if (!isOpen || isDesktop) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isDesktop, onClose]);

  const handleNavClick = () => {
    if (!isDesktop) onClose();
  };

  return (
    <>
      {isOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id={SIDEBAR_ID}
        ref={sidebarRef}
        aria-label="Main Navigation"
        aria-hidden={!isOpen}
        {...(!isOpen ? ({ inert: '' } as any) : {})}
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface p-4 flex flex-col justify-between sidebar-transition',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div>
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-[#ec4899] flex items-center justify-center text-white font-extrabold text-sm shadow">
                HL
              </div>
              <span className="font-extrabold text-foreground tracking-tight text-lg">HomeLedger</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              aria-label="Close sidebar"
            >
              {Icons.chevronLeft(18)}
            </button>
          </div>

          <button
            onClick={onQuickAdd}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-sm font-bold text-white shadow-lg hover:bg-primary-hover transition-all active:scale-[0.98] mb-6"
          >
            {Icons.plus(16)} Add Transaction
          </button>

          <nav className="space-y-1">
            {links.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  tabIndex={isOpen ? 0 : -1}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted hover:text-foreground hover:bg-surface-hover',
                  )}
                >
                  {icon(18)}
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <SidebarFooter />
      </aside>
    </>
  );
}

function SidebarFooter() {
  const { isCloudConnected, syncStatus } = useFinance();
  return (
    <div className="px-3 py-3 rounded-xl bg-background border border-border/40 text-xs space-y-1">
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", isCloudConnected ? "bg-success animate-pulse" : "bg-primary")} />
        <p className="font-semibold text-foreground">
          {isCloudConnected ? "Supabase Cloud" : "Local Storage"}
        </p>
      </div>
      <p className="text-[10px] text-muted truncate">{syncStatus}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Top Bar
   ───────────────────────────────────────────────────────── */
function TopBar({ onQuickAdd, sidebarOpen, onToggleSidebar }: {
  onQuickAdd: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/80 px-4 md:px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            aria-label="Open navigation menu"
            className="p-2 rounded-xl border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            {Icons.menu(18)}
          </button>
        )}
        <div className="relative hidden sm:block w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {Icons.search(16)}
          </span>
          <input
            type="text"
            placeholder="Search transactions, budgets…"
            className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow"
        >
          {Icons.plus(15)} <span className="hidden sm:inline">Add Transaction</span>
        </button>
        <button className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors">
          {Icons.bell(16)}
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[#ec4899] flex items-center justify-center text-white text-xs font-extrabold shadow">
            HL
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────
   Mobile Bottom Navigation
   ───────────────────────────────────────────────────────── */
function MobileNav({ onQuickAdd }: { onQuickAdd: () => void }) {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Home', icon: Icons.dashboard },
    { to: '/accounts', label: 'Accounts', icon: Icons.creditCard },
    { to: '/transactions', label: 'Txns', icon: Icons.transfer },
    { to: '/budgets', label: 'Budgets', icon: Icons.wallet },
    { to: '/goals', label: 'Goals', icon: Icons.target },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-border bg-surface/95 px-2 py-2 backdrop-blur-md lg:hidden">
      {links.map(({ to, label, icon }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              'flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
              active ? 'text-primary' : 'text-muted hover:text-foreground',
            )}
          >
            {icon(18)}
            <span>{label}</span>
          </NavLink>
        );
      })}
      <button
        onClick={onQuickAdd}
        className="flex flex-col items-center gap-1 py-1 px-2.5 text-primary font-semibold text-[10px]"
      >
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shadow">
          {Icons.plus(14)}
        </div>
        <span>Add</span>
      </button>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Dashboard
   ═══════════════════════════════════════════════════════════ */
function DashboardPage() {
  const { accounts, categories, transactions, goals, upcomingBills } = useFinance();

  const totalBalance = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);
  const monthIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const monthExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0), [transactions]);
  const remaining = monthIncome - monthExpenses;

  const pieSegments = useMemo(() =>
    categories.filter(c => !c.isIncome && c.spent > 0).map(c => ({ value: c.spent, color: c.color, label: c.name })),
    [categories]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">Good afternoon! 👋</h2>
        <p className="text-sm text-muted mt-1">Here's your live financial overview for October 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Net Worth" value={formatMoney(totalBalance)} change="4.3% from last month" up icon={Icons.dollar} />
        <StatCard label="Income (Oct)" value={formatMoney(monthIncome)} change="12% from last month" up icon={Icons.trendUp} />
        <StatCard label="Expenses (Oct)" value={formatMoney(monthExpenses)} change="3% from last month" up={false} icon={Icons.trendDown} />
        <StatCard label="Remaining" value={formatMoney(remaining)} icon={Icons.wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground">Income vs Expenses</h3>
            <Badge>Last 6 months</Badge>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <span className="flex items-center gap-1.5 text-[11px] text-muted"><span className="h-2.5 w-2.5 rounded-sm bg-success inline-block" /> Income</span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted"><span className="h-2.5 w-2.5 rounded-sm bg-danger inline-block" /> Expenses</span>
          </div>
          <BarChart
            data={MONTHLY_DATA.map(d => ({ label: d.month, values: [d.income, d.expenses] }))}
            barColors={['#22c55e', '#ef4444']}
          />
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-foreground mb-4">Spending by Category</h3>
          <div className="flex justify-center">
            <DonutChart segments={pieSegments} size={150} />
          </div>
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {pieSegments.slice(0, 6).map(c => (
              <div key={c.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                  <span className="text-muted">{c.label}</span>
                </div>
                <span className="font-semibold text-foreground">{formatMoney(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-sm font-bold text-foreground mb-3">Net Worth Trend</h3>
          <SparkArea data={NET_WORTH_DATA.map(d => d.value)} color="#6366f1" height={130} />
          <div className="flex justify-between mt-2">
            {NET_WORTH_DATA.map(d => <span key={d.month} className="text-[10px] text-muted">{d.month}</span>)}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Savings Goals ({goals.length})</h3>
            <NavLink to="/goals" className="text-[11px] text-primary hover:underline font-medium">Manage →</NavLink>
          </div>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {goals.map(g => {
              const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{g.name}</span>
                    <span className="text-[11px] text-muted font-medium">{pct}%</span>
                  </div>
                  <ProgressBar value={g.current} max={g.target} color={g.color} />
                  <p className="text-[10px] text-muted mt-1">{formatShort(g.current)} of {formatShort(g.target)}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Upcoming Bills</h3>
            <Badge variant={upcomingBills.filter(b => !b.isPaid).length > 3 ? 'warning' : 'default'}>
              {upcomingBills.filter(b => !b.isPaid).length} unpaid
            </Badge>
          </div>
          <div className="space-y-3">
            {upcomingBills.map(bill => {
              const days = daysUntil(bill.dueDate);
              const overdue = days < 0;
              return (
                <div key={bill.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-xs',
                      bill.isPaid ? 'bg-success/15 text-success' : overdue ? 'bg-danger/15 text-danger' : 'bg-primary/15 text-primary')}>
                      {bill.isPaid ? Icons.check(14) : Icons.calendar(14)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{bill.name}</p>
                      <p className="text-[10px] text-muted">{bill.isPaid ? 'Paid' : overdue ? 'Overdue' : `Due in ${days}d`}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground">{formatMoney(bill.amount)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Recent Transactions</h3>
          <NavLink to="/transactions" className="text-[11px] text-primary hover:underline font-medium">View all →</NavLink>
        </div>
        <div className="space-y-1">
          {transactions.slice(0, 7).map(tx => (
            <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 hover:bg-surface-hover/50 -mx-2 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: (categories.find(c => c.name === tx.category)?.color || '#6366f1') + '18' }}>
                  {CAT_EMOJI[tx.category] || '📂'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tx.payee}</p>
                  <p className="text-[10px] text-muted">{tx.category} · {tx.account}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-bold', tx.amount > 0 ? 'text-success' : 'text-foreground')}>
                  {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount)}
                </p>
                <p className="text-[10px] text-muted">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Accounts
   ═══════════════════════════════════════════════════════════ */
function AccountsPage() {
  const { accounts } = useFinance();
  const [show, setShow] = useState(true);
  const assets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const liabilities = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
  const total = assets - liabilities;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Accounts</h2>
          <p className="text-sm text-muted mt-1">Manage your financial accounts and assets</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShow(!show)} className="text-muted hover:text-foreground transition-colors p-2 rounded-xl border border-border bg-surface">
            {show ? Icons.eye(16) : Icons.eyeOff(16)}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Assets" value={show ? formatMoney(assets) : '••••••'} icon={Icons.trendUp} />
        <StatCard label="Liabilities" value={show ? formatMoney(liabilities) : '••••••'} icon={Icons.creditCard} />
        <StatCard label="Net Worth" value={show ? formatMoney(total) : '••••••'} change="4.3%" up icon={Icons.dollar} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(acc => (
          <Card key={acc.id} hover className="cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: acc.color + '18' }}>
                  {acc.emoji}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{acc.name}</p>
                  <p className="text-[10px] text-muted capitalize font-medium">{acc.type.replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-border/40 text-muted">Active</span>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40">
              <p className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-1">Current Balance</p>
              <p className={cn('text-xl font-extrabold', acc.balance >= 0 ? 'text-foreground' : 'text-danger')}>
                {show ? formatMoney(acc.balance) : '••••••'}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Transactions with Full Interactive Filtering
   ═══════════════════════════════════════════════════════════ */
function TransactionsPage() {
  const { transactions, categories, accounts, deleteTransaction } = useFinance();

  // Filters State
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_30' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Toggle filter drawer
  const [showFilters, setShowFilters] = useState(false);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterType !== 'all') count++;
    if (search.trim()) count++;
    if (selectedCategory !== 'all') count++;
    if (selectedAccount !== 'all') count++;
    if (dateRange !== 'all') count++;
    if (minAmount.trim() || maxAmount.trim()) count++;
    if (sortBy !== 'date_desc') count++;
    return count;
  }, [filterType, search, selectedCategory, selectedAccount, dateRange, minAmount, maxAmount, sortBy]);

  const resetFilters = () => {
    setFilterType('all');
    setSearch('');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date_desc');
  };

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filterType === 'income' && tx.type !== 'income') return false;
      if (filterType === 'expense' && tx.type !== 'expense') return false;

      // Search (payee or category or notes)
      if (search) {
        const query = search.toLowerCase();
        const matchesPayee = tx.payee.toLowerCase().includes(query);
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesNotes = tx.notes?.toLowerCase().includes(query) ?? false;
        if (!matchesPayee && !matchesCat && !matchesNotes) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

      // Account filter
      if (selectedAccount !== 'all' && tx.account !== selectedAccount) return false;

      // Min & Max Amount (in dollars)
      const absDollars = Math.abs(tx.amount) / 100;
      if (minAmount && !isNaN(parseFloat(minAmount)) && absDollars < parseFloat(minAmount)) {
        return false;
      }
      if (maxAmount && !isNaN(parseFloat(maxAmount)) && absDollars > parseFloat(maxAmount)) {
        return false;
      }

      // Date Range filter
      if (dateRange === 'this_month') {
        const currentMonth = '2026-10';
        if (!tx.date.startsWith(currentMonth)) return false;
      } else if (dateRange === 'last_30') {
        const txTime = new Date(tx.date).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (txTime < thirtyDaysAgo) return false;
      } else if (dateRange === 'custom') {
        if (customStartDate && tx.date < customStartDate) return false;
        if (customEndDate && tx.date > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortBy === 'amount_asc') return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });
  }, [transactions, filterType, search, selectedCategory, selectedAccount, minAmount, maxAmount, dateRange, customStartDate, customEndDate, sortBy]);

  const inc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Payee', 'Category', 'Account', 'Type', 'Amount', 'Notes'];
    const rows = filtered.map(t => [
      t.date,
      `"${t.payee.replace(/"/g, '""')}"`,
      t.category,
      t.account,
      t.type,
      (t.amount / 100).toFixed(2),
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `homeledger_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Transactions</h2>
          <p className="text-sm text-muted mt-1">
            Showing {filtered.length} of {transactions.length} transactions
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:border-primary transition-colors"
        >
          {Icons.download(16)} Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Filtered Income</p><p className="text-xl font-extrabold text-success mt-1">{formatMoney(inc)}</p></Card>
        <Card><p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Filtered Expenses</p><p className="text-xl font-extrabold text-danger mt-1">{formatMoney(exp)}</p></Card>
      </div>

      {/* Main Search and Quick Tabs */}
      <Card className="!p-3.5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-xl border border-border bg-background px-3 py-2">
            {Icons.search(16)}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by payee, category, notes…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted hover:text-foreground">
                {Icons.x(14)}
              </button>
            )}
          </div>

          <div className="flex gap-1 p-0.5 bg-background rounded-xl">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                  filterType === t
                    ? t === 'income' ? 'bg-success text-white shadow' : t === 'expense' ? 'bg-danger text-white shadow' : 'bg-primary text-white shadow'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors',
              showFilters || activeFiltersCount > 0
                ? 'bg-primary/15 border-primary text-primary'
                : 'border-border text-muted hover:text-foreground bg-background',
            )}
          >
            {Icons.filter(14)}
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-muted hover:text-danger underline transition-colors px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilters && (
          <div className="pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-down">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1 uppercase tracking-wider">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.name} value={c.name}>{CAT_EMOJI[c.name] || '📂'} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Account Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1 uppercase tracking-wider">Account</label>
              <select
                value={selectedAccount}
                onChange={e => setSelectedAccount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Accounts</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.name}>{a.emoji} {a.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1 uppercase tracking-wider">Date Period</label>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Time</option>
                <option value="this_month">This Month (Oct 2026)</option>
                <option value="last_30">Last 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1 uppercase tracking-wider">Sort Order</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>

            {/* Custom Dates if selected */}
            {dateRange === 'custom' && (
              <div className="sm:col-span-2 grid grid-cols-2 gap-2 p-2 bg-background/50 rounded-xl border border-border/40">
                <div>
                  <label className="block text-[10px] text-muted mb-1">From Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted mb-1">To Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Min & Max Amount */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-muted mb-1">Min Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted mb-1">Max Amount ($)</label>
                <input
                  type="number"
                  placeholder="1000.00"
                  value={maxAmount}
                  onChange={e => setMaxAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/30">
            <span className="text-[11px] text-muted mr-1">Active:</span>
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/15 text-primary border border-primary/20">
                Type: {filterType}
                <button onClick={() => setFilterType('all')} className="hover:text-foreground">{Icons.x(12)}</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/15 text-primary border border-primary/20">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-foreground">{Icons.x(12)}</button>
              </span>
            )}
            {selectedAccount !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/15 text-primary border border-primary/20">
                {selectedAccount}
                <button onClick={() => setSelectedAccount('all')} className="hover:text-foreground">{Icons.x(12)}</button>
              </span>
            )}
            {dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/15 text-primary border border-primary/20">
                Date: {dateRange.replace('_', ' ')}
                <button onClick={() => setDateRange('all')} className="hover:text-foreground">{Icons.x(12)}</button>
              </span>
            )}
            {(minAmount || maxAmount) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/15 text-primary border border-primary/20">
                ${minAmount || '0'} – ${maxAmount || '∞'}
                <button onClick={() => { setMinAmount(''); setMaxAmount(''); }} className="hover:text-foreground">{Icons.x(12)}</button>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Transactions List */}
      <Card className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-border/40 mx-auto flex items-center justify-center text-muted">
              {Icons.filter(24)}
            </div>
            <h3 className="text-base font-bold text-foreground">No transactions found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              No transactions match your current search and filter criteria. Try clearing or relaxing some filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-surface-hover/50 transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shrink-0"
                    style={{ backgroundColor: (categories.find(c => c.name === tx.category)?.color || '#6366f1') + '18' }}
                  >
                    {CAT_EMOJI[tx.category] || '📂'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{tx.payee}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted">{tx.category}</span>
                      <span className="text-muted/40">•</span>
                      <span className="text-[11px] text-muted">{tx.account}</span>
                      {tx.notes && (
                        <>
                          <span className="text-muted/40">•</span>
                          <span className="text-[11px] text-muted/70 italic max-w-[140px] truncate">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn('text-sm font-extrabold', tx.amount > 0 ? 'text-success' : 'text-foreground')}>
                      {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount)}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">{tx.date}</p>
                  </div>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    title="Delete transaction"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
                  >
                    {Icons.trash(14)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Budgets with Interactive Budget Setter
   ═══════════════════════════════════════════════════════════ */
function BudgetsPage() {
  const { categories } = useFinance();
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<string | undefined>(undefined);

  const cats = useMemo(() => categories.filter(c => !c.isIncome && c.budget > 0), [categories]);
  const totalBudget = useMemo(() => cats.reduce((s, c) => s + c.budget, 0), [cats]);
  const totalSpent = useMemo(() => cats.reduce((s, c) => s + c.spent, 0), [cats]);
  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const openBudgetEditor = (categoryName?: string) => {
    setSelectedCatForEdit(categoryName);
    setBudgetModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Budgets</h2>
          <p className="text-sm text-muted mt-1">October 2026 budget allocations and live spending</p>
        </div>
        <button
          onClick={() => openBudgetEditor()}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow"
        >
          {Icons.plus(16)} Set Budget
        </button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Overall Budget (October)</p>
            <p className="text-2xl font-extrabold text-foreground mt-1">
              {formatMoney(totalSpent)} <span className="text-sm text-muted font-normal">of {formatMoney(totalBudget)}</span>
            </p>
          </div>
          <div className={cn('text-3xl font-extrabold', pct >= 100 ? 'text-danger' : pct >= 80 ? 'text-warning' : 'text-success')}>{pct}%</div>
        </div>
        <ProgressBar value={totalSpent} max={totalBudget} h="h-3" />
        <p className="text-xs text-muted mt-2">
          {formatMoney(totalBudget - totalSpent)} remaining · {Math.max(0, Math.round((1 - new Date().getDate() / 31) * 100))}% of month left
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cats.map(cat => {
          const p = cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0;
          return (
            <Card key={cat.name} hover className="group relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: cat.color + '18' }}>
                    {CAT_EMOJI[cat.name] || '📂'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{cat.name}</p>
                    <p className="text-[10px] text-muted font-medium">{formatMoney(cat.spent)} of {formatMoney(cat.budget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full',
                    p >= 100 ? 'bg-danger/15 text-danger' : p >= 80 ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success')}>
                    {p}%
                  </span>
                  <button
                    onClick={() => openBudgetEditor(cat.name)}
                    title={`Edit ${cat.name} budget`}
                    className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                  >
                    {Icons.edit(14)}
                  </button>
                </div>
              </div>
              <ProgressBar value={cat.spent} max={cat.budget} color={cat.color} />
              <div className="flex items-center justify-between text-[10px] text-muted mt-2 font-medium">
                <span>{cat.budget > cat.spent ? `${formatMoney(cat.budget - cat.spent)} left` : `${formatMoney(cat.spent - cat.budget)} over budget`}</span>
                <button
                  onClick={() => openBudgetEditor(cat.name)}
                  className="text-primary hover:underline"
                >
                  Edit budget
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <SetBudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        selectedCategory={selectedCatForEdit}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Goals with Interactive New Goal Modal & Funds Add
   ═══════════════════════════════════════════════════════════ */
function GoalsPage() {
  const { goals, deleteGoal, addFundsToGoal } = useFinance();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [fundsPromptGoalId, setFundsPromptGoalId] = useState<string | null>(null);
  const [customFundsAmount, setCustomFundsAmount] = useState('100');

  const handleDeposit = (id: string, amountDollars: number) => {
    addFundsToGoal(id, Math.round(amountDollars * 100));
    setFundsPromptGoalId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Savings Goals</h2>
          <p className="text-sm text-muted mt-1">Track and fund your long-term financial targets</p>
        </div>
        <button
          onClick={() => setGoalModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow"
        >
          {Icons.plus(16)} New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-border/40 mx-auto flex items-center justify-center text-muted">
            {Icons.target(24)}
          </div>
          <h3 className="text-base font-bold text-foreground">No goals created yet</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Set up a new savings target like an emergency fund, vacation, or down payment.
          </p>
          <button
            onClick={() => setGoalModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow"
          >
            {Icons.plus(14)} Create First Goal
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => {
            const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
            const days = daysUntil(g.deadline);
            const months = Math.max(Math.ceil(days / 30), 1);
            const monthly = Math.max(0, Math.round((g.target - g.current) / months));
            const isCompleted = g.current >= g.target;

            return (
              <Card key={g.id} hover className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: g.color + '18' }}>
                    {Icons.target(20)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isCompleted ? 'success' : pct >= 70 ? 'warning' : 'default'}>
                      {isCompleted ? 'Completed 🎉' : `${pct}%`}
                    </Badge>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      title="Delete goal"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
                    >
                      {Icons.trash(14)}
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-foreground">{g.name}</h3>
                <div className="mt-3 mb-2">
                  <ProgressBar value={g.current} max={g.target} color={g.color} h="h-2.5" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>{formatShort(g.current)}</span><span>{formatShort(g.target)}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Monthly needed</span>
                    <span className="text-foreground font-semibold">{formatMoney(monthly)}/mo</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Target date</span>
                    <span className="text-foreground font-semibold">{g.deadline}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Time remaining</span>
                    <span className="text-foreground font-semibold">{months} months</span>
                  </div>
                </div>

                {/* Quick Add Funds section */}
                <div className="mt-4 pt-3 border-t border-border/30">
                  {fundsPromptGoalId === g.id ? (
                    <div className="space-y-2 animate-slide-down">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">$</span>
                        <input
                          type="number"
                          value={customFundsAmount}
                          onChange={e => setCustomFundsAmount(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground font-semibold"
                        />
                        <button
                          onClick={() => handleDeposit(g.id, parseFloat(customFundsAmount) || 0)}
                          className="px-2.5 py-1 rounded-lg bg-success text-white text-xs font-bold shadow"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setFundsPromptGoalId(null)}
                          className="text-muted hover:text-foreground text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDeposit(g.id, 50)}
                          className="px-2 py-1 rounded-lg bg-surface-hover text-[11px] font-semibold text-muted hover:text-foreground hover:bg-border/60 transition-colors"
                        >
                          +$50
                        </button>
                        <button
                          onClick={() => handleDeposit(g.id, 100)}
                          className="px-2 py-1 rounded-lg bg-surface-hover text-[11px] font-semibold text-muted hover:text-foreground hover:bg-border/60 transition-colors"
                        >
                          +$100
                        </button>
                      </div>
                      <button
                        onClick={() => setFundsPromptGoalId(g.id)}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        + Add Custom
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <NewGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE: Settings
   ═══════════════════════════════════════════════════════════ */
function SettingsPage() {
  const { resetAllData, isCloudConnected, syncStatus, syncWithSupabase } = useFinance();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => localStorage.getItem('hl_supabase_url') || (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('YOUR-PROJECT') ? import.meta.env.VITE_SUPABASE_URL : ''));
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => localStorage.getItem('hl_supabase_anon') || (import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY') ? import.meta.env.VITE_SUPABASE_ANON_KEY : ''));
  const [saveCloudSuccess, setSaveCloudSuccess] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setSaveCloudSuccess('Please enter both Supabase URL and Anon Key');
      return;
    }
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setSaveCloudSuccess('Saved! Reconnecting to Supabase…');
    await syncWithSupabase();
    setTimeout(() => setSaveCloudSuccess(''), 4000);
  };

  const handleCopySql = () => {
    const sqlText = `-- HomeLedger Database Schema
create table if not exists public.accounts (id text primary key, name text not null, type text not null default 'checking', balance bigint not null default 0, emoji text default '💳', color text default '#6366f1', created_at timestamptz not null default now());
create table if not exists public.categories (name text primary key, color text not null default '#6366f1', budget bigint not null default 0, spent bigint not null default 0, is_income boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.transactions (id text primary key, date text not null, payee text not null, amount bigint not null, category text not null, account text not null, type text not null check (type in ('income', 'expense')), notes text, created_at timestamptz not null default now());
create table if not exists public.goals (id text primary key, name text not null, target bigint not null default 0, current bigint not null default 0, deadline text not null, color text not null default '#6366f1', created_at timestamptz not null default now());
create table if not exists public.bills (id text primary key, name text not null, amount bigint not null default 0, due_date text not null, category text not null, is_paid boolean not null default false, created_at timestamptz not null default now());
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.bills enable row level security;
create policy "Allow all access to accounts" on public.accounts for all to anon, authenticated using (true) with check (true);
create policy "Allow all access to categories" on public.categories for all to anon, authenticated using (true) with check (true);
create policy "Allow all access to transactions" on public.transactions for all to anon, authenticated using (true) with check (true);
create policy "Allow all access to goals" on public.goals for all to anon, authenticated using (true) with check (true);
create policy "Allow all access to bills" on public.bills for all to anon, authenticated using (true) with check (true);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all transaction, budget, and goal data to default demo state?')) {
      resetAllData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">Settings & Cloud Hosting</h2>
        <p className="text-sm text-muted mt-1">Manage Supabase cloud database sync and Vercel deployment</p>
      </div>

      {/* Supabase Cloud Connection Panel */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', isCloudConnected ? 'bg-success animate-pulse' : 'bg-warning')} />
              <h3 className="text-base font-bold text-foreground">Supabase Cloud Database</h3>
            </div>
            <p className="text-xs text-muted mt-1">
              Store all transactions, budgets, goals, and accounts in your Supabase PostgreSQL cloud database.
            </p>
          </div>
          <div className="text-right">
            <Badge variant={isCloudConnected ? 'success' : 'warning'}>
              {isCloudConnected ? 'Cloud Synced' : 'Local Storage Mode'}
            </Badge>
            <p className="text-[10px] text-muted mt-1">{syncStatus}</p>
          </div>
        </div>

        {saveCloudSuccess && (
          <div className="mb-4 text-xs text-success bg-success/15 px-3 py-2 rounded-lg font-medium">
            {saveCloudSuccess}
          </div>
        )}

        <form onSubmit={handleSaveCloud} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1 uppercase tracking-wider">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrlInput}
              onChange={e => setSupabaseUrlInput(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted mb-1 uppercase tracking-wider">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKeyInput}
              onChange={e => setSupabaseKeyInput(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow"
            >
              Connect & Save Supabase Credentials
            </button>
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              {copiedSql ? '✓ SQL Copied to Clipboard!' : 'Copy Supabase SQL Setup'}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted space-y-1">
          <p className="font-semibold text-foreground">How to setup Supabase:</p>
          <p>1. Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">supabase.com</a> and create a free project.</p>
          <p>2. In the Supabase dashboard, click <strong>SQL Editor</strong>, paste the copied SQL setup (or the contents of <code className="text-foreground font-mono">supabase_setup.sql</code>), and click <strong>Run</strong>.</p>
          <p>3. Go to <strong>Project Settings &gt; API</strong> and copy your Project URL and anon key into the fields above or into <code className="text-foreground font-mono">.env</code>.</p>
        </div>
      </Card>

      {/* Vercel Hosting Instructions */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">Host on Vercel</h3>
          <Badge>Vercel Ready</Badge>
        </div>
        <p className="text-xs text-muted mb-3">
          This project is already pre-configured with <code className="text-foreground font-mono">vercel.json</code> for seamless Single Page App routing and Vite production builds.
        </p>

        <div className="space-y-2.5 text-xs text-muted">
          <div className="p-3 rounded-xl bg-background border border-border/40 space-y-1.5">
            <p className="font-semibold text-foreground">Option 1: Deploy with Git & Vercel Dashboard (Recommended)</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>Push your project code to a GitHub repository.</li>
              <li>Visit <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-primary hover:underline">vercel.com/new</a> and import the repository.</li>
              <li>Under <strong>Environment Variables</strong>, add:
                <ul className="list-disc list-inside ml-4 mt-0.5 space-y-0.5 font-mono text-[10px] text-foreground">
                  <li>VITE_SUPABASE_URL = your Supabase URL</li>
                  <li>VITE_SUPABASE_ANON_KEY = your Supabase anon key</li>
                </ul>
              </li>
              <li>Click <strong>Deploy</strong>. Vercel will build and deploy your app in ~30 seconds!</li>
            </ol>
          </div>

          <div className="p-3 rounded-xl bg-background border border-border/40 space-y-1.5">
            <p className="font-semibold text-foreground">Option 2: Deploy from Terminal via Vercel CLI</p>
            <p className="text-[11px]">Run the following command in this workspace:</p>
            <pre className="p-2 rounded-lg bg-surface font-mono text-[11px] text-foreground border border-border">npx vercel</pre>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h3 className="text-sm font-bold text-foreground mb-2">Data Reset & Troubleshooting</h3>
        <p className="text-xs text-muted mb-3">
          Reset all transaction, budget, and goal data to default demo state if needed.
        </p>
        {resetSuccess && (
          <div className="mb-3 text-xs text-success bg-success/15 px-3 py-2 rounded-lg font-medium">
            Demo data has been restored!
          </div>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-danger/40 text-danger hover:bg-danger/10 text-xs font-semibold transition-colors"
        >
          {Icons.refresh(14)} Reset to Sample Data
        </button>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Sidebar State Hook
   ───────────────────────────────────────────────────────── */
const LS_KEY = 'sidebar-open';

function useSidebarState() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (window.innerWidth < 1024) return false;
    const saved = localStorage.getItem(LS_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      localStorage.setItem(LS_KEY, String(next));
      return next;
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      localStorage.setItem(LS_KEY, 'false');
    }
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      localStorage.setItem(LS_KEY, 'true');
    }
  }, []);

  return { isOpen, toggle, close, open };
}

/* ─────────────────────────────────────────────────────────
   Hotkeys Hook
   ───────────────────────────────────────────────────────── */
function useHotkeys(actions: {
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  toggleSidebar: () => void;
  quickAddOpen: boolean;
}) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    function isTyping(e: KeyboardEvent): boolean {
      const t = e.target as HTMLElement;
      if (!t) return false;
      return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable;
    }

    function handler(e: KeyboardEvent) {
      const { openQuickAdd, closeQuickAdd, toggleSidebar, quickAddOpen } = actionsRef.current;

      if (e.key === 'Escape' && quickAddOpen) {
        e.preventDefault();
        closeQuickAdd();
        return;
      }

      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        openQuickAdd();
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

/* ═══════════════════════════════════════════════════════════
   Root App
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const sidebar = useSidebarState();
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const openQuickAdd = useCallback(() => setQuickAddOpen(true), []);
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), []);

  useHotkeys({
    openQuickAdd,
    closeQuickAdd,
    toggleSidebar: sidebar.toggle,
    quickAddOpen,
  });

  const handleSidebarClose = useCallback(() => {
    sidebar.close();
    requestAnimationFrame(() => hamburgerRef.current?.focus());
  }, [sidebar]);

  return (
    <FinanceProvider>
      <Router>
        <div className="min-h-screen flex">
          <Sidebar
            onQuickAdd={openQuickAdd}
            isOpen={sidebar.isOpen}
            onClose={handleSidebarClose}
          />
          <div
            className={cn(
              'flex-1 flex flex-col pb-16 lg:pb-0 sidebar-content-transition',
              sidebar.isOpen ? 'lg:ml-64' : 'lg:ml-0',
            )}
          >
            <TopBar
              onQuickAdd={openQuickAdd}
              sidebarOpen={sidebar.isOpen}
              onToggleSidebar={sidebar.open}
            />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
          <MobileNav onQuickAdd={openQuickAdd} />
          <QuickAddModal open={quickAddOpen} onClose={closeQuickAdd} />
        </div>
      </Router>
    </FinanceProvider>
  );
}
