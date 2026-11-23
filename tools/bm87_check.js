// BM v87 정답지 검사(대표 결정 2026-11-23 21:04, #M-1123-2105) — 가짜 토스·가짜 서버 시계로 손님이 누르는 버튼 그대로
// ① 무료 하루 N라운드(기본 3, config freeRounds) 코스 합산·첫 타에 셈·이어 치기는 같은 라운드 ② 그 뒤 라운드 끝마다 광고 한 라운드 더(제한 없음, 광고 실패로 열어 준 것도 1)
// ③ 평생권 광고 없이 무제한(연습 포함) ④ 코스는 날짜에 모두에게, 먼저 여는 길 없음 ⑤ 서버 한국 날짜, 못 받으면 무료는 폰 날짜·광고 추가·새 코스 열기 없음 ⑥ freeRounds 원격
// 쓰는 법: node tools/bm87_check.js  (SEED로 폰 기종·코스 순서가 바뀜)
const {chromium,devices}=require('playwright');
const DEV=['iPhone 13','iPhone SE','Galaxy S9+','Pixel 5'][(+(process.env.SEED||1))%4];
let SEED=+(process.env.SEED||1); const rnd=()=>{ SEED=(SEED*1103515245+12345)%2147483648; return SEED/2147483648; };
const MOCK=o=>`(()=>{ const T=new Date('${o.phone}T${o.hour||'12'}:00:00').getTime(), R=Date; const off=T-R.now(); window.Date=class extends R{ constructor(...a){ a.length?super(...a):super(R.now()+off); } static now(){ return R.now()+off; } }; })();
 window.AIT_CFG={ad:'g',sku:'s'}; window.__AIT_BUILD=1; window.__ad=0; window.__adFail=${o.adFail?1:0};
 const F=window.fetch; window.fetch=function(u,opt){ u=String(u);
   if(u.includes('api.arinplay.app/time')) return ${o.srv?`Promise.resolve(new Response(JSON.stringify({kst_date:'${o.srv}'}),{status:200,headers:{'content-type':'application/json'}}))`:`Promise.reject(new Error('offline'))`};
   if(u.includes('config.json')) return ${o.cfg?`Promise.resolve(new Response(JSON.stringify(${JSON.stringify(o.cfg)}),{status:200}))`:`Promise.reject(new Error('offline'))`};
   if(u.includes('arinplay.app')||u.includes('supabase')) return Promise.resolve(new Response('{}',{status:200}));
   return F.apply(this,arguments); };
 window.AIT={ graniteEvent:{addEventListener(){return()=>{}}}, closeView(){}, Analytics:{log(){}}, Environment:{getDeploymentId(){return 'x'}},
  SafeAreaInsets:{get(){return {top:47,bottom:34}}}, File:{saveBase64:async()=>({})}, Notification:{requestAgreement:async()=>({status:'agreed'})},
  IAP:{getCompletedOrRefundedOrders:async()=>({orders:${o.pass?"[{sku:'s',status:'COMPLETED',orderId:'o1'}]":"[]"}}),getPendingOrders:async()=>({orders:[]}),createOneTimePurchaseOrder(){}},
  loadFullScreenAd(x){ setTimeout(()=>window.__adFail?x.onError(new Error('nofill')):x.onEvent({type:'loaded'}),30) }, showFullScreenAd(x){ window.__ad++; setTimeout(()=>{x.onEvent({type:'userEarnedReward'});x.onEvent({type:'dismissed'})},30) } };`;
const R=[]; const ok=(n,c,i)=>{ R.push(!!c); if(!c||process.env.V) console.log((c?'통과':'실패'),n,i!==undefined?JSON.stringify(i):''); };
const BASE=(process.env.BASE||'http://localhost:8765')+'/'+(process.env.PAGE||'index.html')+'?sim';
async function open(br,o,keep){ const ctx=await br.newContext({...devices[DEV]}); await ctx.addInitScript(MOCK(o)); const pg=await ctx.newPage(); pg.errs=[]; pg.on('pageerror',e=>pg.errs.push(e.message));
  await pg.goto(BASE); await pg.waitForTimeout(300);
  await pg.evaluate(([p,k])=>{ localStorage.clear(); sessionStorage.clear(); if(k){ const o=JSON.parse(k); for(const x in o) localStorage.setItem(x,o[x]); } if(p) localStorage.setItem('opg_pass','1'); localStorage.setItem('opg_lesson_done','1'); },[o.pass,keep||null]);
  await pg.reload(); await pg.waitForTimeout(3600); await pg.waitForTimeout(400); return pg; }
