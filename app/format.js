/* HomeBudget — formatting helpers. One job: turn numbers and dates into readable text. */
'use strict';

/** Format cents as dollars, e.g. 123456 -> "$1,234.56". Amounts are stored in cents. */
function fmtMoney(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rem = abs % 100;
  return sign + '$' + dollars.toLocaleString('en-US') + '.' + String(rem).padStart(2, '0');
}

/** Short money without cents when whole, e.g. 145000 -> "$1,450". */
function fmtMoneyShort(cents) {
  if (cents % 100 === 0) {
    const sign = cents < 0 ? '-' : '';
    return sign + '$' + Math.abs(cents / 100).toLocaleString('en-US');
  }
  return fmtMoney(cents);
}

/** "2026-11-04" -> "Nov 4, 2026". */
function fmtDate(iso) {
  const parts = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[Number(parts[1]) - 1] || '';
  return month + ' ' + Number(parts[2]) + ', ' + parts[0];
}

/** "2026-11" -> "November 2026". */
function fmtMonth(key) {
  const parts = key.split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  return (months[Number(parts[1]) - 1] || '') + ' ' + parts[0];
}

/** Today's date as "2026-11-27" in local time. */
function todayIso() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

/** "2026-11-27" -> "2026-11". */
function monthKeyOf(iso) {
  return iso.slice(0, 7);
}

/** Current month key, e.g. "2026-11". */
function currentMonthKey() {
  return monthKeyOf(todayIso());
}

/** Escape text for safe insertion into HTML. */
function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
