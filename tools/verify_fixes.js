// 2026-11-22 Codex 검수 결함 재현 시험 — 고치기 전 판에선 실패해야 하고, 고친 판에선 모두 통과해야 한다.
// 실행: node tools/verify_fixes.js [index.html 경로]  (네트워크는 모두 막고 로컬 파일만 줌, 토스 SDK는 가짜)
const {chromium}=require('playwright'); const path=require('path'), fs=require('fs');
const ROOT=path.resolve(process.argv[2]?path.dirname(process.argv[2]):path.join(__dirname,'..'));
const FILE=process.argv[2]?path.basename(process.argv[2]):'index.html';
const TODAY=(()=>{const d=new Date();const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());})();
const SKU='sku-pass';
function fakeAit(opt){ return `(()=>{ const O=${JSON.stringify(opt||{})}; window.__calls=[]; ${O_MARK(opt)}
  if(O.noAit) return; window.AIT_CFG={ad:'ad',sku:'${SKU}'};
  const sup=v=>Object.assign(v,{isSupported:()=>O.payUnsupported?false:true});
  window.AIT={ graniteEvent:{addEventListener(){return()=>{}}}, closeView(){__calls.push(['close'])}, Analytics:{log:async()=>{}}, Environment:{}, SafeAreaInsets:{get(){return {top:0}}}, File:{},
    IAP:{ getCompletedOrRefundedOrders:sup(async()=>({orders:[],hasNext:false})), getPendingOrders:async()=>({orders:O.pending||[]}),
      completeProductGrant:async(a)=>{ __calls.push(['complete',a]); return true; },
      createOneTimePurchaseOrder:sup(function(a){ window.__order=a; __calls.push(['order']); return ()=>{}; }) },
    loadFullScreenAd(o){ __calls.push(['load']); if(O.adSilent) return; setTimeout(()=>{ o.onEvent({type:'loaded'}); if(O.adDouble) o.onEvent({type:'loaded'}); },50); },
    showFullScreenAd(o){ __calls.push(['show']); if(O.adSilent) return; setTimeout(()=>{ o.onEvent({type:'userEarnedReward'}); o.onEvent({type:'dismissed'}); },50); } };
  if(O.failPassWrite){ const orig=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='opg_pass') throw new Error('quota'); return orig.call(this,k,v); }; }
})();`; }
function O_MARK(opt){ return opt&&opt.buildMark?'window.__AIT_BUILD=1;':''; }
(async()=>{
  const br=await chromium.launch(); const results=[];
  async function page(opt,store){ const ctx=await br.newContext({viewport:{width:390,height:844}});
    await ctx.route('**/*',r=>{ const u=new URL(r.request().url()); if(u.hostname==='local.test'){ const f=path.join(ROOT,decodeURIComponent(u.pathname)); if(fs.existsSync(f)&&fs.statSync(f).isFile()) return r.fulfill({path:f}); return r.fulfill({status:404,body:''}); } return r.abort(); });
    await ctx.addInitScript(fakeAit(opt));
    if(store) await ctx.addInitScript(s=>{ if(!sessionStorage.getItem('seeded')){ localStorage.clear(); for(const k in s) localStorage.setItem(k,s[k]); sessionStorage.setItem('seeded','1'); } }, store);
    const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto('http://local.test/'+FILE+'?sim'); await pg.waitForTimeout(1500); return {pg,ctx,errs}; }
  async function t(name,fn){ try{ const ok=await fn(); results.push([name,!!ok]); }catch(e){ results.push([name,false,e.message.slice(0,120)]); } }
  const base={opg_lesson_done:'1', opg_rounds:'{}'};

  await t('1 토스판 결제 미지원이면 무료 지급 안 함', async()=>{ const {pg,ctx}=await page({payUnsupported:true,buildMark:true},base);
    await pg.evaluate(()=>{ document.getElementById('payScreen').hidden=false; document.getElementById('payOk').click(); }); await pg.waitForTimeout(200);
    const v=await pg.evaluate(()=>localStorage.getItem('opg_pass')); await ctx.close(); return v===null; });
  await t('1b 토스판인데 연결부(AIT)가 없어도 무료 지급 안 함', async()=>{ const {pg,ctx}=await page({noAit:true,buildMark:true},base);
    await pg.evaluate(()=>{ document.getElementById('payScreen').hidden=false; document.getElementById('payOk').click(); }); await pg.waitForTimeout(200);
    const v=await pg.evaluate(()=>localStorage.getItem('opg_pass')); await ctx.close(); return v===null; });
  await t('1c 웹판(토스 밖)은 시험 지급 그대로', async()=>{ const {pg,ctx}=await page({noAit:true},base);
    await pg.evaluate(()=>{ document.getElementById('payScreen').hidden=false; document.getElementById('payOk').click(); }); await pg.waitForTimeout(200);
    const v=await pg.evaluate(()=>localStorage.getItem('opg_pass')); await ctx.close(); return v==='1'; });
  await t('2 저장 실패면 지급 콜백이 false', async()=>{ const {pg,ctx}=await page({failPassWrite:true},base);
    const r=await pg.evaluate(()=>{ document.getElementById('payScreen').hidden=false; document.getElementById('payOk').click(); return window.__order? window.__order.options.processProductGrant() : 'no-order'; });
    await ctx.close(); return r===false; });
  await t('2b 정상 저장이면 지급 콜백 true·이용권 있음', async()=>{ const {pg,ctx}=await page({},base);
    const r=await pg.evaluate(()=>{ document.getElementById('payScreen').hidden=false; document.getElementById('payOk').click(); const x=window.__order.options.processProductGrant(); return [x,localStorage.getItem('opg_pass')]; });
    await ctx.close(); return r[0]===true&&r[1]==='1'; });
  await t('2c 대기 주문: 저장 실패면 완료 처리 안 함', async()=>{ const {pg,ctx}=await page({failPassWrite:true,pending:[{orderId:'p1',sku:SKU}]},base);
    await pg.waitForTimeout(300); const c=await pg.evaluate(()=>__calls.filter(x=>x[0]==='complete').length); await ctx.close(); return c===0; });
  await t('2d 대기 주문: 정상이면 저장 후 완료', async()=>{ const {pg,ctx}=await page({pending:[{orderId:'p1',sku:SKU}]},base);
    await pg.waitForTimeout(300); const r=await pg.evaluate(()=>[__calls.filter(x=>x[0]==='complete').length,localStorage.getItem('opg_pass')]); await ctx.close(); return r[0]===1&&r[1]==='1'; });
  await t('12 다른 상품 대기 주문은 지급·완료 안 함', async()=>{ const {pg,ctx}=await page({pending:[{orderId:'o1',sku:'other'}]},base);
    await pg.waitForTimeout(300); const r=await pg.evaluate(()=>[__calls.filter(x=>x[0]==='complete').length,localStorage.getItem('opg_pass')]); await ctx.close(); return r[0]===0&&r[1]===null; });
  await t('3 다른 코스 이어 치기가 첫 화면 누를 때 지워지지 않음', async()=>{ const res={date:TODAY,hi:3,strokes:[4,4,4,2,0,0,0,0,0],ball:'normal',pos:{x:180,y:250},done:false};
    const {pg,ctx}=await page({noAit:true},{...base,opg_last_course:'jamsil',opg_rounds_jamsil_resume:JSON.stringify(res)});
    await pg.evaluate(()=>document.getElementById('title').click()); await pg.waitForTimeout(400);
    const r=await pg.evaluate(()=>[JSON.parse(localStorage.getItem('opg_rounds_jamsil_resume')||'null'), __pg.S.hi]); await ctx.close();
    return r[0]&&r[0].hi===3&&r[0].strokes[3]===2&&r[1]===3; });
  await t('5 깨진 저장값(opg_rounds=null 등)에도 켜짐', async()=>{ const {pg,ctx,errs}=await page({noAit:true},{opg_lesson_done:'1',opg_rounds:'null',opg_rounds_home:'[1,2]',opg_rounds_home_resume:'{"date":"x"}',opg_bonus:'7'});
    const ok=await pg.evaluate(()=>!!window.__pg); await ctx.close(); return ok&&errs.length===0; });
  await t('5b 깨진 슈퍼샷 저장값(s:[])에도 열림', async()=>{ const {pg,ctx,errs}=await page({noAit:true},{...base,opg_ss:JSON.stringify({date:TODAY,cur:0,s:[]})});
    await pg.evaluate(()=>__pg.SSUI.open('start')); await pg.waitForTimeout(200); const v=await pg.evaluate(()=>!document.getElementById('ss').hidden); await ctx.close(); return v&&errs.length===0; });
  await t('4 도전 다 쓴 판에 다시 들어오면 다음 판 카드', async()=>{ const {pg,ctx}=await page({noAit:true},{...base,opg_ss:JSON.stringify({date:TODAY,cur:0,s:[{used:4},{used:0},{used:0}]})});
    await pg.evaluate(()=>__pg.SSUI.open('start')); await pg.waitForTimeout(200);
    const r=await pg.evaluate(()=>[!document.getElementById('ssMid').hidden, !document.getElementById('ssNext').hidden]); await ctx.close(); return r[0]&&r[1]; });
  await t('6 자정을 넘겨도 슈퍼샷 판 배정은 연 날 기준', async()=>{ const {pg,ctx}=await page({noAit:true},base);
    const r=await pg.evaluate(()=>{ const a=__pg.SSUI.todayLevels().map(x=>x.id).join(); const RD=Date; const off=864e5; window.Date=class extends RD{ constructor(...x){ x.length?super(...x):super(RD.now()+off); } static now(){ return RD.now()+off; } }; const b=__pg.SSUI.todayLevels().map(x=>x.id).join(); window.Date=RD; return [a,b]; });
    await ctx.close(); return r[0]===r[1]; });
  await t('7 광고 응답이 없어도 10초 뒤 정리(한 번만)', async()=>{ const {pg,ctx}=await page({adSilent:true},base);
    await pg.evaluate(()=>{ window.__cb=0; __pg.showAd(()=>window.__cb++); __pg.showAd(()=>window.__cb++); }); await pg.waitForTimeout(10600);
    const r=await pg.evaluate(()=>[window.__cb,__calls.filter(x=>x[0]==='load').length]); await ctx.close(); return r[0]===1&&r[1]===1; });
  await t('8 loaded가 두 번 와도 광고는 한 번', async()=>{ const {pg,ctx}=await page({adDouble:true},base);
    await pg.evaluate(()=>{ window.__cb=0; __pg.showAd(()=>window.__cb++); }); await pg.waitForTimeout(500);
    const r=await pg.evaluate(()=>[__calls.filter(x=>x[0]==='show').length,window.__cb]); await ctx.close(); return r[0]===1&&r[1]===1; });
  await t('9 결제 안내가 떠 있으면 뒤로 가기가 그것부터 닫음', async()=>{ const {pg,ctx}=await page({noAit:true},base);
    const r=await pg.evaluate(()=>{ document.getElementById('title').click(); document.getElementById('payScreen').hidden=false; const h=__pg.back(); return [h,document.getElementById('payScreen').hidden]; }); await ctx.close(); return r[0]===true&&r[1]===true; });
  await t('10 잠깐 쉬기 중엔 공이 멈춰 있음', async()=>{ const {pg,ctx}=await page({noAit:true},base);
    const r=await pg.evaluate(async()=>{ document.getElementById('title').click(); const P=__pg; ['journey','start','title'].forEach(i=>document.getElementById(i).hidden=true); P.setCourse('home'); P.startRound('today'); P.S.intro=null;
      P.S.vel={x:0,y:-300}; P.S.moving=true; document.getElementById('menuBtn').click(); const a={...P.S.pos}; await new Promise(r=>setTimeout(r,400)); const b={...P.S.pos}; return [document.getElementById('pause').hidden, a.x===b.x&&a.y===b.y]; });
    await ctx.close(); return r[0]===false&&r[1]===true; });
  await t('11 굴러가는 중 저장하면 친 자리·타수 포함', async()=>{ const {pg,ctx}=await page({noAit:true},base);
    const r=await pg.evaluate(()=>{ document.getElementById('title').click(); const P=__pg; ['journey','start','title'].forEach(i=>document.getElementById(i).hidden=true); P.setCourse('home'); P.startRound('today'); P.S.intro=null;
      const start={...P.S.pos}; P.S.lastSafe={...start}; P.S.strokes[P.S.hi]=1; P.S.pos={x:start.x+40,y:start.y-80}; P.S.moving=true; P.saveResume(); const sv=JSON.parse(localStorage.getItem('opg_rounds_resume')||'null'); return [sv&&sv.pos&&sv.pos.x===start.x&&sv.pos.y===start.y, sv&&sv.strokes[P.S.hi]===1]; });
    await ctx.close(); return r[0]&&r[1]; });
  await t('B 테스터 이름은 안 나감(?t=숫자만)', async()=>{ const ctx=await br.newContext(); const sent=[];
    await ctx.route('**/*',r=>{ const u=new URL(r.request().url()); if(u.hostname==='local.test'){ const f=path.join(ROOT,decodeURIComponent(u.pathname)); if(fs.existsSync(f)&&fs.statSync(f).isFile()) return r.fulfill({path:f}); return r.fulfill({status:404,body:''}); } if(/playtest_log/.test(u.pathname)){ sent.push(r.request().postData()||''); return r.fulfill({status:201,body:''}); } return r.abort(); });
    await ctx.addInitScript(fakeAit({noAit:true})); const pg=await ctx.newPage(); await pg.goto('http://local.test/'+FILE+'?sim&t=hong@mail.com&utm_source=Kim%20Chulsu%20010'); await pg.waitForTimeout(1500);
    await pg.evaluate(()=>PT.flush()); await pg.waitForTimeout(300); const all=sent.join(''); await ctx.close();
    return sent.length>0 && !/hong|@|Kim Chulsu|Kim%20|Mozilla|HeadlessChrome/.test(all); });
  await br.close();
  let fail=0; for(const [n,ok,e] of results){ console.log((ok?'통과 ':'실패 ')+n+(e?' — '+e:'')); if(!ok) fail++; }
  console.log(fail?('실패 '+fail+'개'):'모두 통과 ('+results.length+'개)'); process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
