import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const dryRun=args.includes('--dry-run');
const inputs=args.filter(arg=>arg!=='--dry-run');
const read=p=>fs.readFileSync(p,'utf8');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const plain=s=>s.replace(/\*([^*]+)\*/g,'$1').replaceAll('|',' ').replace(/\s+/g,' ').trim();
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'') && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;
function list(html,cls){
 const re=new RegExp(`(<div class="${cls}">)([\\s\\S]*?)(</div>)`);
 const matches=[...html.matchAll(new RegExp(re.source,'g'))];
 if(matches.length!==1)throw Error(`Expected one ${cls} container; no files changed`);
 const rows=matches[0][2].match(/<a\b[\s\S]*?<\/a>/g)||[];
 if(matches[0][2].replace(/<a\b[\s\S]*?<\/a>/g,'').trim())throw Error(`Unexpected content in ${cls}`);
 return {rows,replace:rows=>html.replace(re,(_,a,b,c)=>a+rows.join('')+c)};
}
let temp;
try {
 if(inputs.length!==1||inputs[0].startsWith('--'))throw Error('Usage: node scripts/publish-article.mjs writings/slug/slug.md [--dry-run]');
 const input=fs.realpathSync(path.resolve(inputs[0]));
 const relative=path.relative(fs.realpathSync(root),input);
 if(!/^writings\/[a-z0-9]+(?:-[a-z0-9]+)*\/[^/]+\.md$/.test(relative))throw Error('Input must be a Markdown file directly inside writings/<slug>/');
 const slug=relative.split('/')[1];
 const front=read(input).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
 if(!front)throw Error('Missing metadata block');
 const meta={};
 for(const line of front[1].split(/\r?\n/)){
  if(!line.trim()||line.trim().startsWith('#'))continue;
  const m=line.match(/^([a-z_]+):\s*(.*)$/);if(!m)throw Error('Invalid metadata line');
  if(Object.hasOwn(meta,m[1]))throw Error(`Duplicate metadata: ${m[1]}`);
  meta[m[1]]=m[2].startsWith('"')?JSON.parse(m[2]):m[2];
  if(typeof meta[m[1]]!=='string')throw Error('Metadata values must be strings');
 }
 const category=meta.category ?? 'technical';
 if(!['technical','essay'].includes(category))throw Error('category must be technical or essay');
 if(meta.status!=='published')throw Error('Set status: "published" before publishing; use render-article.mjs for drafts');
 if(meta.slug!==slug)throw Error('slug must match its containing directory');
 for(const key of ['title','summary','topic'])if(!meta[key]?.trim())throw Error(`Missing ${key}`);
 if(!validDate(meta.publication_date)||meta.updated_date&&!validDate(meta.updated_date))throw Error('Use real calendar dates in YYYY-MM-DD format');
 const writingPath=path.join(root,'writings/index.html'),homePath=path.join(root,'index.html'),mapPath=path.join(root,'sitemap.xml');
 const writing=list(read(writingPath),'writing-list'),home=list(read(homePath),'post-list'),sitemap=read(mapPath);
 if((sitemap.match(/<\/urlset>/g)||[]).length!==1)throw Error('Invalid sitemap');
 temp=fs.mkdtempSync(path.join(os.tmpdir(),'publish-article-'));
 const generated=path.join(temp,'index.html');
 const result=spawnSync(process.execPath,[path.join(root,'scripts/render-article.mjs'),input,'--output',generated],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr||'Article rendering failed');
 const html=read(generated);
 const minutes=html.match(/~(\d+) min read/i)?.[1];if(!minutes)throw Error('Missing rendered reading time');
 const date=meta.publication_date;
 const time=`<time datetime="${date}">${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date))}</time>`;
 const title=escape(plain(meta.title));
 const newRow=`<a href="${slug}/" class="writing-row" data-category="${category}"><span class="writing-bullet">00</span><span><small>${escape((meta.type||'Essay').toUpperCase())} · ${escape(meta.topic.toUpperCase())} · ${minutes} MIN READ · ${time}</small><strong>${title}</strong><span>${escape(meta.summary)}</span></span><b>↗</b></a>`;
 const route=row=>row.match(/href="([^"]+)"/)?.[1];
 const rows=writing.rows.filter(row=>route(row)!==`${slug}/`);
 rows.push(newRow);
 for(const row of rows)if(!row.match(/datetime="\d{4}-\d{2}-\d{2}"/)||!row.includes('class="writing-row"'))throw Error('Unrecognized Writing row');
 rows.sort((a,b)=>b.match(/datetime="([^"]+)"/)[1].localeCompare(a.match(/datetime="([^"]+)"/)[1]));
 const numbered=rows.map((row,i)=>row.replace(/(<span class="writing-bullet">)[^<]*(<\/span>)/,`$1${String(i+1).padStart(2,'0')}$2`));
 const homeRows=rows.slice(0,3).map(row=>{
  const href='writings/'+route(row);
  const existing=home.rows.find(r=>route(r)===href);
  if(existing&&href!==`writings/${slug}/`)return existing;
  const heading=row.match(/<strong>([\s\S]*?)<\/strong>/)[1];
  const stamp=row.match(/<time[\s\S]*?<\/time>/)[0];
  const topic=href===`writings/${slug}/`?escape(meta.topic.toUpperCase()):row.match(/<small>[^·]*·\s*([^·]*)/)?.[1].trim()||'ARTICLE';
  return `<a class="post-list-item" href="${href}"><span class="list-cat">${topic} · ${stamp}</span><span class="list-title">${heading}</span><span class="list-arrow">↗</span></a>`;
 });
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 if(!canonical)throw Error('Missing canonical URL');
 const entry=`  <url><loc>${canonical}</loc></url>\n`;
 const map=sitemap.replace(/\s*<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g,(all,url)=>url===canonical?'':all).replace(/\s*<\/urlset>/,'\n'+entry+'</urlset>');
 const outputs=new Map([[path.join(path.dirname(input),'index.html'),html],[writingPath,writing.replace(numbered)],[homePath,home.replace(homeRows)],[mapPath,map]]);
 const changed=[...outputs].filter(([file,text])=>!fs.existsSync(file)||read(file)!==text);
 console.log(`${dryRun?'Dry run: would update':'Publishing locally:'} ${slug}`);
 for(const [file] of changed)console.log('  '+path.relative(root,file));
 if(!dryRun){
  const backups=changed.map(([file])=>[file,fs.existsSync(file)?fs.readFileSync(file):null]);
  try{for(const [file,text] of changed)fs.writeFileSync(file,text);}
  catch(error){for(const [file,bytes] of backups){if(bytes===null)fs.rmSync(file,{force:true});else fs.writeFileSync(file,bytes);}throw error;}
 }
 if(!changed.length)console.log('  Already up to date.');
 console.log('No commit or push performed. Review changes before deploying.');
}catch(error){console.error(error.message);process.exitCode=1;}
finally{if(temp)fs.rmSync(temp,{recursive:true,force:true});}
