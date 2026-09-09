import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateContent, comparePlans, safeURL, phoneURL, escapeHTML } from '../dist/assets/content.js';
import { renderPage } from '../dist/assets/app.js';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(project,'dist');
const data=validateContent(JSON.parse(fs.readFileSync(path.join(dist,'content.json'),'utf8')));
assert.equal(data.categories.length,3);
assert.deepEqual(data.categories.map(c=>c.plans.length),[5,5,5]);
for(const category of data.categories){
  const p=comparePlans(category.plans);
  assert.equal(p.filter(v=>v.best).length,1);
  assert.equal(p[0].saving,0);
  assert.ok(Math.abs(p[4].savingPercent-20)<1e-8);
  assert.equal(p[4].perSession,category.plans[4].price/category.plans[4].sessions);
}
const fixture=[
  {id:'a',price:100000,sessions:5,sample:false},
  {id:'b',price:100000,sessions:10,sample:false},
  {id:'c',price:150000,sessions:15,sample:false},
  {id:'d',price:1000,sessions:100,sample:true},
  {id:'e',price:null,sessions:20,sample:false},
  {id:'f',price:1000,sessions:0,sample:false}
];
const compared=comparePlans(fixture);
assert.equal(compared[0].best,false);
assert.equal(compared[1].perSession,10000);
assert.equal(compared[1].savingPercent,50);
assert.equal(compared[2].best,true);
assert.equal(compared[1].best,true);
assert.equal(compared[3].best,false,'One sample must not become best among actual-price plans.');
assert.equal(compared[4].perSession,null);
assert.equal(compared[5].perSession,null);
assert.equal(comparePlans([{price:100,sessions:4,sample:false}])[0].best,false);
assert.equal(safeURL('javascript:alert(1)','image'),'');
assert.equal(safeURL('//untrusted.example/image.png','image'),'');
assert.equal(safeURL('https://example.com/x.png','image'),'https://example.com/x.png');
assert.equal(safeURL('./assets/images/../secret.png','image'),'');
assert.equal(safeURL('./assets/images/photo.webp','image'),'./assets/images/photo.webp');
assert.equal(safeURL('https://username:password@example.com'),'');
assert.equal(phoneURL('۰۲۱ ۱۲۳۴ ۵۶۷۸'),'tel:02112345678');
assert.equal(phoneURL('not available'),'');
assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
const invalid=JSON.parse(JSON.stringify(data));invalid.categories[0].plans[0].sessions=0;
assert.throws(()=>validateContent(invalid));
invalid.categories[0].plans[0].sessions=8;invalid.categories[0].plans[0].price=-1;
assert.throws(()=>validateContent(invalid));
invalid.categories[0].plans[0].price=100000;invalid.contact.mapUrl='javascript:alert(1)';
assert.throws(()=>validateContent(invalid));
const hostile=JSON.parse(JSON.stringify(data));hostile.features[0].title='<img src=x onerror=alert(1)>';
const safeHTML=renderPage('home',hostile);
assert.ok(safeHTML.includes('&lt;img src=x onerror=alert(1)&gt;'));
assert.ok(!safeHTML.includes('<img src=x onerror=alert(1)>'));
const files=fs.readdirSync(dist).filter(f=>f.endsWith('.html'));
for(const file of files){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  assert.ok(html.includes('lang="fa" dir="rtl"'),file+' must be Persian RTL');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,file+' has duplicate IDs');
  for(const match of html.matchAll(/(?:href|src)="(\.\/[^"#?]+)(?:[?#][^"]*)?"/g)){
    assert.ok(fs.existsSync(path.resolve(dist,match[1])),file+' missing local reference '+match[1]);
  }
}
for(const file of ['index.html','plans.html','team.html','contact.html']){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  assert.equal([...html.matchAll(/<h1\b/g)].length,1,file+' must have one main heading');
  assert.ok(!/<form\b/i.test(html),file+' must not contain visitor forms');
}
const planHTML=fs.readFileSync(path.join(dist,'plans.html'),'utf8');
assert.equal([...planHTML.matchAll(/class="plan-card /g)].length,15);
assert.equal([...planHTML.matchAll(/role="tabpanel"/g)].length,3);
const localImages=[data.home.heroImage,data.brand.logo,...data.gallery.map(g=>g.image),...data.team.map(t=>t.image)].filter(v=>v&&!v.startsWith('https:'));
for(const asset of localImages)assert.ok(fs.existsSync(path.resolve(dist,asset)),'Missing configured image '+asset);
for(const style of ['site.css','editor.css','brand.css']){
  const css=fs.readFileSync(path.join(dist,'assets',style),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  for(const [,asset] of css.matchAll(/url\(['"]?(\.\/[^)'"\s]+)['"]?\)/g))assert.ok(fs.existsSync(path.resolve(dist,'assets',asset)),'Missing CSS asset '+asset);
}
const bytes=fs.statSync(path.join(dist,'assets/fonts/Vazirmatn.woff2')).size;
assert.ok(bytes>20000,'Font must contain the downloaded font bytes.');
console.log('PASS: 15 plans; arithmetic, ties, missing values, and sample isolation; import and URL validation; escaped content; Persian routes; local assets; and no visitor forms.');
