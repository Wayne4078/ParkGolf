// v85 BM 검사(대표 결정 2026-11-23, #M-1123-1355): 가짜 토스에서 무료·평생권 손님이 무엇을 몇 판 칠 수 있는지
const {chromium,devices}=require('playwright');
const MOCK=(pass,sku)=>`window.AIT_CFG={ad:'g',sku:${sku?"'s'":"''"}}; window.__AIT_BUILD=1; window.__ad=0; ${pass?"localStorage.setItem('opg_pass','1');":""}
 window.AIT={ graniteEvent:{addEventListener(){return()=>{}}}, closeView(){}, Analytics:{log(){}}, Environment:{getDeploymentId(){return 'x'}},
  SafeAreaInsets:{get(){return {top:47,bottom:34}}}, File:{saveBase64:async()=>({})}, Notification:{requestAgreement:async()=>({status:'agreed'})},
  IAP:{getCompletedOrRefundedOrders:async()=>({orders:${pass?"[{sku:'s',status:'COMPLETED',orderId:'o1'}]":"[]"}}),getPendingOrders:async()=>({orders:[]}),createOneTimePurchaseOrder(){}},
  loadFullScreenAd(o){ setTimeout(()=>o.onEvent({type:'loaded'}),50) }, showFullScreenAd(o){ __ad++; setTimeout(()=>{o.onEvent({type:'userEarnedReward'});o.onEvent({type:'dismissed'})},50) } };`;
