/* HomeBudget — views. One job: turn the store's data into each page's HTML. */
'use strict';

/* ---------- shared bits ---------- */

function categoryOptions(selectedId) {
  return CATEGORIES.map(function (c) {
    return '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + '>' + esc(c.name) + '</option>';
  }).join('');
}

function incomeOptions(selectedId) {
  return INCOME_SOURCES.map(function (s) {
    return '<option value="' + s.id + '"' + (s.id === selectedId ? ' selected' : '') + '>' + esc(s.name) + '</option>';
  }).join('');
}

function budgetPill(spent, budget) {
  if (!budget) return '<span class="pill muted">no budget set</span>';
  var pct = Math.round(spent / budget * 100);
  if (spent > budget) return '<span class="pill over">' + pct + '% — over by ' + fmtMoney(spent - budget) + '</span>';
  if (pct >= 85) return '<span class="pill warn">' + pct + '% used</span>';
  return '<span class="pill">' + pct + '% used</span>';
}

function transactionRows(list) {
  if (!list.length) return '<p class="empty">No transactions in this month yet. Add one above.</p>';
  var rows = list.map(function (t) {
    var cat = t.kind === 'income' ? incomeSourceById(t.category) : categoryById(t.category);
    var dot = t.kind === 'income'
      ? '<span class="cat-dot" style="background:#1a7f5e"></span>'
      : '<span class="cat-dot" style="background:' + cat.color + '"></span>';
    var amount = t.kind === 'income'
      ? '<span class="money-in">+' + fmtMoney(t.amount) + '</span>'
      : '<span class="money-out">&minus;' + fmtMoney(-t.amount) + '</span>';
    return '<tr><td>' + fmtDate(t.date) + '</td><td>' + esc(t.desc) + '</td><td>' + dot + esc(cat.name) + '</td>' +
      '<td class="num">' + amount + '</td>' +
      '<td class="num row-actions"><button class="btn danger small" data-action="delete-tx" data-id="' + t.id + '">Delete</button></td></tr>';
  }).join('');
  return '<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th class="num"> </th></tr></thead><tbody>' + rows + '</tbody></table>';
}

/* ---------- Dashboard ---------- */

