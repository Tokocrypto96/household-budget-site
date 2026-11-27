/* HomeBudget — categories and starter data. One job: what a household budget contains. */
'use strict';

/** Expense categories with a display colour. Income uses its own list. */
var CATEGORIES = [
  { id: 'housing',      name: 'Housing',      color: '#14684d' },
  { id: 'groceries',    name: 'Groceries',    color: '#2f9e6e' },
  { id: 'utilities',    name: 'Utilities',    color: '#0e7490' },
  { id: 'transport',    name: 'Transport',    color: '#1d4ed8' },
  { id: 'dining',       name: 'Dining out',   color: '#b45309' },
  { id: 'kids',         name: 'Kids & school', color: '#7c3aed' },
  { id: 'health',       name: 'Health',       color: '#be185d' },
  { id: 'entertainment', name: 'Entertainment', color: '#a16207' },
  { id: 'shopping',     name: 'Shopping',     color: '#475569' },
  { id: 'other',        name: 'Other',        color: '#94a3b8' }
];

var INCOME_SOURCES = [
  { id: 'salary',    name: 'Salary' },
  { id: 'freelance', name: 'Freelance' },
  { id: 'other-income', name: 'Other income' }
];

/** Monthly budget targets in cents, keyed by category id. */
var SEED_BUDGETS = {
  housing: 150000,
  groceries: 65000,
  utilities: 22000,
  transport: 28000,
  dining: 18000,
  kids: 25000,
  health: 15000,
  entertainment: 12000,
  shopping: 20000,
  other: 10000
};

/** Savings goals: target and already-saved amounts in cents. */
var SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 600000, saved: 385000, note: '3 months of essential bills, kept in a separate savings account.' },
  { id: 'g2', name: 'Family vacation', target: 180000, saved: 94000, note: 'Beach trip in July — flights, hotel and spending money.' },
  { id: 'g3', name: 'New washing machine', target: 75000, saved: 42000, note: 'The old one leaks. Replace before it floods the laundry room.' }
];

/**
 * Starter transactions for November 2026, in cents. Positive amounts are
 * income, negative are spending. A realistic month for a family of four.
 */
var SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', kind: 'income', category: 'salary', desc: 'Monthly salary — Maya', amount: 485000 },
  { id: 't02', date: '2026-11-01', kind: 'expense', category: 'housing', desc: 'Rent', amount: -145000 },
  { id: 't03', date: '2026-11-02', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -14820 },
  { id: 't04', date: '2026-11-03', kind: 'expense', category: 'transport', desc: 'Bus passes for the month', amount: -9600 },
  { id: 't05', date: '2026-11-04', kind: 'expense', category: 'utilities', desc: 'Electricity bill', amount: -11240 },
  { id: 't06', date: '2026-11-05', kind: 'expense', category: 'kids', desc: 'School lunch money — Leo', amount: -4500 },
  { id: 't07', date: '2026-11-06', kind: 'expense', category: 'dining', desc: 'Pizza night', amount: -3850 },
  { id: 't08', date: '2026-11-07', kind: 'expense', category: 'groceries', desc: 'Farmers market', amount: -6240 },
  { id: 't09', date: '2026-11-08', kind: 'expense', category: 'entertainment', desc: 'Cinema — family movie', amount: -5200 },
  { id: 't10', date: '2026-11-09', kind: 'expense', category: 'health', desc: 'Pharmacy — vitamins', amount: -2890 },
  { id: 't11', date: '2026-11-10', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -13175 },
  { id: 't12', date: '2026-11-11', kind: 'expense', category: 'transport', desc: 'Fuel', amount: -5400 },
  { id: 't13', date: '2026-11-12', kind: 'income', category: 'freelance', desc: 'Weekend design work — Maya', amount: 62000 },
  { id: 't14', date: '2026-11-12', kind: 'expense', category: 'utilities', desc: 'Internet bill', amount: -6500 },
  { id: 't15', date: '2026-11-13', kind: 'expense', category: 'kids', desc: 'New school shoes — Ana', amount: -6800 },
  { id: 't16', date: '2026-11-14', kind: 'expense', category: 'shopping', desc: 'Winter jackets (2)', amount: -12400 },
  { id: 't17', date: '2026-11-15', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -14260 },
  { id: 't18', date: '2026-11-16', kind: 'expense', category: 'dining', desc: 'Lunch with friends', amount: -2740 },
  { id: 't19', date: '2026-11-17', kind: 'expense', category: 'health', desc: 'Dentist check-up — Leo', amount: -9500 },
  { id: 't20', date: '2026-11-18', kind: 'expense', category: 'transport', desc: 'Fuel', amount: -4800 },
  { id: 't21', date: '2026-11-19', kind: 'expense', category: 'entertainment', desc: 'Streaming subscription', amount: -1599 },
  { id: 't22', date: '2026-11-20', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -12790 },
  { id: 't23', date: '2026-11-21', kind: 'expense', category: 'kids', desc: 'Piano lessons — Ana', amount: -12000 },
  { id: 't24', date: '2026-11-22', kind: 'expense', category: 'dining', desc: 'Sunday brunch', amount: -4630 },
  { id: 't25', date: '2026-11-23', kind: 'expense', category: 'other', desc: 'Gift for grandma', amount: -3500 },
  { id: 't26', date: '2026-11-24', kind: 'expense', category: 'utilities', desc: 'Water bill', amount: -4230 },
  { id: 't27', date: '2026-11-25', kind: 'expense', category: 'shopping', desc: 'Household supplies', amount: -5875 },
  { id: 't28', date: '2026-11-26', kind: 'expense', category: 'groceries', desc: 'Thanksgiving groceries', amount: -9840 }
];

