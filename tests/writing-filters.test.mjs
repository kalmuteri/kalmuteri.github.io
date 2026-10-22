import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('assets/writing-filters.js','utf8');
function setup(categories,query='',section='writings'){
 const buttons=['all','technical','essay'].map(filter=>({dataset:{filter},setAttribute(key,value){this[key]=value;},addEventListener(event,fn){this.click=fn;}}));
 const rows=categories.map((category,i)=>({dataset:{category},textContent:['Wave physics computation','Physics and AI','Reflection café'][i]}));
 const group={hidden:true,querySelectorAll:()=>buttons},count={},empty={};
 const input={value:'',addEventListener(event,fn){this.input=fn;},focus(){this.focused=true;}};
 const clear={addEventListener(event,fn){this.click=fn;}};
 const tools={hidden:true,dataset:{items:'.writing-row',singular:section==='writings'?'piece':section,plural:section==='writings'?'pieces':section+'s'},querySelector:s=>({'.writing-filters':section==='writings'?group:null,'input[type="search"]':input,'.search-clear':clear}[s])};
 const location={href:'https://example.com/'+section+'/'+query};const events={};
 vm.runInNewContext(source,{URL,location,history:{replaceState(a,b,url){location.href=String(url);}},window:{addEventListener(event,fn){events[event]=fn;}},document:{querySelector:s=>({'.section-tools':tools,'.writing-count':count,'.writing-empty':empty}[s]),querySelectorAll:()=>rows}});
 return {buttons,rows,group,count,empty,location,events,input,clear,tools};
}
test('category and search combine; state restores on navigation',()=>{
 const f=setup(['technical','technical','essay']);assert.equal(f.count.textContent,'3 pieces');
 f.buttons[2].click();assert.deepEqual(f.rows.map(r=>r.hidden),[true,true,false]);assert.equal(f.count.textContent,'1 piece');
 f.input.value='wave';f.input.input();assert.equal(f.count.textContent,'0 pieces');assert.equal(f.empty.hidden,false);
 f.buttons[0].click();assert.equal(f.count.textContent,'1 piece');assert.match(f.location.href,/q=wave/);
 f.location.href='https://example.com/writings/?filter=technical&q=AI';f.events.pageshow();assert.deepEqual(f.rows.map(r=>r.hidden),[true,false,true]);assert.equal(f.input.value,'AI');
 f.clear.click();assert.equal(f.count.textContent,'2 pieces');assert.equal(f.input.focused,true);assert.doesNotMatch(f.location.href,/q=/);
});
test('case, diacritics, multiple terms, invalid filters, and empty categories',()=>{
 const f=setup(['technical','technical','essay'],'?q=CAFE%20reflection&filter=invalid');assert.equal(f.count.textContent,'1 piece');
 const g=setup(['technical'],'?filter=essay');assert.equal(g.empty.hidden,false);assert.match(g.empty.textContent,/category/);
});
for(const section of ['lab','guide'])test(`${section} search works without category buttons`,()=>{
 const f=setup(['technical'],'?q=physics',section);assert.equal(f.count.textContent,'1 '+section);assert.equal(f.tools.hidden,false);
 f.input.value='no match';f.input.input();assert.equal(f.count.textContent,'0 '+section+'s');assert.equal(f.empty.hidden,false);
 f.clear.click();assert.equal(f.count.textContent,'1 '+section);
});
