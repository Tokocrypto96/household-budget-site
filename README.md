# HomeBudget — Household Budget Planner

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?ref=zxv8k0jn)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Tokocrypto96/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?ref=zxv8k0jn)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Tokocrypto96/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?ref=zxv8k0jn)

HomeBudget is a household budget site that runs entirely in your browser.
Plan the month, track every dollar, and save toward named goals — no account,
no server, no tracking. Built for the
[best household budget site bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457?ref=zxv8k0jn)
on [make.fun](https://make.fun?ref=zxv8k0jn).

## What it does

- **Dashboard** — income, spending, money left over and savings rate for the
  month, a donut chart of where the money went, budget progress for the
  biggest categories, and recent transactions.
- **Transactions** — add income or expenses with date, description, category
  and amount; filter by category or search descriptions; delete mistakes.
- **Budgets** — set a monthly limit per category, watch the bars turn amber
  then red as you approach or pass the limit.
- **Reports** — income vs spending bars for the last six months, a
  month-over-month category comparison, biggest expense, daily average and
  top category.
- **Goals** — named savings goals with progress bars; add money as you save.
- **Data & settings** — export everything as JSON, import it back, restore
  the example household or erase all data.

Everything is saved in the browser's local storage, so the site works fully
offline. It ships with a realistic example month (November 2026, a family of
four) so every page shows real figures right away.

## Run it locally

Any static server works, with `app/` at its root:

```sh
cd app && python3 -m http.server 8080
```

Then open <http://localhost:8080> in a browser. The site has no build step
and makes no network requests.

## Layout

- `app/index.html` — page shell and navigation
- `app/style.css` — all styling, desktop and phone
- `app/format.js` — money and date formatting
- `app/data.js` — categories and example household data
- `app/store.js` — local storage, summaries and edits
- `app/charts.js` — canvas bar and donut charts (no library)
- `app/views.js` — one render function per page
- `app/app.js` — hash router and user actions
- `main.ts` — hand-in program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json`
- `screenshots/` — screenshots of the site, taken in a browser

## License

MIT — see [LICENSE](LICENSE).
