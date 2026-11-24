// 지난 슈퍼샷(v88, 대표 2026-11-24 07:25) 검사: 평생권은 지나간 판을 몇 번이든 다시 침(출석·호외·오늘 기록 안 건드림), 무료는 목록만·누르면 결제
const {chromium,devices}=require('playwright');
const R=[]; const ok=(n,c,i)=>{ R.push(!!c); console.log((c?'통과':'실패'),n,i!==undefined?JSON.stringify(i):''); };
async function page(br,pass){ const ctx=await br.newContext({...devices['iPhone 13']}); const pg=await ctx.newPage(); pg.errs=[]; pg.on('pageerror',e=>pg.errs.push(e.message));
  await pg.goto((process.env.BASE||'http://localhost:8765')+'/index.html?sim'); await pg.evaluate(p=>{ localStorage.clear(); localStorage.setItem('opg_lesson_done','1'); if(p) localStorage.setItem('opg_pass','1'); },pass); await pg.reload(); await pg.waitForTimeout(3800); return pg; }
const done=pg=>pg.evaluate(()=>{ const T=__pg.TODAY; localStorage.setItem('opg_ss',JSON.stringify({date:T,cur:3,ex:0,s:[{used:4,won:true},{used:4},{used:4}]})); localStorage.setItem('opg_ss_log',JSON.stringify({[T]:'win'})); document.querySelectorAll('.screen').forEach(e=>e.hidden=true); document.getElementById('start').hidden=false; __pg.SSUI.refresh(); });
const vis=(pg,id)=>pg.evaluate(id=>{ const e=document.getElementById(id); return !!e&&!e.hidden; },id);
(async()=>{ const br=await chromium.launch();
 let pg=await page(br,true); await done(pg); await pg.click('#ssStartBtn'); await pg.waitForTimeout(300);
 ok('출석부에 「지난 슈퍼샷 다시 치기」', await vis(pg,'ssAlbumBtn')); await pg.click('#ssAlbumBtn'); await pg.waitForTimeout(300);
 const a=await pg.evaluate(()=>({n:document.querySelectorAll('#ssAlbumList button').length, p:document.getElementById('ssAlbumP').textContent, lv:__pg.SSUI.pastLevels().map(l=>l.id), today:__pg.SSUI.todayLevels().map(l=>l.id)}));
 ok('평생권: 목록에 오늘까지 나온 판(오늘 3판 포함, 겹침 없음)', a.n===a.lv.length && a.n>=3 && a.today.every(id=>a.lv.includes(id)) && new Set(a.lv).size===a.lv.length, a);
 await pg.click('#ssAlbumList button >> nth=1'); await pg.waitForTimeout(500);
 const r=await pg.evaluate(()=>({ss:!document.getElementById('ss').hidden, name:document.getElementById('ssName').textContent}));
 ok('평생권: 누르면 그 판을 「지난 슈퍼샷」으로 침', r.ss && /지난 슈퍼샷/.test(r.name), r);
 const before=await pg.evaluate(()=>[localStorage.getItem('opg_ss'),localStorage.getItem('opg_ss_log')]);
 await pg.evaluate(()=>{ const e=document.getElementById('ss'); }); // 판 하나 끝까지: 연습 3번 + 도전 1번을 빠르게 넘김
 for(let k=0;k<4;k++){ await pg.mouse.move(195,400); await pg.mouse.down(); await pg.mouse.move(195,480,{steps:4}); await pg.mouse.up(); await pg.waitForTimeout(4500); }
 ok('다시 치기 결과 카드가 뜸', await vis(pg,'ssMid'), await pg.evaluate(()=>document.getElementById('ssNext').textContent));
 ok('결과 카드 버튼 「다른 판 고르기」', /다른 판 고르기/.test(await pg.evaluate(()=>document.getElementById('ssNext').textContent)));
 await pg.click('#ssNext'); await pg.waitForTimeout(500);
 ok('다른 판 고르기 → 지난 슈퍼샷 목록으로', await vis(pg,'ssAlbum') && !(await vis(pg,'ss')));
 const after=await pg.evaluate(()=>[localStorage.getItem('opg_ss'),localStorage.getItem('opg_ss_log')]);
 ok('다시 치기는 오늘 판·출석부를 안 건드림', before[0]===after[0] && before[1]===after[1], {before,after});
 ok('호외 안 뜸', !(await pg.evaluate(()=>__pg.paper.isOpen())));
 await pg.click('#ssAlbumBack'); await pg.waitForTimeout(300); ok('목록 돌아가기 → 출석부', await vis(pg,'ssEnd'));
 await pg.click('#ssAlbumBtn'); await pg.waitForTimeout(300); await pg.click('#ssAlbumList button >> nth=0'); await pg.waitForTimeout(400); await pg.click('#ssClose'); await pg.waitForTimeout(300);
 ok('치는 중 나가기 → 목록으로(오늘 판으로 안 감)', await vis(pg,'ssAlbum') && !(await vis(pg,'start')));
 ok('평생권: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 pg=await page(br,false); await done(pg); await pg.click('#ssStartBtn'); await pg.waitForTimeout(300); await pg.click('#ssAlbumBtn'); await pg.waitForTimeout(300);
 const f=await pg.evaluate(()=>({t:document.querySelector('#ssAlbumList button').textContent, p:document.getElementById('ssAlbumP').textContent}));
 ok('무료: 목록은 보이고 자물쇠·평생권 안내', /🔒/.test(f.t) && /평생권/.test(f.p), f);
 await pg.click('#ssAlbumList button >> nth=0'); await pg.waitForTimeout(400);
 ok('무료: 누르면 결제 화면(판은 안 열림)', await vis(pg,'payScreen') && !(await vis(pg,'ss')) && !(await vis(pg,'ssAlbum')));
 ok('무료: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 const bad=R.filter(x=>!x).length; console.log(bad?'실패 '+bad+'개':'모두 통과 ('+R.length+'개)'); await br.close(); process.exit(bad?1:0); })();
