// 슈퍼샷 「3판 더」(v88, 대표 2026-11-24 06:54) 검사: 오늘 3판 뒤 광고 한 편 = 3판 더, 횟수 제한 없음, 평생권은 광고 없이 — 가짜 토스
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
 ok('무료: 3판 뒤 출석부에 「📺 광고 보고 3판 더」', await vis(pg,'ssExtra') && (await txt(pg,'ssExtra'))==='📺 광고 보고 3판 더', await txt(pg,'ssExtra'));
 await pg.click('#ssExtra'); await pg.waitForTimeout(700);
 const st=await pg.evaluate(()=>({ss:!document.getElementById('ss').hidden, name:document.getElementById('ssName').textContent, d:JSON.parse(localStorage.getItem('opg_ss')), ad:__ad}));
 ok('무료: 광고 한 편 뒤 3판이 생기고 「3판 더 1/3」이 열림', st.ss && /3판 더 1\/3/.test(st.name) && st.d.ex===3 && st.d.s.length===6 && st.d.s.slice(3).every(x=>x.used===0) && st.ad===1, st);
 ok('3판 더 판은 오늘 3판과 다르고 셋끼리도 다름', await pg.evaluate(()=>{ const S=__pg.SSUI; if(!S.lvAt) return false; const t=[0,1,2].map(i=>S.lvAt(i).id), e=[3,4,5].map(i=>S.lvAt(i).id); return new Set(e).size===3 && e.every(x=>!t.includes(x)); }));
 await pg.reload(); await pg.waitForTimeout(3800); ok('다시 켜도 3판 더 상태 유지', await pg.evaluate(()=>{ const d=JSON.parse(localStorage.getItem('opg_ss')); return d.ex===3 && d.s.length===6 && __pg.SSUI.available(); }));
 // 묶음 셋 다 실패로 끝남 → 아깝게 + 버튼 그대로
 await setDay(pg,3,false,true); await pg.click('#ssStartBtn'); await pg.waitForTimeout(400);
 ok('3판 더 마지막 판: 「결과 보기」 카드', await vis(pg,'ssMid'), await txt(pg,'ssMidT')); await pg.click('#ssNext'); await pg.waitForTimeout(500);
 ok('3판 더 실패 끝: 「아깝게 놓쳤어요」 + 다시 「광고 보고 3판 더」', /아깝게/.test(await txt(pg,'ssEndT')) && (await txt(pg,'ssExtra'))==='📺 광고 보고 3판 더', [await txt(pg,'ssEndT'), await txt(pg,'ssExtra')]);
 // 마지막 판 성공 → 호외
 await pg.click('#ssBack'); await setDay(pg,6,true,true); await pg.click('#ssStartBtn'); await pg.waitForTimeout(400); await pg.click('#ssNext'); await pg.waitForTimeout(1500);
 ok('3판 더 성공: 호외가 뜸', await pg.evaluate(()=>__pg.paper.isOpen())); await pg.evaluate(()=>__pg.paper.back()); await pg.waitForTimeout(600);
 ok('호외 닫아도 「광고 보고 3판 더」 그대로(횟수 제한 없음)', (await txt(pg,'ssExtra'))==='📺 광고 보고 3판 더', await txt(pg,'ssExtra'));
 // 묶음 중간 판이 성공, 마지막은 실패 → 그래도 호외
 await pg.click('#ssBack'); await pg.evaluate(()=>{ const T=__pg.TODAY; const s=[{used:4,won:true},{used:4},{used:4},{used:4},{used:4,won:true},{used:4}]; localStorage.setItem('opg_ss',JSON.stringify({date:T,cur:5,ex:3,s})); document.querySelectorAll('.screen').forEach(e=>e.hidden=true); document.getElementById('start').hidden=false; __pg.SSUI.refresh(); });
 await pg.click('#ssStartBtn'); await pg.waitForTimeout(400); await pg.click('#ssNext'); await pg.waitForTimeout(1500);
 ok('묶음 가운데 판만 성공해도 호외', await pg.evaluate(()=>__pg.paper.isOpen())); await pg.evaluate(()=>__pg.paper.back()); await pg.waitForTimeout(600);
 // 광고 30편 뒤에도 계속
 await pg.click('#ssBack'); await setDay(pg,90,false); await pg.click('#ssStartBtn'); await pg.waitForTimeout(300);
 ok('무료: 3판 더를 30번 써도 버튼 있음', await vis(pg,'ssExtra'));
 await pg.click('#ssExtra'); await pg.waitForTimeout(700); ok('30번 뒤 한 번 더 눌러도 3판 생김', await pg.evaluate(()=>{ const d=JSON.parse(localStorage.getItem('opg_ss')); return d.ex===93 && d.s.length===96; }));
 ok('무료: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 pg=await page(br,true); await setDay(pg,6,false); await pg.click('#ssStartBtn'); await pg.waitForTimeout(300);
 ok('평생권: 「⛳ 3판 더」(광고 없음)', (await txt(pg,'ssExtra'))==='⛳ 3판 더', await txt(pg,'ssExtra'));
 await pg.click('#ssExtra'); await pg.waitForTimeout(500); ok('평생권: 광고 0번으로 3판 생김 「3판 더 1/3」', await pg.evaluate(()=>__ad===0 && /3판 더 1\/3/.test(document.getElementById('ssName').textContent) && JSON.parse(localStorage.getItem('opg_ss')).s.length===12));
 ok('평생권: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 const bad=R.filter(x=>!x).length; console.log(bad?'실패 '+bad+'개':'모두 통과 ('+R.length+'개)'); await br.close(); process.exit(bad?1:0); })();
