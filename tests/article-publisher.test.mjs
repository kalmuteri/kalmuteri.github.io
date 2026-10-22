import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve('.');
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'publisher-test-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const file of ['scripts/publish-article.mjs','scripts/render-article.mjs','templates/article.html','writings/index.html','index.html','sitemap.xml']){
  fs.mkdirSync(path.dirname(path.join(dir,file)),{recursive:true});fs.copyFileSync(path.join(root,file),path.join(dir,file));
 }
 fs.mkdirSync(path.join(dir,'writings/test-article'));
 const input=path.join(dir,'writings/test-article/test-article.md');
 const source='---\ntitle: "Test & *learn*"\nsummary: "A <sample>"\nslug: "test-article"\nstatus: "published"\npublication_date: "2026-10-19"\ntopic: "Numerical methods"\n---\n## Example\nA paragraph.\n';
 fs.writeFileSync(input,source);
 const module=process.env.MARKED_MODULE||path.join(root,'scripts/node_modules/marked/lib/marked.esm.js');
 const run=(...args)=>spawnSync(process.execPath,['scripts/publish-article.mjs',input,...args],{cwd:dir,encoding:'utf8',env:{...process.env,MARKED_MODULE:module}});
 const read=file=>fs.readFileSync(path.join(dir,file),'utf8');
 const snapshot=()=>['writings/index.html','index.html','sitemap.xml'].map(read);
 return {dir,input,source,run,read,snapshot};
}
test('dry run writes nothing; publication updates all destinations; repeat is idempotent',t=>{
 const f=fixture(t),before=f.snapshot();
 let r=f.run('--dry-run');assert.equal(r.status,0,r.stderr);assert.deepEqual(f.snapshot(),before);assert.equal(fs.existsSync(path.join(f.dir,'writings/test-article/index.html')),false);
 r=f.run();assert.equal(r.status,0,r.stderr);
 assert.match(f.read('writings/index.html'),/href="test-article\/"/);
 assert.match(f.read('index.html'),/href="writings\/test-article\/"/);
 assert.match(f.read('sitemap.xml'),/https:\/\/kalmuteri.github.io\/writings\/test-article\//);
 assert.match(f.read('writings/test-article/index.html'),/index,follow/);
 assert.match(f.read('writings/index.html'),/Test &amp; learn/);
 const after=f.snapshot();r=f.run();assert.equal(r.status,0,r.stderr);assert.deepEqual(f.snapshot(),after);assert.match(r.stdout,/Already up to date/);
 fs.writeFileSync(f.input,f.source.replace('A <sample>','Changed summary'));
 r=f.run();assert.equal(r.status,0,r.stderr);assert.match(f.read('writings/index.html'),/Changed summary/);assert.equal(f.read('writings/index.html').split('href="test-article/"').length-1,1);
});
for(const [name,change] of [
 ['draft',s=>s.replace('"published"','"draft"')],
 ['invalid date',s=>s.replace('2026-10-19','2026-02-30')],
 ['missing figure',s=>s+'\n:::figure\n![Missing](missing.png)\nCaption\n:::\n']
])test(`${name} leaves site unchanged`,t=>{
 const f=fixture(t),before=f.snapshot();fs.writeFileSync(f.input,change(f.source));const r=f.run();assert.notEqual(r.status,0);assert.deepEqual(f.snapshot(),before);assert.equal(fs.existsSync(path.join(f.dir,'writings/test-article/index.html')),false);
});
test('unexpected listing structure fails before writing article',t=>{
 const f=fixture(t);fs.writeFileSync(path.join(f.dir,'index.html'),f.read('index.html').replace('class="post-list"','class="unexpected"'));const before=f.snapshot();assert.notEqual(f.run().status,0);assert.deepEqual(f.snapshot(),before);
});
test('older publication stays below recent articles and other page content is preserved',t=>{
 const f=fixture(t),before=f.snapshot();fs.writeFileSync(f.input,f.source.replace('2026-10-19','2020-01-01'));
 const r=f.run();assert.equal(r.status,0,r.stderr);
 const writing=f.read('writings/index.html');assert.ok(writing.indexOf('href="physics-and-ai/"')<writing.indexOf('href="test-article/"'));
 assert.equal((f.read('index.html').match(/class="post-list-item"/g)||[]).length,3);
 const strip=(s,cls)=>s.replace(new RegExp(`<div class="${cls}">[\\s\\S]*?</div>`),'LIST');
 assert.equal(strip(before[0],'writing-list'),strip(writing,'writing-list'));
 assert.equal(strip(before[1],'post-list'),strip(f.read('index.html'),'post-list'));
});
test('category is independent of type and can be updated without duplicates',t=>{
 const f=fixture(t);
 fs.writeFileSync(f.input,f.source.replace('topic:', 'type: "Perspective"\ncategory: "essay"\ntopic:'));
 let r=f.run();assert.equal(r.status,0,r.stderr);
 assert.match(f.read('writings/index.html'),/href="test-article\/" class="writing-row" data-category="essay"/);
 assert.match(f.read('writings/index.html'),/PERSPECTIVE/);
 fs.writeFileSync(f.input,f.source.replace('topic:', 'category: "technical"\ntopic:'));
 r=f.run();assert.equal(r.status,0,r.stderr);
 assert.match(f.read('writings/index.html'),/href="test-article\/" class="writing-row" data-category="technical"/);
 assert.equal(f.read('writings/index.html').split('href="test-article/"').length-1,1);
});
test('invalid categories fail without changing listings',t=>{
 const f=fixture(t),before=f.snapshot();
 fs.writeFileSync(f.input,f.source.replace('topic:', 'category: "invalid"\ntopic:'));
 assert.notEqual(f.run().status,0);assert.deepEqual(f.snapshot(),before);
});
