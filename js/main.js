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
})();