const bm=pg=>pg.evaluate(()=>__pg.bm());
const hide=`document.querySelectorAll('.screen,#title,#rating,#holeDone,#pause').forEach(e=>e.hidden=true); __pg.S.attract=false; document.body.classList.remove('attract');`;
const toStart=(pg,k)=>pg.evaluate(new Function('k',hide+` __pg.setCourse(k); document.getElementById('start').hidden=false; const g=document.getElementById('goToday'); return {txt:g.textContent,dis:g.disabled};`),k);
const shot=pg=>pg.evaluate(()=>{ __pg.S.intro=null; __pg.S.moving=false; return __pg.shoot(0,120); });
const finish=async pg=>{ await pg.evaluate(()=>{ const P=__pg; P.S.moving=false; P.S.vel={x:0,y:0}; for(let i=P.S.hi;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } }); await pg.waitForTimeout(1300); await pg.evaluate(()=>{ if(__pg.paper.isOpen()) __pg.paper.back(); }); await pg.waitForTimeout(250); };
const endBtn=pg=>pg.evaluate(()=>{ const b=document.getElementById('bonusBtn'); return {end:!document.getElementById('end').hidden, txt:b.hidden?null:b.textContent, mode:__pg.S.mode}; });
const COURSES=['home','jamsil','hapcheon'];
(async()=>{ const br=await chromium.launch(); const D='2026-12-20';
 // ── A. 무료 · 서버 날짜 받음 ──
 let pg=await open(br,{phone:D,srv:D});
 let b=await bm(pg); ok('A 서버 날짜 받음', b.srv===D && b.today===D, b); ok('A 무료 하루 3라운드', b.left===3 && b.free===3, b);
 ok('A 코스: 12/20에 열린 코스 = 토요일 지난 것 전부(무료)', ['pond','ferry','lake','sea','temple','reed'].every(k=>b.open.includes(k)) && !b.open.includes('village') && !b.open.includes('sunrise'), b.open);
 let s=await toStart(pg,'home'); ok('A 시작 버튼 「오늘의 라운드 (오늘 3판 남음)」', s.txt==='오늘의 라운드 (오늘 3판 남음)' && !s.dis, s);
 await pg.click('#goToday'); await pg.waitForTimeout(300); b=await bm(pg); ok('A 라운드 시작만으로는 안 셈', b.left===3, b);
 await pg.evaluate(()=>__pg.back&&0); await pg.evaluate(new Function(hide)); b=await bm(pg); ok('A 첫 타 전에 나가면 그대로 3판', b.left===3, b);
 // 우리 동네: 첫 타 → 1라운드
 s=await toStart(pg,'home'); await pg.click('#goToday'); await pg.waitForTimeout(300); await shot(pg); b=await bm(pg); ok('A 첫 타에 1라운드 셈', b.rec.n===1 && b.left===2, b);
 await shot(pg); await pg.waitForTimeout(100); b=await bm(pg); ok('A 두 번째 타는 안 셈', b.rec.n===1, b);
 // 이어 치기: 다시 켜서 이어 쳐도 같은 라운드
 const keep1=await pg.evaluate(()=>JSON.stringify(Object.assign({},localStorage))); await pg.context().close();
 pg=await open(br,{phone:D,srv:D},keep1); await pg.evaluate(()=>document.getElementById('title').click()); await pg.waitForTimeout(600);
 b=await bm(pg); ok('A 다시 켜면 하던 라운드 이어 치기(같은 라운드)', await pg.evaluate(()=>__pg.S.mode==='today'&&__pg.S.live) && b.rec.n===1, {b,mode:await pg.evaluate(()=>__pg.S.mode)});
 await shot(pg); b=await bm(pg); ok('A 이어 친 타는 안 셈', b.rec.n===1, b);
 await finish(pg); if(process.env.DBG) console.log('DBG',JSON.stringify(await pg.evaluate(()=>({hi:__pg.S.hi,live:__pg.S.live,n:__pg.HOLES.length,str:__pg.S.strokes,vis:[...document.querySelectorAll('.screen,#holeDone,#title,#pause')].filter(e=>!e.hidden).map(e=>e.id),paper:__pg.paper.isOpen()})))); let e=await endBtn(pg); ok('A 끝 화면 「⛳ 한 라운드 더 (오늘 2판 남음)」', e.txt==='⛳ 한 라운드 더 (오늘 2판 남음)', e);
 const r0=await pg.evaluate(()=>!document.getElementById('again').hidden); ok('A 무료는 끝 화면 연습(다시 치기) 없음', !r0);
 await pg.click('#bonusBtn'); await pg.waitForTimeout(400); ok('A 한 라운드 더 = 같은 코스 두 번째 판', await pg.evaluate(()=>__pg.S.mode==='bonus'&&__pg.S.live));
 const rt=await pg.evaluate(()=>{ document.getElementById('menuBtn').click(); const op=!document.getElementById('pause').hidden, r=document.getElementById('pRetry').hidden; document.getElementById('pResume').click(); return op&&r; }); ok('A 무료는 「이 홀 처음부터」 없음', rt);
 await shot(pg); b=await bm(pg); ok('A 두 번째 라운드 첫 타에 셈(2)', b.rec.n===2 && b.left===1, b); await finish(pg);
 // 다른 코스로: 코스 합산
 const other=COURSES[1+Math.floor(rnd()*2)]; await pg.evaluate(k=>{ if(k==='hapcheon'){ const P=__pg; P.setCourse('jamsil'); const par=P.HOLES.map(h=>h.par); localStorage.setItem('opg_rounds_jamsil',JSON.stringify({'2026-12-19':{strokes:par,total:par.reduce((a,c)=>a+c,0)}})); } },other);
 s=await toStart(pg,other); ok('A 다른 코스('+other+')도 남은 판은 합산 「1판 남음」', /1판 남음/.test(s.txt) && !s.dis, s);
 await pg.click('#goToday'); await pg.waitForTimeout(300); await shot(pg); b=await bm(pg); ok('A 세 번째 라운드 셈 → 남은 0', b.rec.n===3 && b.left===0, b);
 await finish(pg); e=await endBtn(pg); ok('A 3라운드 뒤 끝 화면 「🎬 광고 보고 한 라운드 더」', e.txt==='🎬 광고 보고 한 라운드 더', e);
 s=await toStart(pg,'home'); ok('A 시작 화면도 「🎬 광고 보고 한 라운드 더」(어느 코스든)', s.txt==='🎬 광고 보고 한 라운드 더' && !s.dis, s);
 // 광고 한 라운드 더: 제한 없음
 let adOK=0; for(let i=0;i<6;i++){ const k=COURSES[Math.floor(rnd()*3)]; await toStart(pg,'home');
   await pg.evaluate(new Function(hide+` document.getElementById('end').hidden=false;`)); await pg.click('#bonusBtn'); await pg.waitForTimeout(400);
   const st=await pg.evaluate(()=>({live:__pg.S.live,ad:__ad,mode:__pg.S.mode})); b=await bm(pg);
   if(st.live && st.ad===i+1 && b.left===1){ await shot(pg); const b2=await bm(pg); if(b2.left===0 && b2.rec.n===4+i) adOK++; } await finish(pg); }
 ok('A 광고 한 편마다 한 라운드 — 6번 연속(제한 없음)', adOK===6, {adOK, ad:await pg.evaluate(()=>__ad), b:await bm(pg)});
 // 광고 보고 시작만 하고 안 치면: 그 몫은 남음(다음 버튼은 광고 없이 바로)
 await toStart(pg,'home'); await pg.click('#goToday'); await pg.waitForTimeout(400); const adA=await pg.evaluate(()=>__ad); await pg.evaluate(new Function(hide)); s=await toStart(pg,'home'); b=await bm(pg);
 ok('A 광고 보고 안 친 몫은 남아 광고 없이 바로', b.left===1 && /1판 남음/.test(s.txt), {s,b,adA});
 // 연습 → 결제, 코스 먼저 열기 버튼 없음
 const prac=await pg.evaluate(new Function(hide+` __pg.setCourse('home'); document.getElementById('start').hidden=false; const g=document.getElementById('goPractice'); if(g.hidden) return 'hidden'; g.click(); const r=!document.getElementById('payScreen').hidden && document.getElementById('practice').hidden; document.getElementById('payNo').click(); return r;`));
 ok('A 무료 연습 → 결제 화면', prac===true, prac);
 const jb=await pg.evaluate(new Function(hide+` __pg.setCourse('home'); document.getElementById('start').hidden=false; document.getElementById('sBack').click(); const out=[]; for(const k of ['village','sunrise','lake']){ const st=document.querySelector('.jStop[data-k='+k+']'); if(!st) continue; st.click(); const g=id=>document.getElementById(id); out.push({k,go:!g('jGo').hidden&&!g('jGo').disabled,pass:!g('jPass').hidden,early:!g('jEarly').hidden}); } return out;`));
 ok('A 코스 길: 안 열린 코스는 못 치고 「먼저 열기」·「평생권이면 지금」 버튼 없음', jb.filter(x=>x.k!=='lake').every(x=>!x.go&&!x.pass&&!x.early) && jb.find(x=>x.k==='lake').go, jb);
 ok('A 오류 없음', pg.errs.length===0, pg.errs.slice(0,3));
 const keepA=await pg.evaluate(()=>JSON.stringify(Object.assign({},localStorage))); await pg.context().close();
 // ── B. 같은 날 폰 시계를 1주 되돌림(서버는 그대로) → 오늘 기록 그대로 ──
 pg=await open(br,{phone:'2026-12-13',srv:D},keepA); b=await bm(pg); ok('B 폰 시계 되돌려도 서버 날짜 → 남은 판 그대로', b.today===D && b.left===1, b); await pg.context().close();
 // ── C. 서버를 못 받음 ──
 pg=await open(br,{phone:D,srv:null}); b=await bm(pg); ok('C 서버 없음: 무료 3판은 폰 날짜로', b.srv===null && b.today===D && b.left===3, b);
 ok('C 서버 없음: 새 코스 안 열림(만든 날 11/23 기준)', !b.open.includes('lake') && b.open.includes('ferry'), b.open);
 for(let i=0;i<3;i++){ await toStart(pg,'home'); await pg.click('#goToday'); await pg.waitForTimeout(300); await shot(pg); await finish(pg); }
 e=await endBtn(pg); b=await bm(pg); ok('C 서버 없음: 3판 뒤 광고 한 라운드 더 없음 → 평생권 안내', b.left===0 && e.txt==='⛳ 평생권이면 광고 없이 몇 판이든', {e,b});
 await pg.click('#bonusBtn'); await pg.waitForTimeout(200); ok('C 그 버튼은 결제 화면', await pg.evaluate(()=>!document.getElementById('payScreen').hidden)); await pg.evaluate(()=>document.getElementById('payNo').click());
 ok('C 광고 0번', (await pg.evaluate(()=>__ad))===0); ok('C 오류 없음', pg.errs.length===0, pg.errs.slice(0,3));
 const keepC=await pg.evaluate(()=>JSON.stringify(Object.assign({},localStorage))); await pg.context().close();
 // C2. 서버 없음 + 폰 시계 되돌리기 → 날짜 뒤로 안 감
 pg=await open(br,{phone:'2026-12-13',srv:null},keepC); b=await bm(pg); ok('C2 서버 없음·폰 시계 되돌림: 날짜 그대로, 남은 판 0', b.today===D && b.left===0, b); await pg.context().close();
 // ── D. 다음 날: 다시 3판 ──
 pg=await open(br,{phone:'2026-12-21',srv:'2026-12-21'},keepA); b=await bm(pg); ok('D 다음 날 다시 3판', b.today==='2026-12-21' && b.left===3, b); await pg.context().close();
 // ── E. 폰은 방콕 밤 11시(한국은 다음 날 새벽 1시) → 서버 날짜로 한 번 새로 고침 ──
 pg=await open(br,{phone:'2026-12-20',hour:'23',srv:'2026-12-21'},keepA); await pg.waitForTimeout(1500); b=await bm(pg); ok('E 폰 날짜와 서버 날짜가 다르면 서버 날짜로 맞춤', b.today==='2026-12-21' && b.left===3, b); ok('E 오류 없음', pg.errs.length===0, pg.errs.slice(0,3)); await pg.context().close();
 // ── F. 광고를 못 불러와 열어 준 것도 1라운드 ──
 pg=await open(br,{phone:D,srv:D,adFail:true}); for(let i=0;i<3;i++){ await toStart(pg,'home'); await pg.click('#goToday'); await pg.waitForTimeout(300); await shot(pg); await finish(pg); }
 e=await endBtn(pg); ok('F 3판 뒤 광고 버튼', e.txt==='🎬 광고 보고 한 라운드 더', e); await pg.click('#bonusBtn'); await pg.waitForTimeout(1500);
 b=await bm(pg); const fl=await pg.evaluate(()=>__pg.S.live); ok('F 광고를 못 불러오면 그냥 열어 줌 = 1라운드 몫', fl && b.rec.ad===1 && b.left===1, {b,fl});
 await shot(pg); b=await bm(pg); ok('F 그 판 첫 타에 셈 → 0', b.left===0 && b.rec.n===4, b); await finish(pg); e=await endBtn(pg); ok('F 다음은 또 광고', e.txt==='🎬 광고 보고 한 라운드 더', e); await pg.context().close();
 // ── G. 원격 설정 freeRounds=5 ──
 pg=await open(br,{phone:D,srv:D,cfg:{freeRounds:5}}); await pg.evaluate(()=>{ window.CFG_AT=0; }); await pg.waitForTimeout(500); b=await bm(pg); ok('G 원격 설정 freeRounds 5 → 5판', b.free===5 && b.left===5, b); await pg.context().close();
 pg=await open(br,{phone:D,srv:D,cfg:{freeRounds:'99'}}); b=await bm(pg); ok('G 이상한 값이면 기본 3', b.free===3, b); await pg.context().close();
 // ── H. 평생권 ──
 pg=await open(br,{phone:D,srv:D,pass:true}); b=await bm(pg); ok('H 평생권 남은 판 무제한', b.pass && b.left===99, b);
 s=await toStart(pg,'home'); ok('H 시작 버튼 「오늘의 라운드」(남은 판 표시 없음)', s.txt==='오늘의 라운드', s);
 let passOK=0; for(let i=0;i<8;i++){ await toStart(pg,COURSES[i%3]); await pg.click('#goToday'); await pg.waitForTimeout(300); if(await pg.evaluate(()=>__pg.S.live)){ await shot(pg); passOK++; } await finish(pg); }
 e=await endBtn(pg); ok('H 평생권 8라운드 연속·광고 0번', passOK===8 && (await pg.evaluate(()=>__ad))===0, {passOK,ad:await pg.evaluate(()=>__ad)}); ok('H 끝 화면 「⛳ 한 라운드 더」', e.txt==='⛳ 한 라운드 더', e);
 ok('H 끝 화면 연습 버튼 있음', await pg.evaluate(()=>!document.getElementById('again').hidden));
 const pp=await pg.evaluate(new Function(hide+` __pg.setCourse('home'); document.getElementById('start').hidden=false; document.getElementById('goPractice').click(); return !document.getElementById('practice').hidden && document.getElementById('payScreen').hidden;`)); ok('H 평생권 연습 열림', pp);
 b=await bm(pg); ok('H 평생권도 코스는 날짜대로(먼저 안 열림)', !b.open.includes('village'), b.open); ok('H 오류 없음', pg.errs.length===0, pg.errs.slice(0,3)); await pg.context().close();
 const bad=R.filter(x=>!x).length; console.log(bad?'실패 '+bad+'개 / '+R.length:'모두 통과 ('+R.length+'개)'); await br.close(); process.exit(bad?1:0); })();
