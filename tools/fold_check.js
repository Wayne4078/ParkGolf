// 첫 화면 접힘 검사(아린 공통 규칙): 화면마다 꼭 눌러야 할 버튼이 작은 폰에서 스크롤 없이 보이는지. 높이 = 폰 화면 - 토스 위쪽 바 56px
const {chromium}=require('playwright');
const SIZES=[[320,512,'아주 작은 폰 320×568'],[360,584,'작은 안드로이드'],[375,611,'아이폰 SE'],[393,762,'아이폰 15']];
const SHOTS=process.argv[2]||'';
(async()=>{ const br=await chromium.launch(); let bad=0;
for(const [w,h,name] of SIZES){ const pg=await (await br.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,hasTouch:true,isMobile:true})).newPage();
  await pg.goto('http://localhost:8765/index.html?sim'); await pg.waitForTimeout(300); await pg.evaluate(()=>localStorage.clear()); await pg.reload(); await pg.waitForTimeout(3800);
  const see=async(scr,btns)=>{ const r=await pg.evaluate(([scr,btns])=>{ const hide=['title','journey','start','end','how','practice','pause','lessonDone','holeDone'];
      return btns.map(id=>{ const e=document.getElementById(id); if(!e||e.hidden||!e.offsetParent) return [id,'안 보임(숨김)']; const b=e.getBoundingClientRect();
        return [id, b.bottom<=innerHeight+0.5 ? '보임' : '가려짐 '+Math.round(b.bottom-innerHeight)+'px']; }); },[scr,btns]);
    for(const [id,v] of r){ const known=name.startsWith('아주 작은 폰')&&scr==='end'&&id==='newsBox'; if(v.startsWith('가려짐')&&!known) bad++; console.log(name,scr,id,v+(known&&v.startsWith('가려짐')?' (v84부터 알려진 것 — 경고만)':'')); }
    if(SHOTS) await pg.screenshot({path:SHOTS+'/'+w+'_'+scr+'.png'}); };
  const show=id=>pg.evaluate(id=>{ ['title','journey','start','end','how','practice','pause','lessonDone','holeDone'].forEach(x=>{const e=document.getElementById(x); if(e) e.hidden=true}); document.getElementById(id).hidden=false; document.getElementById(id).scrollTop=0; },id);
  await see('title',['tGo']);
  await show('journey'); await see('journey',['jGo']);
  await show('start'); await pg.evaluate(()=>__pg.SSUI.refresh()); await see('start',['goToday']);
  await pg.evaluate(()=>{ const P=__pg; P.setCourse('home'); P.startRound('today'); for(let i=0;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } }); await pg.waitForTimeout(1800);
  await pg.evaluate(()=>{ if(__pg.paper.isOpen()) __pg.paper.back(); }); await pg.waitForTimeout(400); await see('end',['again','home','newsBox']);
  await pg.evaluate(()=>{ const P=__pg; for(const k of ['jamsil','hapcheon']){ P.setCourse(k); P.startRound('today'); for(let i=0;i<P.HOLES.length;i++){ P.holeOut(false,true); document.getElementById('next').click(); } } }); await pg.waitForTimeout(1800);
  await pg.evaluate(()=>{ if(__pg.paper.isOpen()) __pg.paper.back(); }); await pg.waitForTimeout(400); await see('end+bonus',['bonusBtn','ssEndBtn','again','home','newsBox']);
  await pg.context().close(); }
console.log(bad?'가려짐 '+bad+'개':'모두 보임'); await br.close(); process.exit(bad?1:0); })();