function viewDashboard() {
  var m = store.month;
  var s = monthSummary(m);
  var cats = spendingByCategory(m).filter(function (c) { return c.spent > 0; })
    .sort(function (a, b) { return b.spent - a.spent; });
  var recent = transactionsForMonth(m).slice(0, 6);
  var over = cats.filter(function (c) { return c.budget && c.spent > c.budget; });
  var top = cats.slice(0, 5);

  var notice = '';
  if (over.length) {
    notice = '<div class="notice bad"><strong>Over budget:</strong> ' +
      over.map(function (c) { return esc(c.name) + ' (' + fmtMoney(c.spent - c.budget) + ' over)'; }).join(', ') +
      '. See <a href="#/budgets">Budgets</a> to adjust or review spending.</div>';
  } else if (s.rate >= 10) {
    notice = '<div class="notice"><strong>Nice work.</strong> You saved ' + s.rate + '% of this month\u2019s income so far — ' + fmtMoney(s.balance) + ' left over.</div>';
  }

  var statClass = s.balance < 0 ? 'stat warn' : 'stat good';
  var bars = top.map(function (c) {
    var pct = c.budget ? Math.min(100, Math.round(c.spent / c.budget * 100)) : 0;
    var cls = c.budget && c.spent > c.budget ? 'over' : (pct >= 85 ? 'warn' : '');
    var right = c.budget ? fmtMoney(c.spent) + ' of ' + fmtMoney(c.budget) : fmtMoney(c.spent);
    return '<div class="bar-row' + (cls === 'over' ? ' over' : '') + '">' +
      '<div class="bar-head"><b>' + esc(c.name) + '</b><span>' + right + '</span></div>' +
      '<div class="bar"><i class="' + cls + '" style="width:' + pct + '%"></i></div></div>';
  }).join('');

  var legend = cats.map(function (c) {
    var pct = s.spent ? Math.round(c.spent / s.spent * 100) : 0;
    return '<div><i style="background:' + c.color + '"></i>' + esc(c.name) + ' — ' + fmtMoney(c.spent) + ' (' + pct + '%)</div>';
  }).join('');

  return '<h1>' + fmtMonth(m) + ' at a glance</h1>' +
    '<p class="lede">Your household\u2019s money this month: what came in, what went out, and what is left for the goals that matter.</p>' +
    notice +
    '<div class="grid-4">' +
      '<div class="card stat income"><div class="label">Income</div><div class="value">' + fmtMoney(s.income) + '</div><div class="sub">salary &amp; freelance</div></div>' +
      '<div class="card stat expense"><div class="label">Spent</div><div class="value">' + fmtMoney(s.spent) + '</div><div class="sub">' + transactionsForMonth(m).filter(function (t) { return t.kind === 'expense'; }).length + ' expenses</div></div>' +
      '<div class="card ' + statClass + '"><div class="label">Left over</div><div class="value">' + fmtMoney(s.balance) + '</div><div class="sub">' + (s.balance >= 0 ? 'available to save or spend' : 'more spent than earned') + '</div></div>' +
      '<div class="card stat"><div class="label">Savings rate</div><div class="value">' + s.rate + '%</div><div class="sub">of income kept this month</div></div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<section class="card"><h2>Where the money went</h2>' +
        '<div class="donut-flex"><canvas class="chart" id="donutChart" width="220" height="220" role="img" aria-label="Donut chart of spending by category"></canvas>' +
        '<div class="donut-legend legend">' + legend + '</div></div>' +
      '</section>' +
      '<section class="card"><h2>Budget check — biggest categories</h2>' + bars +
        '<p style="margin:14px 0 0"><a class="btn secondary" href="#/budgets">Review all budgets</a></p>' +
      '</section>' +
    '</div>' +
    '<section class="card"><h2>Recent transactions</h2>' + transactionRows(recent) +
      '<p style="margin:14px 0 0"><a class="btn" href="#/transactions">Add a transaction</a> ' +
      '<a class="btn secondary" href="#/transactions">See all</a></p></section>';
}

/* ---------- Transactions ---------- */