/** A few October transactions so the report page can compare two months. */
var SEED_PRIOR_MONTH = [
  { id: 'p01', date: '2026-10-01', kind: 'income', category: 'salary', desc: 'Monthly salary — Maya', amount: 485000 },
  { id: 'p02', date: '2026-10-01', kind: 'expense', category: 'housing', desc: 'Rent', amount: -145000 },
  { id: 'p03', date: '2026-10-05', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -13980 },
  { id: 'p04', date: '2026-10-12', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -15230 },
  { id: 'p05', date: '2026-10-19', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -12840 },
  { id: 'p06', date: '2026-10-26', kind: 'expense', category: 'groceries', desc: 'Weekly shop — GreenMart', amount: -14110 },
  { id: 'p07', date: '2026-10-07', kind: 'expense', category: 'utilities', desc: 'Electricity + internet', amount: -17800 },
  { id: 'p08', date: '2026-10-10', kind: 'expense', category: 'transport', desc: 'Fuel + bus passes', amount: -18700 },
  { id: 'p09', date: '2026-10-15', kind: 'expense', category: 'dining', desc: 'Dining out (month)', amount: -11200 },
  { id: 'p10', date: '2026-10-20', kind: 'expense', category: 'kids', desc: 'School costs', amount: -19800 },
  { id: 'p11', date: '2026-10-22', kind: 'expense', category: 'health', desc: 'Doctor visit', amount: -8600 },
  { id: 'p12', date: '2026-10-25', kind: 'expense', category: 'entertainment', desc: 'Entertainment (month)', amount: -9400 },
  { id: 'p13', date: '2026-10-28', kind: 'expense', category: 'shopping', desc: 'Clothing + supplies', amount: -16400 },
  { id: 'p14', date: '2026-10-30', kind: 'expense', category: 'other', desc: 'Miscellaneous', amount: -5200 }
];

function categoryById(id) {
  for (var i = 0; i < CATEGORIES.length; i++) {
    if (CATEGORIES[i].id === id) return CATEGORIES[i];
  }
  return { id: id, name: id, color: '#94a3b8' };
}

function incomeSourceById(id) {
  for (var i = 0; i < INCOME_SOURCES.length; i++) {
    if (INCOME_SOURCES[i].id === id) return INCOME_SOURCES[i];
  }
  return { id: id, name: id };
}
