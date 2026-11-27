/* HomeBudget — the store. One job: keep the household's data and save it locally. */
'use strict';

var STORE_KEY = 'homebudget-v1';

/** The live state: transactions, budgets, goals, and which month is shown. */
var store = {
  transactions: [],
  budgets: {},
  goals: [],
  month: currentMonthKey()
};

function loadStore() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      var saved = JSON.parse(raw);
      if (saved && Array.isArray(saved.transactions)) {
        store.transactions = saved.transactions;
        store.budgets = saved.budgets || {};
        store.goals = saved.goals || [];
        return true;
      }
    }
  } catch (e) { /* corrupted storage: fall through to seed data */ }
  return false;
}

function saveStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      transactions: store.transactions,
      budgets: store.budgets,
      goals: store.goals
    }));
  } catch (e) { /* storage full or unavailable: the page still works in memory */ }
}

/** Fill the store with the starter month so every page has real figures. */
function seedStore() {
  store.transactions = SEED_TRANSACTIONS.concat(SEED_PRIOR_MONTH);
  store.budgets = {};
  for (var k in SEED_BUDGETS) store.budgets[k] = SEED_BUDGETS[k];
  store.goals = SEED_GOALS.map(function (g) {
    return { id: g.id, name: g.name, target: g.target, saved: g.saved, note: g.note };
  });
  saveStore();
}

function resetToSeed() {
  seedStore();
}

function clearAllData() {
  store.transactions = [];
  store.budgets = {};
  store.goals = [];
  saveStore();
}

/** All transactions of one month, newest first. */
function transactionsForMonth(monthKey) {
  return store.transactions
    .filter(function (t) { return monthKeyOf(t.date) === monthKey; })
    .sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; });
}

/** Income, spending, balance and savings rate for one month, in cents. */
function monthSummary(monthKey) {
  var income = 0, spent = 0;
  store.transactions.forEach(function (t) {
    if (monthKeyOf(t.date) !== monthKey) return;
    if (t.kind === 'income') income += t.amount;
    else spent += -t.amount;
  });
  var balance = income - spent;
  var rate = income > 0 ? Math.round(balance / income * 100) : 0;
  return { income: income, spent: spent, balance: balance, rate: rate };
}

/** Spending per category for one month: [{id, name, color, spent, budget}]. */
function spendingByCategory(monthKey) {
  var map = {};
  CATEGORIES.forEach(function (c) {
    map[c.id] = { id: c.id, name: c.name, color: c.color, spent: 0, budget: store.budgets[c.id] || 0 };
  });
  store.transactions.forEach(function (t) {
    if (t.kind !== 'expense' || monthKeyOf(t.date) !== monthKey) return;
    if (!map[t.category]) map[t.category] = { id: t.category, name: t.category, color: '#94a3b8', spent: 0, budget: 0 };
    map[t.category].spent += -t.amount;
  });
  return CATEGORIES.map(function (c) { return map[c.id]; })
    .concat(Object.keys(map).filter(function (id) {
      return !CATEGORIES.some(function (c) { return c.id === id; });
    }).map(function (id) { return map[id]; }));
}

/** Every month present in the data, newest first. */
function availableMonths() {
  var seen = {};
  store.transactions.forEach(function (t) { seen[monthKeyOf(t.date)] = true; });
  seen[store.month] = true;
  return Object.keys(seen).sort().reverse();
}

function addTransaction(tx) {
  tx.id = 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  store.transactions.push(tx);
  saveStore();
  return tx;
}

function deleteTransaction(id) {
  store.transactions = store.transactions.filter(function (t) { return t.id !== id; });
  saveStore();
}

function setBudget(categoryId, cents) {
  store.budgets[categoryId] = cents;
  saveStore();
}

function addToGoal(goalId, cents) {
  for (var i = 0; i < store.goals.length; i++) {
    if (store.goals[i].id === goalId) {
      store.goals[i].saved += cents;
      if (store.goals[i].saved < 0) store.goals[i].saved = 0;
      saveStore();
      return store.goals[i];
    }
  }
  return null;
}

function addGoal(name, targetCents, note) {
  var goal = {
    id: 'g' + Date.now().toString(36),
    name: name, target: targetCents, saved: 0, note: note || ''
  };
  store.goals.push(goal);
  saveStore();
  return goal;
}

/** Export everything as a JSON string the user can download. */
function exportData() {
  return JSON.stringify({
    app: 'HomeBudget',
    version: 1,
    exported: todayIso(),
    transactions: store.transactions,
    budgets: store.budgets,
    goals: store.goals
  }, null, 2);
}

/** Replace the store from an exported JSON string. Returns an error message or ''. */
function importData(text) {
  try {
    var data = JSON.parse(text);
    if (!data || !Array.isArray(data.transactions)) return 'That file does not look like a HomeBudget export.';
    store.transactions = data.transactions;
    store.budgets = data.budgets || {};
    store.goals = data.goals || [];
    saveStore();
    return '';
  } catch (e) {
    return 'Could not read that file: it is not valid JSON.';
  }
}

// Boot: load saved data, or seed the starter month on first visit.
if (!loadStore()) seedStore();
