/* main.js — 主题切换 + 移动导航 */
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
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyThemeBtn);
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

  /* ---------- 分组 Tabs ---------- */
  const tabGroups = document.querySelectorAll('[data-tabs]');
  tabGroups.forEach(function (group) {
    const btns = Array.prototype.slice.call(group.querySelectorAll('.tab-btn'));
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        const key = btn.getAttribute('data-tab');
        const panels = group.parentElement.querySelectorAll('.panel[data-panel]');
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-panel') !== key;
        });
      });
    });
  });

  /* ---------- 轮播 ---------- */
  function initCarousel(root) {
    const viewport = root.querySelector('.carousel-viewport');
    if (!viewport) return;
    const slides = Array.prototype.slice.call(viewport.querySelectorAll('.slide'));
    const dotsWrap = root.querySelector('.carousel-dots');
    const prev = root.querySelector('.carousel-arrow.prev');
    const next = root.querySelector('.carousel-arrow.next');
    const curEl = root.querySelector('.carousel-count .cur');
    const totalEl = root.querySelector('.carousel-count .total');
    let idx = 0;
    function show(i, dots) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('active', n === idx); });
      if (curEl && totalEl) { curEl.textContent = idx + 1; totalEl.textContent = slides.length; }
      if (dots && dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, n) { d.classList.toggle('active', n === idx); });
      }
    }
    if (totalEl) totalEl.textContent = slides.length;
    if (dotsWrap) {
      slides.forEach(function (_, n) {
        const d = document.createElement('button');
        d.className = 'dot';
        d.setAttribute('aria-label', '第 ' + (n + 1) + ' 项');
        d.addEventListener('click', function () { show(n, true); });
        dotsWrap.appendChild(d);
      });
    }
    if (prev) prev.addEventListener('click', function () { show(idx - 1, true); });
    if (next) next.addEventListener('click', function () { show(idx + 1, true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1, true);
      if (e.key === 'ArrowRight') show(idx + 1, true);
    });
    show(0, true);
  }
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* ---------- 灯箱放大 ---------- */
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-wrap';
  const lbImg = document.createElement('img');
  const lbClose = document.createElement('button');
  lbClose.className = 'lightbox-close';
  lbClose.textContent = '✕';
  lbClose.setAttribute('aria-label', '关闭');
  lightbox.appendChild(lbImg);
  lightbox.appendChild(lbClose);
  document.body.appendChild(lightbox);
  function openLightbox() { lightbox.classList.add('open'); }
  function closeLightbox() { lightbox.classList.remove('open'); }
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  document.body.addEventListener('click', function (e) {
    const t = e.target.closest('.lightbox-trigger');
    if (t) { lbImg.src = t.src; lbImg.alt = t.alt; openLightbox(); }
  });
})();