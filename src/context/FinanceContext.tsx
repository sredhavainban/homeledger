import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isConfigured } from '../lib/supabase';

export type Account = {
  id: string;
  name: string;
  type: string;
  balance: number; // in cents
  emoji: string;
  color: string;
};

export type Category = {
  name: string;
  color: string;
  budget: number; // in cents
  spent: number;  // in cents
  isIncome?: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  payee: string;
  amount: number; // in cents, negative for expense, positive for income
  category: string;
  account: string;
  type: 'income' | 'expense';
  notes?: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number; // in cents
  current: number; // in cents
  deadline: string;
  color: string;
};

export type Bill = {
  id: string;
  name: string;
  amount: number; // in cents
  dueDate: string;
  category: string;
  isPaid: boolean;
};

export const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Main Checking', type: 'checking', balance: 1284350, emoji: '💳', color: '#6366f1' },
  { id: '2', name: 'Savings', type: 'savings', balance: 4520000, emoji: '🏦', color: '#22c55e' },
  { id: '3', name: 'Credit Card', type: 'credit_card', balance: -185420, emoji: '💳', color: '#ef4444' },
  { id: '4', name: 'Investment', type: 'investment', balance: 12750000, emoji: '📈', color: '#f59e0b' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { name: 'Housing', color: '#6366f1', budget: 200000, spent: 175000 },
  { name: 'Groceries', color: '#22c55e', budget: 60000, spent: 52340 },
  { name: 'Transport', color: '#f59e0b', budget: 40000, spent: 38200 },
  { name: 'Utilities', color: '#06b6d4', budget: 25000, spent: 21800 },
  { name: 'Dining', color: '#ec4899', budget: 30000, spent: 27650 },
  { name: 'Entertainment', color: '#8b5cf6', budget: 20000, spent: 14500 },
  { name: 'Healthcare', color: '#ef4444', budget: 15000, spent: 8200 },
  { name: 'Education', color: '#14b8a6', budget: 10000, spent: 9500 },
  { name: 'Fitness', color: '#f97316', budget: 8000, spent: 7500 },
  { name: 'Travel', color: '#a855f7', budget: 25000, spent: 0 },
  { name: 'Gifts', color: '#e879f9', budget: 10000, spent: 4200 },
  { name: 'Salary', color: '#22c55e', budget: 0, spent: 0, isIncome: true },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-10-16', payee: 'Whole Foods Market', amount: -8540, category: 'Groceries', account: 'Main Checking', type: 'expense' },
  { id: '2', date: '2026-10-16', payee: 'Uber', amount: -1250, category: 'Transport', account: 'Main Checking', type: 'expense' },
  { id: '3', date: '2026-10-15', payee: 'Netflix', amount: -1599, category: 'Entertainment', account: 'Credit Card', type: 'expense' },
  { id: '4', date: '2026-10-15', payee: 'Employer Inc.', amount: 650000, category: 'Salary', account: 'Main Checking', type: 'income' },
  { id: '5', date: '2026-10-14', payee: 'Electric Company', amount: -12450, category: 'Utilities', account: 'Main Checking', type: 'expense' },
  { id: '6', date: '2026-10-14', payee: 'Chipotle', amount: -1480, category: 'Dining', account: 'Credit Card', type: 'expense' },
  { id: '7', date: '2026-10-13', payee: 'Planet Fitness', amount: -2500, category: 'Fitness', account: 'Main Checking', type: 'expense' },
  { id: '8', date: '2026-10-13', payee: 'Amazon', amount: -4299, category: 'Groceries', account: 'Credit Card', type: 'expense' },
  { id: '9', date: '2026-10-12', payee: 'Rent Payment', amount: -175000, category: 'Housing', account: 'Main Checking', type: 'expense' },
  { id: '10', date: '2026-10-12', payee: 'Freelance Project', amount: 120000, category: 'Salary', account: 'Main Checking', type: 'income' },
  { id: '11', date: '2026-10-11', payee: 'Gas Station', amount: -4520, category: 'Transport', account: 'Main Checking', type: 'expense' },
  { id: '12', date: '2026-10-11', payee: 'Pharmacy', amount: -3200, category: 'Healthcare', account: 'Credit Card', type: 'expense' },
  { id: '13', date: '2026-10-10', payee: 'Starbucks', amount: -650, category: 'Dining', account: 'Credit Card', type: 'expense' },
  { id: '14', date: '2026-10-10', payee: 'Online Course', amount: -9500, category: 'Education', account: 'Main Checking', type: 'expense' },
  { id: '15', date: '2026-10-09', payee: 'Target', amount: -6780, category: 'Groceries', account: 'Main Checking', type: 'expense' },
];

