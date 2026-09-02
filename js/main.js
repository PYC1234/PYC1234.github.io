/* main.js — 主题切换、移动导航、4 张 SVG 图表渲染、投递记录表格 */
(function () {
  'use strict';

  /* ---------- 主题 ---------- */
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);

  function applyThemeBtn() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const dark = root.getAttribute('data-theme') === 'dark'
      || (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    btn.textContent = dark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', dark ? '切换到浅色' : '切换到深色');
  }
  document.getElementById('theme-toggle').addEventListener('click', function () {
    const dark = root.getAttribute('data-theme') === 'dark'
      || (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    localStorage.setItem('theme', dark ? 'light' : 'dark');
    applyThemeBtn();
    renderCharts(); // 图表随主题重渲
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!root.hasAttribute('data-theme')) renderCharts();
  });
  applyThemeBtn();

  /* ---------- 移动导航 ---------- */
  const navBtn = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-links');
  navBtn.addEventListener('click', function () {
    const open = navLinks.classList.toggle('open');
    navBtn.setAttribute('aria-expanded', open);
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 数据 ---------- */
  const dataEl = document.getElementById('homepage-job-data');
  const records = JSON.parse(dataEl.textContent || '[]');
  const total = records.length;

  /* 聚合 */
  function aggBy(pred) {
    const m = {};
    records.forEach(r => { const k = pred(r); m[k] = (m[k] || 0) + 1; });
    return m;
  }

  // ① 按月投递趋势
  const byMonth = aggBy(r => (r.date || '').slice(0, 7));
  const months = Object.keys(byMonth).sort();
  const trend = months.map(m => ({ label: Number(m.slice(5, 7)) + '月', count: byMonth[m], month: m }));

  // ② 类型占比
  const typeOrder = ['秋招', '暑期实习', '日常实习'];
  const byType = aggBy(r => r.type);
  const types = typeOrder.filter(t => byType[t]).map(t => ({ label: t, count: byType[t] }));

  // ③ 漏斗（取当前最新状态）
  const st = (r) => r.status || '';
  const funnel = [
    { label: '已投递', count: 0, key: '已投递,待投递', match: s => s === '已投递' || s === '待投递' },
    { label: '筛选中', count: 0, key: '简历筛选', match: s => s === '简历筛选' },
    { label: '笔试/测评', count: 0, key: '笔试,测试,测评,笔试完成,测评完成', match: s => /^(笔试|测试|测评|笔试完成|测评完成)/.test(s) },
    { label: '面试', count: 0, key: '一面,二面,HR面,群面,面试结束,待结果', match: s => /^(一面|二面|HR面|群面)/.test(s) || s === '面试结束（待结果）' },
  ];
  let ended = 0;
  records.forEach(r => {
    const s = st(r);
    if (s === '终止') { ended++; return; }
    const slot = funnel.find(f => f.match(s));
    if (slot) slot.count++;
  });

  // ④ 公司分布（腾讯系合并 + 尾部折叠）
  const byCompany = aggBy(r => r.company);
  const tencent = Object.keys(byCompany).filter(k => k.indexOf('腾讯') === 0)
    .reduce((a, k) => a + byCompany[k], 0);
  const topComps = [];
  Object.entries(byCompany).filter(([k]) => k.indexOf('腾讯') !== 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, n]) => {
      if (topComps.length < 2) topComps.push({ label: k.replace('（NIO）', ''), count: n, isOther: false });
      else if (topComps.length === 2) topComps.push({ label: '其他', count: n, isOther: true, others: 1 });
      else topComps[2].count += n, topComps[2].others++;
    });
  const companies = [{ label: '腾讯系', count: tencent, isOther: false, tencent: 1 }, ...topComps];
  const othersCount = companies.find(c => c.isOther);

  /* ---------- SVG 工具 ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function makeSvg(w, h) {
    const s = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-hidden': 'true' });
    s.style.width = '100%';
    s.style.height = 'auto';
    return s;
  }
  function styleVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function fmtPct(n, total) { return Math.round(n / total * 100) + '%'; }

  /* ---------- Tooltip ---------- */
  const tip = document.getElementById('chart-tip');
  function showTip(html, ev) {
    tip.textContent = html;
    tip.classList.add('show');
    const rect = tip.getBoundingClientRect();
    let x = ev.clientX + 12, y = ev.clientY + 12;
    if (x + rect.width > innerWidth - 8) x = ev.clientX - rect.width - 12;
    if (y + rect.height > innerHeight - 8) y = ev.clientY - rect.height - 12;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hideTip() { tip.classList.remove('show'); }
  function hover(node, text) {
    node.addEventListener('mousemove', ev => showTip(text, ev));
    node.addEventListener('mouseleave', hideTip);
    node.addEventListener('focus', ev => showTip(text, ev));
    node.addEventListener('blur', hideTip);
    node.setAttribute('tabindex', '0');
  }

  /* ---------- ① 投递趋势（纵向柱状） ---------- */
  function renderTrend() {
    const box = document.querySelector('[data-chart="trend"]');
    box.innerHTML = '';
    const W = 460, H = 240, padL = 34, padB = 30, padT = 20, padR = 8;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const max = Math.max(...trend.map(t => t.count));
    const svg = makeSvg(W, H);
    const ink3 = styleVar('--ink-3');
    const ink2 = styleVar('--ink-2');
    const line = styleVar('--line');
    const c1 = styleVar('--series-1');
    const n = trend.length;
    const slot = plotW / n;
    trend.forEach((t, i) => {
      const bw = Math.min(38, slot * 0.52);
      const bh = Math.max(2, t.count / max * plotH);
      const x = padL + slot * i + (slot - bw) / 2;
      const y = padT + plotH - bh;
      svgEl('rect', { x, y, width: bw, height: bh, rx: 4, fill: c1 }, svg);
      svgEl('text', { x: x + bw / 2, y: y - 7, 'text-anchor': 'middle', class: 'c-value', fill: ink2 }, svg)
        .textContent = t.count;
      svgEl('text', { x: x + bw / 2, y: H - 10, 'text-anchor': 'middle', class: 'c-label', fill: ink3 }, svg)
        .textContent = t.label;
      const hit = svgEl('rect', { x: padL + slot * i, y: padT, width: slot, height: plotH, fill: 'transparent' }, svg);
      hover(hit, t.month + ' · ' + t.count + ' 条');
    });
    // 基线
    svgEl('line', { x1: padL, y1: padT + plotH, x2: W - padR, y2: padT + plotH, stroke: line, 'stroke-width': 1 }, svg);
    box.appendChild(svg);
  }

  /* ---------- ③ 漏斗（有序横向条） ---------- */
  function renderFunnel() {
    const box = document.querySelector('[data-chart="funnel"]');
    box.innerHTML = '';
    const W = 460, H = 40 + funnel.length * 38;
    const svg = makeSvg(W, H);
    const max = Math.max(...funnel.map(f => f.count));
    const padL = 78, padR = 84, x0 = padL;
    const rowH = 38, top = 24;
    const w = W - padL - padR;
    const ordinal = ['--ordinal-1', '--ordinal-2', '--ordinal-3', '--ordinal-4']
      .map(v => styleVar(v));
    const ink2 = styleVar('--ink-2');
    const ink3 = styleVar('--ink-3');
    const line = styleVar('--line');
    funnel.forEach((f, i) => {
      const y = top + i * rowH;
      const bw = Math.max(2, f.count / max * w);
      svgEl('rect', { x: x0, y: y + 8, width: bw, height: 22, rx: 4, fill: ordinal[i] }, svg);
      svgEl('text', { x: padL - 8, y: y + 24, 'text-anchor': 'end', class: 'c-label', fill: ink3 }, svg)
        .textContent = f.label;
      svgEl('text', { x: x0 + bw + 8, y: y + 24, class: 'c-value', fill: ink2 }, svg)
        .textContent = f.count;
      const hit = svgEl('rect', { x: x0, y: y, width: w, height: rowH, fill: 'transparent' }, svg);
      hover(hit, f.label + ' · ' + f.count + ' 条');
    });
    box.appendChild(svg);
    // 终止行（红色状态，独立显示）
    const endRow = document.createElement('div');
    endRow.className = 'funnel-end';
    const dot = document.createElement('span');
    dot.className = 'fd-dot';
    endRow.appendChild(dot);
    const t = document.createElement('span');
    t.textContent = '终止' + (ended ? ' ' + ended + ' 条' : ' 0 条');
    t.className = 'fd-label';
    endRow.appendChild(t);
    box.appendChild(endRow);
    const note = box.parentElement.querySelector('.chart-note');
    if (note) note.textContent = '取各投递当前最新状态（非流水线通过数）· 终止 ' + ended + ' 条';
  }

  /* ---------- ② 类型占比（环形） ---------- */
  function renderTypes() {
    const box = document.querySelector('[data-chart="types"]');
    box.innerHTML = '';
    const W = 460, H = 340, cx = 230, cy = 150, rOut = 96, rIn = 56;
    const svg = makeSvg(W, H);
    const series = ['--series-1', '--series-2', '--series-3'].map(v => styleVar(v));
    const ink = styleVar('--ink');
    const ink3 = styleVar('--ink-3');
    const sum = types.reduce((a, t) => a + t.count, 0);
    const gap = 2 / rOut; // 2px 弧间隙
    let a0 = -Math.PI / 2;
    types.forEach((t, i) => {
      const frac = t.count / sum;
      const a1 = a0 + frac * Math.PI * 2 - gap;
      const path = describeArc(cx, cy, rOut, a0 + gap / 2, a1);
      const p = svgEl('path', { d: path, fill: series[i] || '#999' }, svg);
      const mid = (a0 + a1) / 2;
      const hit = svgEl('path', {
        d: describeArc(cx, cy, rOut, a0, a0 + frac * Math.PI * 2),
        fill: 'transparent', stroke: 'transparent', 'stroke-width': rOut - rIn,
      }, svg);
      hover(hit, t.label + ' · ' + t.count + ' 条 · ' + fmtPct(t.count, sum));
      // 扇区 % 标注（仅 >= 10%）
      if (frac >= 0.1) {
        const rr = (rOut + rIn) / 2;
        svgEl('text', {
          x: cx + Math.cos(mid) * rr, y: cy + Math.sin(mid) * rr + 4,
          'text-anchor': 'middle', class: 'c-value', fill: ink3,
        }, svg).textContent = fmtPct(t.count, sum);
      }
      a0 = a0 + frac * Math.PI * 2;
    });
    // 中心总数
    svgEl('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', class: 'c-hero', fill: ink }, svg)
      .textContent = sum;
    svgEl('text', { x: cx, y: cy + 18, 'text-anchor': 'middle', class: 'c-hero-lbl', fill: ink3 }, svg)
      .textContent = '条投递';
    box.appendChild(svg);
    // 图例
    const lg = document.createElement('div');
    lg.className = 'legend';
    types.forEach((t, i) => {
      const item = document.createElement('span');
      item.className = 'legend-item';
      const sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = series[i] || '#999';
      item.appendChild(sw);
      item.appendChild(document.createTextNode(t.label + ' · ' + t.count + '（' + fmtPct(t.count, sum) + '）'));
      lg.appendChild(item);
    });
    box.appendChild(lg);
  }

  function describeArc(cx, cy, r, a0, a1) {
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    return 'M' + x0 + ' ' + y0 + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1 + ' ' + y1;
  }

  /* ---------- ④ 公司分布（横向条） ---------- */
  function renderCompanies() {
    const box = document.querySelector('[data-chart="companies"]');
    box.innerHTML = '';
    const W = 460, H = 40 + companies.length * 38;
    const svg = makeSvg(W, H);
    const max = Math.max(...companies.map(c => c.count));
    const padL = 84, padR = 84, x0 = padL;
    const rowH = 38, top = 24;
    const w = W - padL - padR;
    const c1 = styleVar('--series-1');
    const ink3 = styleVar('--ink-3');
    const ink2 = styleVar('--ink-2');
    companies.forEach((c, i) => {
      const y = top + i * rowH;
      const bw = Math.max(2, c.count / max * w);
      svgEl('rect', { x: x0, y: y + 8, width: bw, height: 22, rx: 4, fill: c.isOther ? ink3 : c1 }, svg);
      svgEl('text', { x: padL - 8, y: y + 24, 'text-anchor': 'end', class: 'c-label', fill: ink3 }, svg)
        .textContent = c.label;
      svgEl('text', { x: x0 + bw + 8, y: y + 24, class: 'c-value', fill: ink2 }, svg)
        .textContent = c.count;
      const tipTxt = c.isOther
        ? '其他 ' + (c.others || 1) + ' 家公司 · ' + c.count + ' 条'
        : c.label + ' · ' + c.count + ' 条';
      const hit = svgEl('rect', { x: x0, y: y, width: w, height: rowH, fill: 'transparent' }, svg);
      hover(hit, tipTxt);
    });
    box.appendChild(svg);
    const note = box.parentElement.querySelector('.chart-note');
    if (note && othersCount) note.textContent = '腾讯系投递最多，其余 ' + othersCount.others + ' 家折叠为「其他」';
  }

  /* ---------- 表格 ---------- */
  function renderTable() {
    const tbody = document.getElementById('records-tbody');
    const count = document.getElementById('table-count');
    count.textContent = total;
    const frag = document.createDocumentFragment();
    records.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).forEach(r => {
      const tr = document.createElement('tr');
      const mk = (txt) => { const td = document.createElement('td'); td.textContent = txt; return td; };
      tr.appendChild(mk(r.date || '—'));
      tr.appendChild(mk(r.company || '—'));
      tr.appendChild(mk(r.position || '—'));
      tr.appendChild(mk(r.type || '—'));
      const stTd = document.createElement('td');
      stTd.textContent = r.status || '—';
      stTd.className = r.status === '终止' ? 'st st-end' : 'st';
      tr.appendChild(stTd);
      frag.appendChild(tr);
    });
    tbody.appendChild(frag);
  }

  /* ---------- HERO 数字 ---------- */
  const heroTotal = document.getElementById('hero-total');
  if (heroTotal) heroTotal.textContent = total;

  /* ---------- 渲染 ---------- */
  function renderCharts() {
    renderTrend();
    renderTypes();
    renderFunnel();
    renderCompanies();
  }
  renderCharts();
  renderTable();
})();