import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const renderer=path.resolve('scripts/render-article.mjs');
function render(body, extra=""){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'article-test-'));
 const input=path.join(dir,'article.md');
 fs.writeFileSync(input,`---\ntitle: "Test"\nsummary: "Test"\nslug: "${path.basename(dir)}"\nstatus: "${extra ? "published" : "draft"}"\n${extra}---\n${body}`);
 const result=spawnSync(process.execPath,[renderer,input],{encoding:'utf8'});
 const html=fs.existsSync(path.join(dir,'index.html'))?fs.readFileSync(path.join(dir,'index.html'),'utf8'):'';
 fs.rmSync(dir,{recursive:true,force:true});return {...result,html};
}
test('comparison renders two existing-style cards and Markdown content',()=>{
 const r=render(':::comparison\n### Stability\n**Stable** sampling.\n\n### Dispersion\n- Resolve wavelengths\n:::');
 assert.equal(r.status,0,r.stderr);assert.equal((r.html.match(/class="mini-essay-card"/g)||[]).length,2);assert.match(r.html,/<strong>Stable<\/strong>/);assert.match(r.html,/<li>Resolve wavelengths<\/li>/);
});
for(const body of ['### One\nOnly one card','### One\n\n### Two\nContent','### One\nContent\n### Two\nContent\n### Three\nExtra'])test('rejects malformed comparison: '+body,()=>{
 const r=render(':::comparison\n'+body+'\n:::');assert.notEqual(r.status,0);assert.match(r.stderr,/exactly two ### headings/);assert.equal(r.html,'');
});
test('footnotes work across headings, prose, callouts, comparisons and tables',()=>{
 const r=render(`## A heading[^first]
Text[^same] and repeated[^same].

:::idea
An idea[^idea].
:::

:::comparison
### First
Card[^card].
### Second
Other.
:::

| Column |
| --- |
| Cell[^cell] |

[^first]: Heading note.
[^same]: **Formatted** note with [source](https://example.com).
[^idea]: Note with $x^2$.
[^card]: Card note.
[^cell]: Table note.`);
 assert.equal(r.status,0,r.stderr);
 for(const id of ['first','same','idea','card','cell'])assert.match(r.html,new RegExp(`id="fn-${id}"`));
 assert.match(r.html,/href="#fnref-same-2"/);
 assert.match(r.html,/<strong>Formatted<\/strong>/);
 assert.ok(r.html.includes('\\(x^2\\)'));
 assert.equal((r.html.match(/id="fnref-first-1"/g)||[]).length,1);
 assert.doesNotMatch(r.html,/PLACEHOLDER/);
});
test('code examples keep literal footnote and math syntax; prose uses div callouts and apostrophes',()=>{
 const r=render("Don't change prose.\n\n:::idea\nIt's an idea.\n:::\n\n`[^unknown] $x$`\n\n```text\n[^missing]: literal\n$x$\n:::idea\n```\n");
 assert.equal(r.status,0,r.stderr);assert.match(r.html,/<div class="essay-callout">/);assert.doesNotMatch(r.html,/<aside class="essay-callout"|&#39;/);
 assert.match(r.html,/<code>\[\^unknown\] \$x\$<\/code>/);
 assert.match(r.html,/<pre><code class="language-text">\[\^missing\]: literal\n\$x\$\n:::idea\n<\/code><\/pre>/);
});
for(const body of ['Missing[^missing].','Reference[^a].\n\n[^a]: First\n[^a]: Duplicate','Reference[^a].\n\n[^a]: Nested[^b]\n[^b]: Other'])test('invalid footnote reports an error',()=>{
 const r=render(body);assert.notEqual(r.status,0);assert.equal(r.html,'');
});

test('published metadata preserves title, breadcrumb, dates and separate subject/topic',()=>{
 const r=render("Text.", 'publication_date: "2026-10-14"\nupdated_date: "2026-10-16"\npage_title: "Original Page Title"\nbreadcrumb: "ORIGINAL CRUMB"\ntype: "Explainer"\nsubject: "Geophysics"\ntopic: "Numerical methods"\n');
 assert.equal(r.status,0,r.stderr);
 assert.match(r.html,/<title>Original Page Title · Khalid Almuteri<\/title>/);
 assert.match(r.html,/ORIGINAL CRUMB<\/span>/);
 assert.match(r.html,/<meta name="date" content="2026-10-14">/);
 assert.match(r.html,/<meta name="last-modified" content="2026-10-16">/);
 assert.match(r.html,/EXPLAINER · GEOPHYSICS/);
 assert.match(r.html,/<span>Numerical methods<\/span>/);
});

test('HTML compaction preserves whitespace between inline phrases',()=>{
 const r=render('*First*\n**second**');assert.equal(r.status,0,r.stderr);assert.match(r.html,/<em>First<\/em>\s+<strong>second<\/strong>/);
});
