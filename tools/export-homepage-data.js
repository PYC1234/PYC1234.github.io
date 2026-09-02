// export-homepage-data.js — 从 job-records.json 导出压缩快照到 homepage/index.html
// 用法：node homepage/tools/export-homepage-data.js
// 位于 homepage/ 内运行时：node tools/export-homepage-data.js

const fs = require('fs');
const path = require('path');

const HOME = path.join(__dirname, '..');
const SOURCE = path.join(__dirname, '..', '..', 'job-records.json');

const records = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

// 只保留图表需要的最小字段，丢弃 jdAnalysis/notes/interviewNotes 等大字段
const snapshot = records
  .filter(r => r && r.company)
  .map(r => ({
    company: r.company,
    position: r.position || '',
    type: r.type || '',
    date: r.date || '',
    status: r.status || '',
  }));

const jsonLine = JSON.stringify(snapshot);

const htmlPath = path.join(HOME, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const newHtml = html.replace(
  /(<script type="application\/json" id="homepage-job-data">)[\s\S]*?(\n?<\/script>)/,
  '$1\n' + jsonLine + '\n$2'
);

if (newHtml !== html) {
  fs.writeFileSync(htmlPath, newHtml);
  console.log(`index.html: synced (${snapshot.length} records)`);
} else {
  console.log(`index.html: no change (data unchanged, ${snapshot.length} records)`);
}