export const INITIAL_GOALS: Goal[] = [
  { id: '1', name: 'Emergency Fund', target: 10000000, current: 4520000, deadline: '2027-06-01', color: '#6366f1' },
  { id: '2', name: 'Vacation Fund', target: 3000000, current: 1200000, deadline: '2027-03-01', color: '#ec4899' },
  { id: '3', name: 'New Car', target: 25000000, current: 8500000, deadline: '2028-01-01', color: '#f59e0b' },
];

export const INITIAL_BILLS: Bill[] = [
  { id: '1', name: 'Rent', amount: 175000, dueDate: '2026-11-01', category: 'Housing', isPaid: false },
  { id: '2', name: 'Internet', amount: 7999, dueDate: '2026-10-22', category: 'Utilities', isPaid: false },
  { id: '3', name: 'Phone', amount: 8500, dueDate: '2026-10-25', category: 'Utilities', isPaid: false },
  { id: '4', name: 'Car Insurance', amount: 15000, dueDate: '2026-11-05', category: 'Transport', isPaid: false },
  { id: '5', name: 'Gym', amount: 2500, dueDate: '2026-11-01', category: 'Fitness', isPaid: true },
];

interface FinanceContextType {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  upcomingBills: Bill[];
  isCloudConnected: boolean;
  syncStatus: string;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  addFundsToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setBudget: (categoryName: string, newBudgetCents: number) => Promise<void>;
  updateAllBudgets: (budgets: Record<string, number>) => Promise<void>;
  addCategory: (category: { name: string; color: string; budget: number }) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
  resetAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => loadStorage('hl_accounts', INITIAL_ACCOUNTS));
  const [categories, setCategories] = useState<Category[]>(() => loadStorage('hl_categories', INITIAL_CATEGORIES));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStorage('hl_transactions', INITIAL_TRANSACTIONS));
  const [goals, setGoals] = useState<Goal[]>(() => loadStorage('hl_goals', INITIAL_GOALS));
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>(() => loadStorage('hl_bills', INITIAL_BILLS));

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isConfigured);
  const [syncStatus, setSyncStatus] = useState<string>(isConfigured ? 'Connecting to Supabase…' : 'Local Storage Mode');

  // Keep localStorage updated as cache/fallback
  useEffect(() => { localStorage.setItem('hl_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('hl_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('hl_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('hl_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('hl_bills', JSON.stringify(upcomingBills)); }, [upcomingBills]);

  // Sync from Supabase on start if configured
  const syncWithSupabase = useCallback(async () => {
    if (!isConfigured) {
      setSyncStatus('Local Storage Mode');
      setIsCloudConnected(false);
      return;
    }

    try {
      setSyncStatus('Syncing with Supabase…');

      // Fetch accounts
      const { data: accData, error: accErr } = await supabase.from('accounts').select('*');
      if (!accErr && accData && accData.length > 0) {
        setAccounts(accData.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          balance: Number(a.balance),
          emoji: a.emoji || '💳',
          color: a.color || '#6366f1',
        })));
      }

      // Fetch categories
      const { data: catData, error: catErr } = await supabase.from('categories').select('*');
      if (!catErr && catData && catData.length > 0) {
        setCategories(catData.map(c => ({
          name: c.name,
          color: c.color,
          budget: Number(c.budget),
          spent: Number(c.spent),
          isIncome: Boolean(c.is_income),
        })));
      }

      // Fetch transactions
      const { data: txData, error: txErr } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (!txErr && txData && txData.length > 0) {
        setTransactions(txData.map(t => ({
          id: t.id,
          date: t.date,
          payee: t.payee,
          amount: Number(t.amount),
          category: t.category,
          account: t.account,
          type: t.type,
          notes: t.notes || '',
        })));
      }

      // Fetch goals
      const { data: goalData, error: goalErr } = await supabase.from('goals').select('*');
      if (!goalErr && goalData && goalData.length > 0) {
        setGoals(goalData.map(g => ({
          id: g.id,
          name: g.name,
          target: Number(g.target),
          current: Number(g.current),
          deadline: g.deadline,
          color: g.color || '#6366f1',
        })));
      }

      setIsCloudConnected(true);
      setSyncStatus('Connected to Supabase Cloud');
    } catch {
      setIsCloudConnected(false);
      setSyncStatus('Supabase Sync Paused (Using Local Storage)');
    }
  }, []);

  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Add Transaction
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTx, ...prev]);

    // Local account update
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.name === tx.account) {
          const nextBal = acc.balance + tx.amount;
          if (isConfigured) {
            supabase.from('accounts').update({ balance: nextBal }).eq('name', acc.name).then();
          }
          return { ...acc, balance: nextBal };
        }
        return acc;
      })
    );

    // Local category spent update
    if (tx.type === 'expense') {
      const expAmount = Math.abs(tx.amount);
      setCategories(prev =>
        prev.map(cat => {
          if (cat.name === tx.category) {
            const nextSpent = cat.spent + expAmount;
            if (isConfigured) {
              supabase.from('categories').update({ spent: nextSpent }).eq('name', cat.name).then();
            }
            return { ...cat, spent: nextSpent };
          }
          return cat;
        })
      );
    }

    // Supabase push
    if (isConfigured) {
      try {
        await supabase.from('transactions').insert({
          id: newTx.id,
          date: newTx.date,
          payee: newTx.payee,
          amount: newTx.amount,
          category: newTx.category,
          account: newTx.account,
          type: newTx.type,
          notes: newTx.notes || '',
        });
      } catch {
        // Fallback already saved locally
      }
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Revert account balance
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.name === tx.account) {
          const nextBal = acc.balance - tx.amount;
          if (isConfigured) {
            supabase.from('accounts').update({ balance: nextBal }).eq('name', acc.name).then();
          }
          return { ...acc, balance: nextBal };
        }
        return acc;
      })
    );

    // Revert category spent
    if (tx.type === 'expense') {
      const expAmount = Math.abs(tx.amount);
      setCategories(prev =>
        prev.map(cat => {
          if (cat.name === tx.category) {
            const nextSpent = Math.max(0, cat.spent - expAmount);
            if (isConfigured) {
              supabase.from('categories').update({ spent: nextSpent }).eq('name', cat.name).then();
            }
            return { ...cat, spent: nextSpent };
          }
          return cat;
        })
      );
    }

    if (isConfigured) {
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch {
        // Fallback saved locally
      }
    }
  };

  // Add Goal
  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals(prev => [...prev, newGoal]);

    if (isConfigured) {
      try {
        await supabase.from('goals').insert(newGoal);
      } catch {
        // Handled locally
      }
    }
  };

  // Update Goal
  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));

    if (isConfigured) {
      try {
        await supabase.from('goals').update(updates).eq('id', id);
      } catch {
        // Handled locally
      }
    }
  };

  // Add Funds To Goal
  const addFundsToGoal = async (id: string, amount: number) => {
    let nextCurrent = 0;
    setGoals(prev =>
      prev.map(g => {
        if (g.id === id) {
          nextCurrent = Math.min(g.target, g.current + amount);
          return { ...g, current: nextCurrent };
        }
        return g;
      })
    );

    if (isConfigured) {
      try {
        await supabase.from('goals').update({ current: nextCurrent }).eq('id', id);
      } catch {
        // Handled locally
      }
    }
  };

  // Delete Goal
  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));

    if (isConfigured) {
      try {
        await supabase.from('goals').delete().eq('id', id);
      } catch {
        // Handled locally
      }
    }
  };

  // Set Budget
  const setBudget = async (categoryName: string, newBudgetCents: number) => {
    setCategories(prev =>
      prev.map(cat => (cat.name === categoryName ? { ...cat, budget: newBudgetCents } : cat))
    );

    if (isConfigured) {
      try {
        await supabase.from('categories').update({ budget: newBudgetCents }).eq('name', categoryName);
      } catch {
        // Handled locally
      }
    }
  };

  // Update All Budgets
  const updateAllBudgets = async (budgets: Record<string, number>) => {
    setCategories(prev =>
      prev.map(cat => (budgets[cat.name] !== undefined ? { ...cat, budget: budgets[cat.name] } : cat))
    );

    if (isConfigured) {
      try {
        await Promise.all(
          Object.entries(budgets).map(([name, budget]) =>
            supabase.from('categories').update({ budget }).eq('name', name)
          )
        );
      } catch {
        // Handled locally
      }
    }
  };

  // Add Category
  const addCategory = async (category: { name: string; color: string; budget: number }) => {
    const newCat: Category = {
      name: category.name,
      color: category.color,
      budget: category.budget,
      spent: 0,
      isIncome: false,
    };
    setCategories(prev => [...prev, newCat]);

    if (isConfigured) {
      try {
        await supabase.from('categories').insert({
          name: newCat.name,
          color: newCat.color,
          budget: newCat.budget,
          spent: 0,
          is_income: false,
        });
      } catch {
        // Handled locally
      }
    }
  };

  const resetAllData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setGoals(INITIAL_GOALS);
    setUpcomingBills(INITIAL_BILLS);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        goals,
        upcomingBills,
        isCloudConnected,
        syncStatus,
        addTransaction,
        deleteTransaction,
        addGoal,
        updateGoal,
        addFundsToGoal,
        deleteGoal,
        setBudget,
        updateAllBudgets,
        addCategory,
        syncWithSupabase,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
