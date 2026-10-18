import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('../assets/continue-reading.js',import.meta.url),'utf8');
async function run({rows=['current','one','two'],previous,ok=true,storage=true}={}){
 const section={children:['fallback'],replaceChildren(...children){this.children=children;}};
 const body={querySelector:()=>section};
 const context={URL,Map,Math:{random:()=>0,floor:Math.floor},location:{href:'https://example.org/writing/current/',pathname:'/writing/current/',origin:'https://example.org'},document:{querySelector:()=>body,createElement:()=>({})},fetch:async()=>({ok,text:async()=>''}),DOMParser:class{parseFromString(){return {querySelectorAll:()=>rows.map(slug=>({getAttribute:()=>slug+'/',querySelector:()=>({textContent:slug})}))};}},sessionStorage:{getItem:()=>{if(!storage)throw Error();return previous;},setItem:(_key,value)=>{if(!storage)throw Error();context.saved=value;}}};
 await vm.runInNewContext(code,context);return {section,saved:context.saved};
}
test('excludes current article and changes choice on refresh',async()=>{const a=await run();assert.equal(a.saved,'/writing/one/');const b=await run({previous:a.saved});assert.equal(b.saved,'/writing/two/');});
test('one alternative remains usable; no alternatives hides the section',async()=>{assert.equal((await run({rows:['current','one'],previous:'/writing/one/'})).saved,'/writing/one/');assert.equal((await run({rows:['current']})).section.hidden,true);});
test('unavailable index preserves authored fallback',async()=>{assert.deepEqual((await run({ok:false})).section.children,['fallback']);});
test('storage restrictions do not prevent recommendation',async()=>{assert.equal((await run({storage:false})).section.children[1].href,'/writing/one/');});