function viewTransactions() {
  var m = store.month;
  var all = transactionsForMonth(m);
  var filter = window.__txFilter || { category: 'all', q: '' };
  var list = all.filter(function (t) {
    if (filter.category !== 'all' && t.category !== filter.category) return false;
    if (filter.q && t.desc.toLowerCase().indexOf(filter.q.toLowerCase()) === -1) return false;
    return true;
  });
  var s = monthSummary(m);
  var catFilter = '<option value="all">All categories</option>' +
    CATEGORIES.map(function (c) {
      return '<option value="' + c.id + '"' + (filter.category === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
    }).join('') +
    INCOME_SOURCES.map(function (c) {
      return '<option value="' + c.id + '"' + (filter.category === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
    }).join('');

  return '<h1>Transactions — ' + fmtMonth(m) + '</h1>' +
    '<p class="lede">Every dollar in and out. Income ' + fmtMoney(s.income) + ', spending ' + fmtMoney(s.spent) +
    ', ' + list.length + ' of ' + all.length + ' shown.</p>' +
    '<section class="card"><h2>Add a transaction</h2>' +
    '<form id="addTxForm">' +
      '<div class="form-row">' +
        '<div class="field"><label for="txKind">Type</label><select id="txKind" name="kind">' +
          '<option value="expense">Expense</option><option value="income">Income</option></select></div>' +
        '<div class="field"><label for="txDate">Date</label><input id="txDate" name="date" type="date" value="' + todayIso() + '" required></div>' +
      '</div>' +
      '<div class="form-row">' +
        '<div class="field"><label for="txDesc">Description</label><input id="txDesc" name="desc" type="text" maxlength="80" placeholder="e.g. Weekly shop — GreenMart" required></div>' +
        '<div class="field"><label for="txAmount">Amount ($)</label><input id="txAmount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></div>' +
      '</div>' +
      '<div class="field"><label for="txCategory">Category</label><select id="txCategory" name="category">' + categoryOptions('groceries') + '</select></div>' +
      '<div class="btn-row"><button class="btn" type="submit">Add transaction</button>' +
      '<span class="hint">Saved on this device only — nothing is sent anywhere.</span></div>' +
    '</form></section>' +
    '<section class="card"><h2>All transactions</h2>' +
      '<div class="form-row" style="margin-bottom:12px">' +
        '<div class="field" style="margin:0"><label for="txFilterCat">Filter by category</label><select id="txFilterCat">' + catFilter + '</select></div>' +
        '<div class="field" style="margin:0"><label for="txFilterQ">Search descriptions</label><input id="txFilterQ" type="search" placeholder="e.g. GreenMart" value="' + esc(filter.q) + '"></div>' +
      '</div>' +
      transactionRows(list) +
    '</section>';
}

/* ---------- Budgets ---------- */

function viewBudgets() {
  var m = store.month;
  var cats = spendingByCategory(m);
  var totalBudget = 0, totalSpent = 0;
  cats.forEach(function (c) { totalBudget += c.budget || 0; totalSpent += c.spent; });
  var rows = cats.map(function (c) {
    var pct = c.budget ? Math.min(100, Math.round(c.spent / c.budget * 100)) : 0;
    var cls = c.budget && c.spent > c.budget ? 'over' : (pct >= 85 ? 'warn' : '');
    var left = (c.budget || 0) - c.spent;
    var leftText = c.budget
      ? (left >= 0 ? fmtMoney(left) + ' left' : fmtMoney(-left) + ' over')
      : 'no budget set';
    return '<div class="bar-row' + (cls === 'over' ? ' over' : '') + '">' +
      '<div class="bar-head"><b><span class="cat-dot" style="background:' + c.color + '"></span>' + esc(c.name) + '</b>' +
      '<span>' + fmtMoney(c.spent) + ' of ' + (c.budget ? fmtMoney(c.budget) : '—') + ' · ' + leftText + '</span></div>' +
      '<div class="bar"><i class="' + cls + '" style="width:' + pct + '%"></i></div>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-top:6px">' +
        '<label class="hint" for="budget-' + c.id + '">Monthly budget $</label>' +
        '<input id="budget-' + c.id + '" data-budget-for="' + c.id + '" type="number" min="0" step="1" style="width:130px;padding:6px 9px;font:inherit;border:1px solid #c8d4cb;border-radius:8px" value="' + (c.budget ? c.budget / 100 : '') + '" placeholder="0">' +
        '<button class="btn secondary small" data-action="save-budget" data-id="' + c.id + '">Save</button> ' +
        budgetPill(c.spent, c.budget) +
      '</div></div>';
  }).join('');

  return '<h1>Budgets — ' + fmtMonth(m) + '</h1>' +
    '<p class="lede">Give every category a monthly limit before the month starts, then watch the bars. ' +
    'A household that plans its spending keeps more of it: this month you planned ' + fmtMoney(totalBudget) +
    ' and spent ' + fmtMoney(totalSpent) + '.</p>' +
    '<section class="card"><h2>Monthly limits by category</h2>' + rows + '</section>' +
    '<section class="card"><h2>How to set a good budget</h2>' +
    '<p>Start with last month\u2019s real spending — the <a href="#/reports">Reports</a> page shows it — then trim one category at a time. ' +
    'Fixed costs (rent, utilities) get a firm number; flexible ones (dining out, shopping) get a limit you can actually keep. ' +
    'If a bar turns red, move money from a category with room left instead of raising the total.</p></section>';
}

/* ---------- Reports ---------- */

function viewReports() {
  var months = availableMonths().slice(0, 6).reverse();
  var rows = months.map(function (k) {
    var s = monthSummary(k);
    var label = fmtMonth(k).split(' ')[0].slice(0, 3);
    return { label: label, income: s.income, spent: s.spent };
  });
  var m = store.month;
  var s = monthSummary(m);
  var prevKey = previousMonthKey(m);
  var prev = monthSummary(prevKey);
  var cats = spendingByCategory(m).sort(function (a, b) { return b.spent - a.spent; });
  var prevCats = {};
  spendingByCategory(prevKey).forEach(function (c) { prevCats[c.id] = c.spent; });

  var compareRows = cats.filter(function (c) { return c.spent > 0 || prevCats[c.id] > 0; }).map(function (c) {
    var before = prevCats[c.id] || 0;
    var diff = c.spent - before;
    var diffText = before === 0 ? 'new' : (diff > 0 ? '+' + fmtMoney(diff) : diff < 0 ? '\u2212' + fmtMoney(-diff) : 'same');
    var diffCls = diff > 0 ? 'money-out' : (diff < 0 ? 'money-in' : '');
    return '<tr><td><span class="cat-dot" style="background:' + c.color + '"></span>' + esc(c.name) + '</td>' +
      '<td class="num">' + fmtMoney(c.spent) + '</td><td class="num">' + fmtMoney(before) + '</td>' +
      '<td class="num ' + diffCls + '">' + diffText + '</td></tr>';
  }).join('');

  var expenses = transactionsForMonth(m).filter(function (t) { return t.kind === 'expense'; });
  var biggest = expenses.slice().sort(function (a, b) { return a.amount - b.amount; })[0];
  var days = Math.max(1, Number(todayIso().slice(8, 10)));
  var dailyAvg = Math.round(s.spent / days);
  var topCat = cats[0];

  return '<h1>Reports — ' + fmtMonth(m) + '</h1>' +
    '<p class="lede">The story of the month in numbers: how this month compares with the last ones, and where the money actually went.</p>' +
    '<div class="grid-3">' +
      '<div class="card stat"><div class="label">Biggest single expense</div><div class="value" style="font-size:22px">' + (biggest ? esc(biggest.desc) : '—') + '</div><div class="sub">' + (biggest ? fmtMoney(-biggest.amount) + ' on ' + fmtDate(biggest.date) : '') + '</div></div>' +
      '<div class="card stat"><div class="label">Spending per day so far</div><div class="value">' + fmtMoney(dailyAvg) + '</div><div class="sub">over ' + days + ' days this month</div></div>' +
      '<div class="card stat"><div class="label">Top category</div><div class="value" style="font-size:22px">' + (topCat && topCat.spent ? esc(topCat.name) : '—') + '</div><div class="sub">' + (topCat && topCat.spent ? fmtMoney(topCat.spent) + ' — ' + Math.round(topCat.spent / s.spent * 100) + '% of spending' : '') + '</div></div>' +
    '</div>' +
    '<section class="card"><h2>Income vs spending — last ' + rows.length + ' months</h2>' +
      '<div class="chart-wrap"><canvas class="chart" id="barsChart" width="640" height="260" role="img" aria-label="Bar chart of income and spending by month"></canvas></div>' +
      '<div class="legend"><span><i style="background:#1a7f5e"></i>Income</span><span><i style="background:#c2410c"></i>Spending</span></div>' +
    '</section>' +
    '<section class="card"><h2>This month vs ' + fmtMonth(prevKey) + '</h2>' +
      '<table><thead><tr><th>Category</th><th class="num">' + fmtMonth(m).split(' ')[0] + '</th><th class="num">' + fmtMonth(prevKey).split(' ')[0] + '</th><th class="num">Change</th></tr></thead><tbody>' +
      compareRows + '</tbody></table>' +
      '<p class="hint" style="margin-top:10px">Income ' + fmtMoney(s.income) + ' vs ' + fmtMoney(prev.income) + ' last month; spending ' + fmtMoney(s.spent) + ' vs ' + fmtMoney(prev.spent) + '.</p>' +
    '</section>';
}

function previousMonthKey(key) {
  var parts = key.split('-');
  var y = Number(parts[0]), mo = Number(parts[1]);
  mo -= 1;
  if (mo === 0) { mo = 12; y -= 1; }
  return y + '-' + String(mo).padStart(2, '0');
}

/* ---------- Goals ---------- */

function viewGoals() {
  var totalSaved = 0, totalTarget = 0;
  store.goals.forEach(function (g) { totalSaved += g.saved; totalTarget += g.target; });
  var overall = totalTarget ? Math.round(totalSaved / totalTarget * 100) : 0;

  var cards = store.goals.map(function (g) {
    var pct = g.target ? Math.min(100, Math.round(g.saved / g.target * 100)) : 0;
    var remaining = g.target - g.saved;
    return '<div class="goal"><div class="goal-head"><b>' + esc(g.name) + '</b><span>' + fmtMoney(g.saved) + ' of ' + fmtMoney(g.target) + ' · ' + pct + '%</span></div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<p class="hint" style="margin:0 0 10px">' + (remaining > 0 ? fmtMoney(remaining) + ' to go. ' : 'Goal reached — well done! ') + esc(g.note || '') + '</p>' +
      '<form class="goal-add" data-goal="' + g.id + '" style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<input type="number" min="1" step="0.01" placeholder="Add $ amount" aria-label="Amount to add to ' + esc(g.name) + '" required style="width:170px">' +
        '<button class="btn small" type="submit">Add savings</button></form></div>';
  }).join('');

  return '<h1>Savings goals</h1>' +
    '<p class="lede">Saving works best with a name on it. ' + fmtMoney(totalSaved) + ' saved toward ' + fmtMoney(totalTarget) +
    ' of goals — ' + overall + '% of the way there.</p>' +
    '<section class="card"><h2>Your goals</h2>' + (cards || '<p class="empty">No goals yet — add your first one below.</p>') + '</section>' +
    '<section class="card"><h2>Start a new goal</h2>' +
    '<form id="addGoalForm">' +
      '<div class="form-row">' +
        '<div class="field"><label for="goalName">Goal name</label><input id="goalName" type="text" maxlength="60" placeholder="e.g. New car" required></div>' +
        '<div class="field"><label for="goalTarget">Target amount ($)</label><input id="goalTarget" type="number" min="1" step="1" placeholder="1000" required></div>' +
      '</div>' +
      '<div class="field"><label for="goalNote">Why this goal matters (optional)</label><input id="goalNote" type="text" maxlength="120" placeholder="e.g. So the kids can visit their cousins"></div>' +
      '<button class="btn" type="submit">Create goal</button></form></section>';
}

/* ---------- Settings ---------- */

function viewSettings() {
  var n = store.transactions.length;
  return '<h1>Data &amp; settings</h1>' +
    '<p class="lede">HomeBudget stores everything in this browser only. There is no account, no cloud sync and nothing is uploaded.</p>' +
    '<section class="card"><h2>Your data</h2>' +
      '<p>' + n + ' transactions, ' + store.goals.length + ' savings goals and budgets for ' +
      Object.keys(store.budgets).length + ' categories are saved on this device.</p>' +
      '<div class="btn-row">' +
        '<button class="btn" data-action="export">Download my data (JSON)</button>' +
        '<label class="btn secondary" for="importFile" style="cursor:pointer">Import data…</label>' +
        '<input id="importFile" type="file" accept="application/json,.json" hidden>' +
      '</div>' +
      '<p class="hint" id="importMsg">Export first as a backup before importing — import replaces everything.</p>' +
    '</section>' +
    '<section class="card"><h2>Start over</h2>' +
      '<p>Restore the example household (November 2026) or erase everything and begin with a blank budget.</p>' +
      '<div class="btn-row">' +
        '<button class="btn secondary" data-action="reset-seed">Restore example data</button>' +
        '<button class="btn danger" data-action="clear-all">Erase all my data</button>' +
      '</div></section>' +
    '<section class="card"><h2>About HomeBudget</h2>' +
      '<p>HomeBudget is a single-page household budget planner: track income and spending, set monthly limits per category, ' +
      'compare months, and save toward named goals. It works offline, on desktop and on a phone, and keeps your figures ' +
      'in your browser\u2019s local storage. Built as a static site — no server, no tracking, no account needed.</p></section>';
}
