// 새 코스 먼저 열기 검사(v86, 대표 2026-11-23 20:17 「광고 보고 다 열리면 뭐하러 3,300원 사냐」): 광고·올스타로는 안 열림, 평생권이면 다음 주 코스 하나만 먼저
const {chromium,devices}=require('playwright');
const MOCK=pass=>`window.AIT_CFG={ad:'g',sku:'s'}; window.__AIT_BUILD=1;
 window.AIT={ graniteEvent:{addEventListener(){return()=>{}}}, closeView(){}, Analytics:{log(){}}, Environment:{getDeploymentId(){return 'x'}},
  SafeAreaInsets:{get(){return {top:47,bottom:34}}}, File:{saveBase64:async()=>({})}, Notification:{requestAgreement:async()=>({status:'agreed'})},
  IAP:{getCompletedOrRefundedOrders:async()=>({orders:${pass?"[{sku:'s',status:'COMPLETED',orderId:'o1'}]":"[]"}}),getPendingOrders:async()=>({orders:[]}),createOneTimePurchaseOrder(){}},
  loadFullScreenAd(o){ setTimeout(()=>o.onEvent({type:'loaded'}),50) }, showFullScreenAd(o){ setTimeout(()=>{o.onEvent({type:'userEarnedReward'});o.onEvent({type:'dismissed'})},50) } };`;
const R=[]; const ok=(n,c,i)=>{ R.push(!!c); console.log((c?'통과':'실패'),n,i!==undefined?JSON.stringify(i):''); };
(async()=>{ const br=await chromium.launch();
 for(const pass of [false,true]){ const ctx=await br.newContext({...devices['iPhone 13']}); await ctx.addInitScript(MOCK(pass)); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto((process.env.BASE||'http://localhost:8765')+'/index.html?sim'); await pg.waitForTimeout(300); await pg.evaluate(p=>{ localStorage.clear(); if(p) localStorage.setItem('opg_pass','1'); },pass); await pg.reload(); await pg.waitForTimeout(3800);
  // 앞 코스 나루터를 올스타(9홀 모두 파 이하)로 친 기록을 만듦
  await pg.evaluate(()=>{ const P=__pg; P.setCourse('ferry'); const par=P.HOLES.map(h=>h.par); localStorage.setItem('opg_rounds_ferry',JSON.stringify({[P.TODAY]:{strokes:par,total:par.reduce((a,b)=>a+b,0)}})); });
  const st=await pg.evaluate(()=>({lake:__pg.courseOpen('lake'), sea:__pg.courseOpen('sea'), ferry:__pg.courseOpen('ferry')}));
  if(!pass){ ok('무료: 나루터 올스타여도 호숫가 언덕(11/28) 잠김', !st.lake, st); }
  else { ok('평생권: 호숫가 언덕(다음 주 코스) 먼저 열림', st.lake, st); ok('평생권: 바닷가 솔밭(그다음 주)은 아직 잠김', !st.sea, st); }
  await pg.evaluate(()=>{ document.querySelectorAll('.screen,#title,#rating').forEach(e=>e.hidden=true); __pg.setCourse('home'); document.getElementById('start').hidden=false; document.getElementById('sBack').click(); });
  await pg.waitForTimeout(700); await pg.evaluate(()=>document.querySelector('.jStop[data-k=lake]').click()); await pg.waitForTimeout(300);
  const b=await pg.evaluate(()=>({early:!document.getElementById('jEarly').hidden, pass:!document.getElementById('jPass').hidden, go:!document.getElementById('jGo').hidden&&!document.getElementById('jGo').disabled, meta:document.getElementById('jMeta').textContent}));
  if(!pass){ ok('무료: 「광고 보고 먼저 열기」 버튼 없음', !b.early, b); ok('무료: 「평생권이면 지금 바로 치기」 버튼 있음', b.pass, b);
    await pg.click('#jPass'); await pg.waitForTimeout(200); ok('무료: 그 버튼은 결제 화면', await pg.evaluate(()=>!document.getElementById('payScreen').hidden && /일주일 먼저/.test(document.getElementById('paySub').textContent))); }
  else ok('평생권: 호숫가 언덕 칠 수 있음', b.go && !b.pass && !b.early, b);
  ok((pass?'평생권':'무료')+': 오류 없음', !errs.length, errs); await ctx.close(); }
 const bad=R.filter(x=>!x).length; console.log(bad?'실패 '+bad+'개':'모두 통과 ('+R.length+'개)'); await br.close(); process.exit(bad?1:0); })();
