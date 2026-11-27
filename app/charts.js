/* HomeBudget — charts. One job: draw simple, readable charts on canvas. */
'use strict';

/** Scale a canvas for sharp rendering on high-density screens. */
function setupCanvas(canvas, width, height) {
  var dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.aspectRatio = width + ' / ' + height;
  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = '12px system-ui, sans-serif';
  return ctx;
}

/**
 * Grouped bar chart: for each month, one income bar and one spending bar.
 * rows: [{label, income, spent}] in cents.
 */
function drawMonthlyBars(canvas, rows) {
  var W = 640, H = 260, padL = 58, padB = 28, padT = 14;
  var ctx = setupCanvas(canvas, W, H);
  var max = 0;
  rows.forEach(function (r) {
    max = Math.max(max, r.income, r.spent);
  });
  if (max <= 0) max = 1;
  max = Math.ceil(max / 100000) * 100000; // round up to whole $1,000 steps
  var plotW = W - padL - 14, plotH = H - padT - padB;
  var n = rows.length;
  var groupW = plotW / n;
  var barW = Math.min(34, (groupW - 18) / 2);

  // gridlines + y labels
  ctx.strokeStyle = '#e3eae4';
  ctx.fillStyle = '#5c6f64';
  ctx.textAlign = 'right';
  for (var g = 0; g <= 4; g++) {
    var y = padT + plotH - plotH * g / 4;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - 14, y);
    ctx.stroke();
    ctx.fillText(fmtMoneyShort(max * g / 4), padL - 8, y + 4);
  }

  rows.forEach(function (r, i) {
    var gx = padL + i * groupW + (groupW - barW * 2 - 6) / 2;
    var hIn = r.income / max * plotH;
    var hOut = r.spent / max * plotH;
    ctx.fillStyle = '#1a7f5e';
    ctx.fillRect(gx, padT + plotH - hIn, barW, hIn);
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(gx + barW + 6, padT + plotH - hOut, barW, hOut);
    ctx.fillStyle = '#1d2b24';
    ctx.textAlign = 'center';
    ctx.fillText(r.label, gx + barW + 3, H - 8);
  });
}

/**
 * Donut chart of spending by category.
 * slices: [{name, color, spent}] in cents. Returns nothing; legend is HTML.
 */
function drawDonut(canvas, slices) {
  var S = 220;
  var ctx = setupCanvas(canvas, S, S);
  var total = 0;
  slices.forEach(function (s) { total += s.spent; });
  var cx = S / 2, cy = S / 2, rOuter = 100, rInner = 62;
  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.fillStyle = '#e8efe9';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    return;
  }
  var start = -Math.PI / 2;
  slices.forEach(function (s) {
    if (s.spent <= 0) return;
    var sweep = s.spent / total * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rOuter, start, start + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    start += sweep;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#1d2b24';
  ctx.textAlign = 'center';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(fmtMoneyShort(total), cx, cy - 2);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#5c6f64';
  ctx.fillText('spent', cx, cy + 16);
}
