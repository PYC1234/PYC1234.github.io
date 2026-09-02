# 彭远超 · 个人主页

部署在 GitHub Pages 的纯静态个人主页（`PYC1234.github.io`），介绍经历 + 求职数据可视化。零依赖：纯 HTML/CSS/JS，手写 SVG 图表，数据全内联，离线可用。

## 目录

```
index.html                 # 单页站点（内联投递快照 <script id="homepage-job-data">）
css/style.css              # 样式 + light/dark 双主题设计令牌
js/main.js                 # 主题切换、导航、4 张 SVG 图表、57 行投递表格
tools/export-homepage-data.js  # 从 ../job-records.json 同步投递快照
```

## 本地预览

直接双击 `index.html` 用浏览器打开（数据已内联，`file://` 可跑，无 fetch 跨域问题）。

## 数据更新

秋招记录变更后，重新同步快照再部署：

```
node homepage/tools/export-homepage-data.js
```

脚本读 `job-records.json`，只导出 `{company, position, type, date, status}` 子集，替换
`index.html` 中的内联数据块，聚合数字（趋势/漏斗/类型/公司分布）由页面 JS 运行时计算。

## 部署（无 gh CLI，纯手动）

1. github.com → New repository → 仓库名**必须精确**为 `PYC1234.github.io` → Public → 创建。
2. 命令行：

   ```bash
   cd homepage
   git init
   git add .
   git commit -m "init homepage"
   git branch -M main
   git remote add origin https://github.com/PYC1234/PYC1234.github.io.git
   git push -u origin main
   ```

3. 仓库 Settings → Pages → Source 选 **Deploy from a branch** → 分支 **main** → 目录 **/ (root)** → Save。
4. 访问 `https://PYC1234.github.io/`（首次生效约 1 分钟）。

## 更新流程

改内容（`index.html`/`css/`/`js/`）或改数据（先跑导出脚本）→ `git add . && git commit -m "..." && git push`，Pages 自动重新部署。