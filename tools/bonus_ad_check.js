// 「한 판 더」 광고 미리 불러 두기 검사(v84; v87부터는 무료 3라운드 뒤 「광고 보고 한 라운드 더」): 가짜 토스에서 결과 화면이 뜨면 미리 불러 두고, 한 번 누르면 바로 뜨는지
// 경우 4개: ① 미리 불러 둔 뒤 누름 ② 불러오는 중에 누름 ③ 끝까지 안 보고 닫음 ④ 불러오기 실패 → 그냥 열어 줌
const {chromium,devices}=require('playwright');
const CASES=[['ready',300,true,false],['loading',3000,true,false],['skip',300,false,false],['fail',300,true,true]];
(async()=>{ const br=await chromium.launch(); let bad=0;
for(const [name,loadMs,earn,failLoad] of CASES){
  const ctx=await br.newContext({...devices['iPhone 13']});
  await ctx.addInitScript(()=>{ const d=new Date(), p=n=>String(n).padStart(2,'0'), day=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); const F=window.fetch; window.fetch=function(u){ u=String(u); if(u.includes('/time')) return Promise.resolve(new Response(JSON.stringify({kst_date:day}),{status:200})); if(u.includes('arinplay')||u.includes('supabase')) return Promise.resolve(new Response('{}',{status:200})); return F.apply(this,arguments); }; }); // v87: 서버 날짜를 받아야 광고 한 라운드 더
  await ctx.addInitScript(({loadMs,earn,failLoad})=>{ window.AIT_CFG={ad:'g',sku:'s'}; window.__ad={load:0,show:0,tShow:0,tTap:0}; addEventListener('click',e=>{ if(e.target&&e.target.id==='bonusBtn') __ad.tTap=performance.now(); },true);
    window.AIT={ graniteEvent:{addEventListener(){return()=>{}}}, closeView(){}, Analytics:{log(){}}, Environment:{getDeploymentId(){return 'x'}},
      SafeAreaInsets:{get(){return {top:47,bottom:34}}}, File:{saveBase64:async()=>({})}, Notification:{requestAgreement:async()=>({status:'agreed'})},
      IAP:{getCompletedOrRefundedOrders:async()=>({orders:[]}),createOneTimePurchaseOrder(){}},
      loadFullScreenAd(o){ __ad.load++; setTimeout(()=>failLoad?o.onError(new Error('x')):o.onEvent({type:'loaded'}),loadMs) },
      showFullScreenAd(o){ __ad.show++; __ad.tShow=performance.now(); setTimeout(()=>{ if(earn) o.onEvent({type:'userEarnedReward'}); o.onEvent({type:'dismissed'}) },200) } }; },{loadMs,earn,failLoad});
  const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8765/index.html?sim'); await pg.waitForTimeout(400); await pg.evaluate(()=>localStorage.clear()); await pg.reload(); await pg.waitForTimeout(4000);
  await pg.evaluate(()=>{ ['title','journey','start','how','practice','pause'].forEach(id=>{const e=document.getElementById(id); if(e) e.hidden=true});
    const P=__pg; const play=k=>{ P.setCourse(k); P.startRound('today'); P.S.intro=null; P.shoot(0,120); P.S.moving=false; for(let i=0;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } };
    ['jamsil','hapcheon'].forEach(play); if(P.paper.isOpen()) P.paper.back(); play('home'); });
  await pg.waitForTimeout(1800); await pg.evaluate(()=>{ if(__pg.paper.isOpen()) __pg.paper.back(); }); await pg.waitForTimeout(400);
  const offer=await pg.evaluate(()=>!document.getElementById('end').hidden && !document.getElementById('bonusBtn').hidden);
  const loadsBeforeTap=await pg.evaluate(()=>__ad.load);
  await pg.waitForTimeout(name==='loading'?500:700);
  const t0=await pg.evaluate(()=>performance.now()); await pg.click('#bonusBtn');
  const btnWhile=await pg.evaluate(()=>({d:document.getElementById('bonusBtn').disabled,t:document.getElementById('bonusBtn').textContent}));
  await pg.waitForTimeout(name==='loading'?3500:900);
  const r=await pg.evaluate(t0=>({load:__ad.load, show:__ad.show, delay:__ad.show?Math.round(__ad.tShow-__ad.tTap):null, mode:__pg.S.mode, end:!document.getElementById('end').hidden,
    btn:document.getElementById('bonusBtn').textContent, dis:document.getElementById('bonusBtn').disabled}),t0);
  let ok;
  if(name==='ready') ok=offer&&loadsBeforeTap===1&&r.load===1&&r.show===1&&r.delay<100&&r.mode==='bonus'&&!r.end;
  if(name==='loading') ok=offer&&loadsBeforeTap===1&&r.load===1&&r.show===1&&btnWhile.d&&r.mode==='bonus'&&!r.end;
  if(name==='skip') ok=offer&&r.show===1&&r.mode!=='bonus'&&r.end&&!r.dis&&r.load===2;
  if(name==='fail') ok=offer&&r.show===0&&r.mode==='bonus';
  if(errs.length) ok=false; if(!ok) bad++;
  console.log((ok?'통과':'실패'),name,JSON.stringify({offer,loadsBeforeTap,btnWhile,...r,errs}));
  await ctx.close(); }
console.log(bad?'실패 '+bad+'개':'모두 통과 (4개)'); await br.close(); process.exit(bad?1:0); })();
