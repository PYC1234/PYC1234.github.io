# 彭远超 · 个人主页

部署在 GitHub Pages 的纯静态个人主页（`PYC1234.github.io`），介绍经历 + 可视化个人产出。零依赖：纯 HTML/CSS/JS，离线可用，`file://` 直接打开即可预览。

## 目录

```
index.html                 # 单页站点（含「产出展示」占位区）
css/style.css              # 样式 + light/dark 双主题设计令牌
js/main.js                 # 主题切换 + 移动端导航
```

## 本地预览

直接双击 `index.html` 用浏览器打开（数据已内联，`file://` 可跑，无 fetch 跨域问题）。

## 产出展示图替换

「产出展示」区目前是占位框。替换方法：

1. 把产出图（截图、看板、架构图、Demo 封面等）放进仓库，例如 `assets/output.png`。
2. 编辑 `index.html` 中 `section#output` 内的 `.output-placeholder` 块，换成：

   ```html
   <div class="output-frame">
     <img src="assets/output.png" alt="产出总览" style="width:100%;border-radius:8px;display:block;">
   </div>
   ```

3. 提交推送后自动生效。后续补充更多产出时，在该区块内继续追加图片即可。

## 数字人管线技术版本（2025-12 落地事实，勿写成后续规划版本）

实习在熙硅（2025.10–2025.12）期间实际使用的生成模型版本：

| 环节 | 实际版本 | 注意 |
|---|---|---|
| 音频 | B 站 TTS（内部代号「TTS 2.0」，支持 8 维情绪权重 + 语气参数 + 文本描述增强） | 「TTS 2.0」是 B 站模型的内部自定义代号；不是 CosyVoice / GLM-TTS |
| 图片 | Gemini 3-preview + 即梦 Seedance 1.5 Pro | 「即梦 2.0」为后续发布，当时无正式权重 |
| 视频 | 通义万相 Wan2.2（当时开源侧可用版本） | 「Wan2.6 / wan2.3」均为后期规划版本，当时未落地 |

三处模型版本以本表为准。生成相关可视化 / 简历描述时，勿写成 2025-12 尚未发布的最新版。

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

改内容（`index.html`/`css/`/`js/`）→ `git add . && git commit -m "..." && git push`，Pages 自动重新部署。

## 说明

秋招投递记录（`job-records.json`）属于私人数据，**不部署到主页**；如需在主页展示数据类产出，请使用脱敏后的成果截图或自行构造的可视化素材。