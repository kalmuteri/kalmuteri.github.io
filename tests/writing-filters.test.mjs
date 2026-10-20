import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('assets/writing-filters.js','utf8');
function setup(categories,query=''){
 const buttons=['all','technical','essay'].map(filter=>({dataset:{filter},setAttribute(key,value){this[key]=value;},addEventListener(event,fn){this.click=fn;}}));
 const rows=categories.map(category=>({dataset:{category}}));
 const group={hidden:true,querySelectorAll:()=>buttons},count={},empty={};
 const location={href:'https://example.com/writing/'+query};
 const events={};
 vm.runInNewContext(source,{URL,location,history:{replaceState(a,b,url){location.href=String(url);}},window:{addEventListener(event,fn){events[event]=fn;}},document:{querySelector:s=>({'.writing-filters':group,'.writing-count':count,'.writing-empty':empty}[s]),querySelectorAll:()=>rows}});
 return {buttons,rows,group,count,empty,location,events};
}
test('filters articles, updates counts and URL, and restores on navigation',()=>{
 const f=setup(['technical','technical','essay']);
 assert.equal(f.count.textContent,'3 pieces');assert.equal(f.group.hidden,false);
 f.buttons[2].click();assert.deepEqual(f.rows.map(r=>r.hidden),[true,true,false]);assert.equal(f.count.textContent,'1 piece');assert.match(f.location.href,/filter=essay/);
 assert.equal(f.buttons[2]['aria-pressed'],'true');
 f.location.href='https://example.com/writing/?filter=technical';f.events.pageshow();assert.deepEqual(f.rows.map(r=>r.hidden),[false,false,true]);
 f.buttons[0].click();assert.equal(f.count.textContent,'3 pieces');assert.equal(f.location.href,'https://example.com/writing/');
});
test('empty category has an explanation; invalid URL defaults to all',()=>{
 const f=setup(['technical'],'?filter=essay');assert.equal(f.empty.hidden,false);assert.equal(f.count.textContent,'0 pieces');
 const g=setup(['technical'],'?filter=invalid');assert.equal(g.rows[0].hidden,false);assert.equal(g.empty.hidden,true);
});
