// 슈퍼샷 「한 판 더」(v85, 대표 2026-11-23 14:08) 검사: 오늘 3판 뒤 광고 한 편 = 한 판 더(무료 하루 3번), 평생권은 광고 없이 — 가짜 토스
const {chromium,devices}=require('playwright');
const MOCK=pass=>`window.AIT_CFG={ad:'g',sku:'s'}; window.__AIT_BUILD=1; window.__ad=0;
 window.AIT={ graniteEvent:{addEventListener(){return()=>{}}}, closeView(){}, Analytics:{log(){}}, Environment:{getDeploymentId(){return 'x'}},
  SafeAreaInsets:{get(){return {top:47,bottom:34}}}, File:{saveBase64:async()=>({})}, Notification:{requestAgreement:async()=>({status:'agreed'})},
  IAP:{getCompletedOrRefundedOrders:async()=>({orders:${pass?"[{sku:'s',status:'COMPLETED',orderId:'o1'}]":"[]"}}),getPendingOrders:async()=>({orders:[]}),createOneTimePurchaseOrder(){}},
  loadFullScreenAd(o){ setTimeout(()=>o.onEvent({type:'loaded'}),50) }, showFullScreenAd(o){ __ad++; setTimeout(()=>{o.onEvent({type:'userEarnedReward'});o.onEvent({type:'dismissed'})},50) } };`;
const R=[]; const ok=(n,c,i)=>{ R.push(!!c); console.log((c?'통과':'실패'),n,i!==undefined?JSON.stringify(i):''); };
async function page(br,pass){ const ctx=await br.newContext({...devices['iPhone 13']}); await ctx.addInitScript(MOCK(pass)); const pg=await ctx.newPage(); pg.errs=[]; pg.on('pageerror',e=>pg.errs.push(e.message));
  await pg.goto((process.env.BASE||'http://localhost:8765')+'/index.html?sim'); await pg.waitForTimeout(300);
  await pg.evaluate(p=>{ localStorage.clear(); if(p) localStorage.setItem('opg_pass','1'); },pass); await pg.reload(); await pg.waitForTimeout(3800); return pg; }
// 오늘 3판(또는 한 판 더까지) 끝난 상태를 저장값으로 만들고, 시작 화면 슈퍼샷 버튼(출석부)으로 들어감
const setDay=(pg,ex,lastWon,inStage)=>pg.evaluate(([ex,lastWon,inStage])=>{ const T=__pg.TODAY; const s=[{used:4,won:true},{used:4,more:1},{used:4}]; for(let i=0;i<ex;i++) s.push({used:5,more:1,won:i===ex-1&&lastWon});
  localStorage.setItem('opg_ss',JSON.stringify({date:T,cur:3+ex-(inStage?1:0),ex,s})); document.querySelectorAll('.screen').forEach(e=>e.hidden=true); document.getElementById('start').hidden=false; __pg.SSUI.refresh(); },[ex,lastWon,inStage]);
const vis=(pg,id)=>pg.evaluate(id=>{ const e=document.getElementById(id); return !!e&&!e.hidden; },id);
const txt=(pg,id)=>pg.evaluate(id=>document.getElementById(id).textContent,id);
(async()=>{ const br=await chromium.launch();
 let pg=await page(br,false);
 await setDay(pg,0); await pg.click('#ssStartBtn'); await pg.waitForTimeout(300);
 ok('무료: 3판 뒤 출석부에 「광고 보고 한 판 더 (3번 남음)」', await vis(pg,'ssExtra') && (await txt(pg,'ssExtra'))==='📺 광고 보고 한 판 더 (3번 남음)', await txt(pg,'ssExtra'));
 await pg.click('#ssExtra'); await pg.waitForTimeout(700);
 const st=await pg.evaluate(()=>({ss:!document.getElementById('ss').hidden, name:document.getElementById('ssName').textContent, d:JSON.parse(localStorage.getItem('opg_ss')), ad:__ad}));
 ok('무료: 광고 한 편 뒤 「한 판 더 1」 판이 열림(연습 3번부터)', st.ss && /한 판 더 1/.test(st.name) && st.d.ex===1 && st.d.s.length===4 && st.d.s[3].used===0 && st.ad===1, st);
 ok('한 판 더 판은 오늘 3판과 다른 판', await pg.evaluate(()=>{ const t=__pg.SSUI.todayLevels().map(l=>l.id); return !t.includes(__pg.SSUI.todayLevel().id); }));
 await pg.reload(); await pg.waitForTimeout(3800); ok('다시 켜도 한 판 더 상태 유지', await pg.evaluate(()=>{ const d=JSON.parse(localStorage.getItem('opg_ss')); return d.ex===1 && /한 번째|2번째|번째 판|한 판 더|연습/.test(document.getElementById('ssStartBtn').textContent) && !__pg.SSUI.available()===false; }));
 // 실패로 끝난 한 판 더 → 남은 수 2
 await setDay(pg,1,false,true); await pg.click('#ssStartBtn'); await pg.waitForTimeout(400);
 ok('한 판 더 실패: 「결과 보기」 카드', await vis(pg,'ssMid'), await txt(pg,'ssMidT')); await pg.click('#ssNext'); await pg.waitForTimeout(500);
 ok('한 판 더 실패 끝: 「아깝게 놓쳤어요」 + 남은 2번', /아깝게/.test(await txt(pg,'ssEndT')) && (await txt(pg,'ssExtra'))==='📺 광고 보고 한 판 더 (2번 남음)', [await txt(pg,'ssEndT'), await txt(pg,'ssExtra')]);
 // 성공으로 끝난 한 판 더 → 호외
 await pg.click('#ssBack'); await setDay(pg,2,true,true); await pg.click('#ssStartBtn'); await pg.waitForTimeout(400); await pg.click('#ssNext'); await pg.waitForTimeout(1500);
 ok('한 판 더 성공: 호외가 뜸', await pg.evaluate(()=>__pg.paper.isOpen())); await pg.evaluate(()=>__pg.paper.back()); await pg.waitForTimeout(600);
 ok('호외 닫으면 남은 1번', (await txt(pg,'ssExtra'))==='📺 광고 보고 한 판 더 (1번 남음)', await txt(pg,'ssExtra'));
 await pg.click('#ssBack'); await setDay(pg,3,false); await pg.click('#ssStartBtn'); await pg.waitForTimeout(300);
 ok('무료: 3번 다 쓰면 한 판 더 버튼 없음', !(await vis(pg,'ssExtra')));
 ok('무료: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 pg=await page(br,true); await setDay(pg,5,false); await pg.click('#ssStartBtn'); await pg.waitForTimeout(300);
 ok('평생권: 5번 한 뒤에도 「한 판 더」(광고 없음)', (await txt(pg,'ssExtra'))==='⛳ 한 판 더', await txt(pg,'ssExtra'));
 await pg.click('#ssExtra'); await pg.waitForTimeout(500); ok('평생권: 광고 0번으로 「한 판 더 6」', await pg.evaluate(()=>__ad===0 && /한 판 더 6/.test(document.getElementById('ssName').textContent)));
 ok('평생권: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 const bad=R.filter(x=>!x).length; console.log(bad?'실패 '+bad+'개':'모두 통과 ('+R.length+'개)'); await br.close(); process.exit(bad?1:0); })();
