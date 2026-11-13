(function () {
  'use strict';
  const root = document.documentElement;
  const media = matchMedia('(prefers-color-scheme: dark)');
  const themeButton = document.getElementById('theme-toggle');
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  } catch (_) {}
  function dark() { return root.dataset.theme === 'dark' || (!root.dataset.theme && media.matches); }
  function updateTheme() {
    if (!themeButton) return;
    themeButton.textContent = dark() ? '☀️' : '🌙';
    themeButton.setAttribute('aria-label', dark() ? '切换到浅色' : '切换到深色');
  }
  themeButton?.addEventListener('click', function () {
    root.dataset.theme = dark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (_) {}
    updateTheme();
  });
  media.addEventListener('change', updateTheme);
  updateTheme();
  const navButton = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-links');
  function closeMenu() { navLinks?.classList.remove('open'); navButton?.setAttribute('aria-expanded', 'false'); }
  navButton?.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); navButton.setAttribute('aria-expanded', String(open)); });
  navLinks?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && navLinks?.classList.contains('open')) { closeMenu(); navButton.focus(); } });
  const lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox-wrap';
  lightbox.setAttribute('aria-label', '项目图片预览');
  const image = document.createElement('img');
  const close = document.createElement('button');
  close.className = 'lightbox-close'; close.textContent = '✕'; close.setAttribute('aria-label', '关闭图片预览');
  lightbox.append(image, close); document.body.append(lightbox);
  let opener, previousOverflow;
  function showImage(target) {
    if (lightbox.open) return;
    opener = target; image.src = target.src; image.alt = target.alt;
    previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    lightbox.showModal(); close.focus();
  }
  close.addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => { document.body.style.overflow = previousOverflow || ''; opener?.focus(); });
  document.querySelectorAll('.lightbox-trigger').forEach((target) => {
    target.tabIndex = 0; target.setAttribute('role', 'button'); target.setAttribute('aria-haspopup', 'dialog'); target.setAttribute('aria-label', '放大查看：' + target.alt);
    target.addEventListener('click', () => showImage(target));
    target.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showImage(target); } });
  });
  if (new URLSearchParams(location.search).get('edit') === '1') {
    const targets = document.querySelectorAll('main h1, main h2, main h3, main p, .fit-card span');
    document.body.classList.add('edit-mode'); targets.forEach((element) => { element.contentEditable = 'true'; });
    const bar = document.createElement('div'); bar.className = 'editor-bar';
    const label = document.createElement('span'); label.textContent = '编辑后下载 HTML；发布需替换仓库文件';
    const save = document.createElement('button'); save.textContent = '下载修改后的 HTML';
    const exit = document.createElement('a'); exit.href = location.pathname; exit.textContent = '退出编辑';
    bar.append(label, save, exit); document.body.append(bar);
    save.addEventListener('click', () => {
      const clone = root.cloneNode(true); clone.removeAttribute('data-theme'); clone.querySelector('body').classList.remove('edit-mode');
      clone.querySelectorAll('.editor-bar, .lightbox-wrap').forEach((node) => node.remove());
      clone.querySelectorAll('[contenteditable]').forEach((node) => node.removeAttribute('contenteditable'));
      const url = URL.createObjectURL(new Blob(['<!DOCTYPE html>\n' + clone.outerHTML], { type: 'text/html;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = location.pathname.split('/').pop() || 'index.html';
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
})();
