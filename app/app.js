/* HomeBudget — app wiring. One job: routes, navigation and user actions. */
'use strict';

var ROUTES = {
  dashboard: viewDashboard,
  transactions: viewTransactions,
  budgets: viewBudgets,
  reports: viewReports,
  goals: viewGoals,
  settings: viewSettings
};

/** Transaction list filter kept while browsing the Transactions page. */
window.__txFilter = { category: 'all', q: '' };

var viewEl = document.getElementById('view');
var monthSelect = document.getElementById('monthSelect');

function fillMonthSelect() {
  var months = availableMonths();
  monthSelect.innerHTML = months.map(function (k) {
    return '<option value="' + k + '"' + (k === store.month ? ' selected' : '') + '>' + fmtMonth(k) + '</option>';
  }).join('');
}

function currentRoute() {
  var hash = location.hash || '#/dashboard';
  var name = hash.replace(/^#\/?/, '').split('/')[0];
  return ROUTES[name] ? name : 'dashboard';
}

function render() {
  var name = currentRoute();
  fillMonthSelect();
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    a.classList.toggle('active', a.getAttribute('data-nav') === name);
  });
  viewEl.innerHTML = ROUTES[name]();
  afterRender(name);
  window.scrollTo(0, 0);
}

/** Draw the charts a page needs, after its HTML is in place. */
function afterRender(name) {
  if (name === 'dashboard') {
    var donut = document.getElementById('donutChart');
    if (donut) {
      var cats = spendingByCategory(store.month).filter(function (c) { return c.spent > 0; });
      drawDonut(donut, cats);
    }
  }
  if (name === 'reports') {
    var bars = document.getElementById('barsChart');
    if (bars) {
      var months = availableMonths().slice(0, 6).reverse();
      var rows = months.map(function (k) {
        var s = monthSummary(k);
        return { label: fmtMonth(k).split(' ')[0].slice(0, 3), income: s.income, spent: s.spent };
      });
      drawMonthlyBars(bars, rows);
    }
  }
  var kind = document.getElementById('txKind');
  if (kind) syncCategoryOptions(kind.value);
}

/** The category list follows the chosen transaction type. */
function syncCategoryOptions(kind) {
  var sel = document.getElementById('txCategory');
  if (!sel) return;
  if (kind === 'income') {
    sel.innerHTML = incomeOptions('salary');
  } else {
    sel.innerHTML = categoryOptions('groceries');
  }
}

function download(filename, text) {
  var blob = new Blob([text], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}

/* ----- global events (delegation, so re-renders keep working) ----- */

monthSelect.addEventListener('change', function () {
  store.month = monthSelect.value;
  render();
});

window.addEventListener('hashchange', render);

viewEl.addEventListener('submit', function (e) {
  e.preventDefault();
  var form = e.target;

  if (form.id === 'addTxForm') {
    var kind = form.kind.value;
    var amount = Math.round(parseFloat(form.amount.value) * 100);
    if (!amount || amount <= 0) return;
    addTransaction({
      date: form.date.value || todayIso(),
      kind: kind,
      category: form.category.value,
      desc: form.desc.value.trim(),
      amount: kind === 'income' ? amount : -amount
    });
    render();
    return;
  }

  if (form.id === 'addGoalForm') {
    var target = Math.round(parseFloat(form.goalTarget.value) * 100);
    if (!target || target <= 0) return;
    addGoal(form.goalName.value.trim(), target, form.goalNote.value.trim());
    render();
    return;
  }

  if (form.classList.contains('goal-add')) {
    var input = form.querySelector('input');
    var cents = Math.round(parseFloat(input.value) * 100);
    if (!cents || cents <= 0) return;
    addToGoal(form.getAttribute('data-goal'), cents);
    render();
  }
});

viewEl.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var action = btn.getAttribute('data-action');
  var id = btn.getAttribute('data-id');

  if (action === 'delete-tx') {
    if (window.confirm('Delete this transaction?')) {
      deleteTransaction(id);
      render();
    }
  }

  if (action === 'save-budget') {
    var input = document.querySelector('input[data-budget-for="' + id + '"]');
    if (!input) return;
    var cents = Math.round(parseFloat(input.value || '0') * 100);
    setBudget(id, cents);
    render();
  }

  if (action === 'export') {
    download('homebudget-export-' + todayIso() + '.json', exportData());
  }

  if (action === 'reset-seed') {
    if (window.confirm('Restore the example household data? Your current data will be replaced.')) {
      resetToSeed();
      render();
    }
  }

  if (action === 'clear-all') {
    if (window.confirm('Erase ALL your HomeBudget data? This cannot be undone.')) {
      clearAllData();
      render();
    }
  }
});

viewEl.addEventListener('change', function (e) {
  var el = e.target;
  if (el.id === 'txKind') syncCategoryOptions(el.value);
  if (el.id === 'txFilterCat') {
    window.__txFilter.category = el.value;
    render();
  }
  if (el.id === 'importFile' && el.files && el.files[0]) {
    var reader = new FileReader();
    reader.onload = function () {
      var err = importData(String(reader.result || ''));
      var msg = document.getElementById('importMsg');
      if (err) {
        if (msg) msg.textContent = err;
        window.alert(err);
      } else {
        render();
      }
    };
    reader.readAsText(el.files[0]);
  }
});

viewEl.addEventListener('input', function (e) {
  if (e.target.id === 'txFilterQ') {
    window.__txFilter.q = e.target.value;
    // Re-render only the table, keeping the search box focused.
    var name = currentRoute();
    if (name !== 'transactions') return;
    var pos = e.target.selectionStart;
    render();
    var box = document.getElementById('txFilterQ');
    if (box) {
      box.focus();
      box.setSelectionRange(pos, pos);
    }
  }
});

render();