const results=[]; const ok=(name,cond,info)=>{ results.push([name,!!cond]); console.log((cond?'통과':'실패'),name,info!==undefined?JSON.stringify(info):''); };
async function page(br,pass,sku=true){ const ctx=await br.newContext({...devices['iPhone 13']}); await ctx.addInitScript(MOCK(pass,sku)); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto((process.env.BASE||'http://localhost:8765')+'/index.html?sim'); await pg.waitForTimeout(300); await pg.evaluate(p=>{ localStorage.clear(); if(p) localStorage.setItem('opg_pass','1'); },pass); await pg.reload(); await pg.waitForTimeout(3800); pg.errs=errs; return pg; }
const playAll=`(m)=>{ const P=__pg; P.startRound(m); for(let i=0;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } }`;
const ui=pg=>pg.evaluate(()=>{ const g=id=>document.getElementById(id); return { end:!g('end').hidden, bonus:g('bonusBtn').hidden?null:g('bonusBtn').textContent, again:g('again').hidden?null:g('again').textContent, mode:__pg.S.mode }; });
const toEnd=async pg=>{ await pg.waitForTimeout(1500); await pg.evaluate(()=>{ if(__pg.paper.isOpen()) __pg.paper.back(); }); await pg.waitForTimeout(300); };
const startUI=pg=>pg.evaluate(()=>{ const g=id=>document.getElementById(id); document.querySelectorAll('.screen').forEach(e=>e.hidden=true); g('start').hidden=false; return { today:g('goToday').textContent, todayDis:g('goToday').disabled, prac:g('goPractice').hidden?null:g('goPractice').textContent }; });
(async()=>{ const br=await chromium.launch();
 // ── 무료 손님
 let pg=await page(br,false);
 await pg.evaluate(()=>{ document.querySelectorAll('.screen').forEach(e=>e.hidden=true); __pg.setCourse('home'); });
 let s=await startUI(pg); ok('무료: 시작 화면 연습 버튼은 평생권 안내', s.prac==='연습 (평생권)', s);
 await pg.click('#goPractice'); await pg.waitForTimeout(200);
 ok('무료: 연습 누르면 결제 화면(연습 화면 아님)', await pg.evaluate(()=>!document.getElementById('payScreen').hidden && document.getElementById('practice').hidden));
 ok('결제 화면 문구 = 평생권·몇 판이든', await pg.evaluate(()=>/평생권/.test(document.getElementById('paySub').textContent)&&/몇 판이든/.test(document.getElementById('paySub').textContent)&&/평생권/.test(document.getElementById('payOk').textContent)));
 await pg.click('#payNo');
 await pg.evaluate(new Function('return ('+playAll+")('today')")); await toEnd(pg);
 let u=await ui(pg); ok('무료: 오늘 한 판 뒤 「광고 보고 한 판 더 (3번 남음)」, 연습 버튼 없음', u.bonus==='🎬 광고 보고 한 판 더 (3번 남음)' && u.again===null, u);
 for(let i=0;i<3;i++){ await pg.click('#bonusBtn'); await pg.waitForTimeout(500); const m=await pg.evaluate(()=>__pg.S.mode); if(m!=='bonus'){ ok('무료: 광고 한 판 더 '+(i+1)+'번째 시작', false, m); break; }
   await pg.evaluate(()=>{ const P=__pg; for(let i=0;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } }); await toEnd(pg); u=await ui(pg);
   if(i<2) ok('무료: '+(i+1)+'번째 한 판 더 뒤 남은 수 '+(2-i), u.bonus==='🎬 광고 보고 한 판 더 ('+(2-i)+'번 남음)', u); }
 ok('무료: 3번 다 쓰면 「평생권이면 몇 판이든」(결제로)', u.bonus==='⛳ 평생권이면 몇 판이든', u);
 ok('무료: 광고 3번 봄', (await pg.evaluate(()=>__ad))===3);
 await pg.click('#bonusBtn'); await pg.waitForTimeout(200); ok('무료: 그 버튼은 결제 화면을 엶', await pg.evaluate(()=>!document.getElementById('payScreen').hidden)); await pg.click('#payNo');
 await pg.evaluate(()=>__pg.setCourse('home')); s=await startUI(pg); ok('무료: 시작 화면 「오늘은 여기까지」 잠김', s.todayDis && /오늘은 여기까지/.test(s.today), s);
 await pg.evaluate(()=>__pg.setCourse('jamsil')); s=await startUI(pg); ok('무료: 다른 코스(강변 공원)는 오늘의 라운드 그대로', !s.todayDis && s.today==='오늘의 라운드', s);
 await pg.evaluate(new Function('return ('+playAll+")('today')")); await toEnd(pg); u=await ui(pg); ok('무료: 강변 공원 한 판 더는 따로 3번', u.bonus==='🎬 광고 보고 한 판 더 (3번 남음)', u);
 ok('무료: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 // ── 평생권 손님
 pg=await page(br,true);
 ok('평생권: 코스를 먼저 열지 않음(황강 둔치 잠김)', await pg.evaluate(()=>{ const st={k:'hapcheon'}; document.querySelectorAll('.screen').forEach(e=>e.hidden=true); __pg.showJourney&&0; return true; }) && await pg.evaluate(()=>!__pg.courseOpen('hapcheon')));
 await pg.evaluate(()=>{ document.querySelectorAll('.screen').forEach(e=>e.hidden=true); __pg.setCourse('home'); });
 s=await startUI(pg); ok('평생권: 연습 버튼', s.prac==='연습', s);
 await pg.click('#goPractice'); await pg.waitForTimeout(200); ok('평생권: 연습 화면 열림', await pg.evaluate(()=>!document.getElementById('practice').hidden && document.getElementById('payScreen').hidden));
 await pg.evaluate(()=>{ document.querySelectorAll('.screen').forEach(e=>e.hidden=true); });
 await pg.evaluate(new Function('return ('+playAll+")('today')")); await toEnd(pg);
 for(let i=0;i<5;i++){ u=await ui(pg); if(u.bonus!=='⛳ 한 판 더'){ ok('평생권: '+(i+1)+'번째 한 판 더 버튼', false, u); break; } await pg.click('#bonusBtn'); await pg.waitForTimeout(300);
   await pg.evaluate(()=>{ const P=__pg; for(let i=0;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } }); await toEnd(pg); }
 u=await ui(pg); ok('평생권: 한 판 더 5번 넘게, 광고 0번, 연습 버튼 있음', u.bonus==='⛳ 한 판 더' && (await pg.evaluate(()=>__ad))===0 && u.again==='연습으로 한 번 더', u);
 ok('평생권: 오류 없음', pg.errs.length===0, pg.errs); await pg.context().close();
 // ── 결제 상품이 없는 토스판(살 수 없음)
 pg=await page(br,false,false); await pg.evaluate(()=>{ document.querySelectorAll('.screen').forEach(e=>e.hidden=true); __pg.setCourse('home'); });
 s=await startUI(pg); ok('살 수 없는 판: 연습(평생권) 버튼 숨김', s.prac===null, s);
 await pg.evaluate(new Function('return ('+playAll+")('today')")); await toEnd(pg);
 for(let i=0;i<3;i++){ await pg.click('#bonusBtn'); await pg.waitForTimeout(400); await pg.evaluate(()=>{ const P=__pg; for(let i=0;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } }); await toEnd(pg); }
 u=await ui(pg); ok('살 수 없는 판: 3번 뒤 버튼 없음', u.bonus===null, u); await pg.context().close();
 const bad=results.filter(r=>!r[1]).length; console.log(bad?'실패 '+bad+'개':'모두 통과 ('+results.length+'개)'); await br.close(); process.exit(bad?1:0); })();
