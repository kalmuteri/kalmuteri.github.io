import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const renderer=path.resolve('scripts/render-article.mjs');
function render(body){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'article-test-'));
 const input=path.join(dir,'article.md');
 fs.writeFileSync(input,`---\ntitle: "Test"\nsummary: "Test"\nslug: "${path.basename(dir)}"\nstatus: "draft"\n---\n${body}`);
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
