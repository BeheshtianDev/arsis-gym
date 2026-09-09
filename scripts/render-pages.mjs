import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage, renderHeader, renderFooter } from '../dist/assets/app.js';
import { validateContent, escapeHTML as e } from '../dist/assets/content.js';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(project,'dist');
const d=validateContent(JSON.parse(fs.readFileSync(path.join(dist,'content.json'),'utf8')));
const routes=[
  ['home','index.html','باشگاه ورزشی آقایان در چیتگر','آرسیس؛ باشگاه ورزشی آقایان در محدوده دریاچه چیتگر، با فضای بدنسازی، کراس‌فیت، سونا و جکوزی. معرفی امکانات، مربیان و پلن‌های عضویت.'],
  ['plans','plans.html','پلن‌های عضویت','مقایسه پلن‌های عادی، وی‌آی‌پی و کراس‌فیت آرسیس بر اساس تعداد جلسات، مهلت استفاده و هزینه هر جلسه.'],
  ['team','team.html','مربیان و مدیریت','آشنایی با مربیان بدنسازی، کراس‌فیت و تیم مدیریت باشگاه ورزشی آرسیس.'],
  ['contact','contact.html','تماس با ما','راه‌های تماس، ساعات فعالیت و نشانی باشگاه ورزشی آقایان آرسیس در محدوده دریاچه چیتگر.']
];
for(const [page,file,title,description] of routes){
  const html=`<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#95d4db">
  <title>${e(title)} | ${e(d.brand.name)}</title>
  <meta name="description" content="${e(description)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:title" content="${e(title)} | ${e(d.brand.name)}">
  <meta property="og:description" content="${e(description)}">
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="./assets/fonts/Vazirmatn.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="./assets/site.css">
  <link rel="stylesheet" href="./assets/brand.css">
  <script type="module" src="./assets/app.js"></script>
</head>
<body data-page="${page}">
  <a class="skip-link" href="#main">رفتن به محتوای اصلی</a>
  <div id="site-header">${renderHeader(d,page)}</div>
  <main id="main">${renderPage(page,d)}</main>
  <div id="site-footer">${renderFooter(d)}</div>
  <noscript><p class="container fine-print">برای نمایش آخرین تغییرات، منوی موبایل، انتخاب دسته پلن‌ها و بزرگ‌نمایی گالری، جاوااسکریپت مرورگر را فعال کنید.</p></noscript>
</body>
</html>
`;
  fs.writeFileSync(path.join(dist,file),html);
}
console.log('Rendered four complete Persian HTML pages with shared client-side content updates.');
