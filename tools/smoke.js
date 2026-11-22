// 실행: tools/smoke.sh (게임 폴더에서 정적 서버를 띄우고 web·toss 두 번 돌림). 페이지 오류·콘솔 오류가 none이어야 통과.
// 전체 흐름 연기 시험: 모든 코스 × 라운드 끝까지, 실제 물리 샷, 잠깐 쉬기·뒤로 가기, 결제/광고/알림 (웹·가짜 토스 둘 다)
const {chromium,devices}=require('playwright');
const MODE=process.argv[2]||'web';
(async()=>{const br=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
const ctx=await br.newContext({...devices['iPhone 13']});
if(MODE==='toss') await ctx.addInitScript(()=>{ window.AIT_CFG={ad:'g',sku:'s'}; window.__log=[];
  window.AIT={ graniteEvent:{addEventListener(){return()=>{}}}, closeView(){}, Analytics:{log(){}}, Environment:{getDeploymentId(){return 'x'}},
    SafeAreaInsets:{get(){return {top:47,bottom:34}}}, File:{saveBase64:async()=>({})},
    Notification:{requestAgreement:async()=>({status:'agreed'})},
    IAP:{getCompletedOrRefundedOrders:Object.assign(async()=>({orders:[],hasNext:false}),{isSupported:()=>true}),getPendingOrders:async()=>({orders:[]}),completeProductGrant:async()=>true,createOneTimePurchaseOrder:Object.assign(function(){ return ()=>{}; },{isSupported:()=>true})},
    loadFullScreenAd(o){ setTimeout(()=>o.onEvent({type:'loaded'}),300) }, showFullScreenAd(o){ setTimeout(()=>{o.onEvent({type:'userEarnedReward'});o.onEvent({type:'dismissed'})},200) } }; });
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));pg.on('console',m=>{ if(m.type()==='error'&&!/net::|Failed to load|ERR_/.test(m.text())) errs.push('CONSOLE '+m.text().slice(0,160)) });
await pg.goto((process.env.BASE||'http://localhost:8765/')+'index.html?sim'+(MODE==='web'?'&all':''));await pg.waitForTimeout(500);
await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(4500);
const res=await pg.evaluate(async()=>{ const out=[]; const P=__pg; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const hide=()=>['title','journey','start','end','how','practice','pause','lessonDone','holeDone','ssEnd','ssMid','ss'].forEach(id=>{const e=document.getElementById(id); if(e) e.hidden=true});
  for(const k of ['lesson','home','jamsil','hapcheon','pond','ferry','range']){
    try{ hide(); P.setCourse(k); P.startRound(k==='range'?'practice':'today'); await sleep(200);
      const n=P.HOLES.length;
      for(let i=0;i<(k==='range'?3:n);i++){
        // 실제 물리: 홀 쪽으로 세게 한 번 치고 멈출 때까지 돌림
        const S=P.S, c=P.cup(); const dx=c[0]-S.pos.x, dy=c[1]-S.pos.y, l=Math.hypot(dx,dy)||1;
        S.intro=null; S.vel={x:dx/l*P.MAXV*0.9,y:dy/l*P.MAXV*0.9}; S.moving=true; S.strokes[S.hi]++;
        for(let t=0;t<1200&&S.moving;t++) P.step(P.H_());
        if(!S.holeOver) P.holeOut(false,true);
        await sleep(30); document.getElementById('next').click(); await sleep(60);
      }
      await sleep(1500); if(P.paper.isOpen()) P.paper.back(); await sleep(300);
      out.push(k+': end='+(!document.getElementById('end').hidden||!document.getElementById('lessonDone').hidden||k==='range'));
    }catch(e){ out.push(k+': THROW '+e.message); }
  }
  // 잠깐 쉬기·뒤로 가기
  try{ hide(); P.S.attract=false; document.body.classList.remove('attract'); P.setCourse('home'); P.startRound('today'); await sleep(200); P.back(); await sleep(100); out.push('pause by back='+!document.getElementById('pause').hidden);
    P.back(); await sleep(100); out.push('pause closed by back='+document.getElementById('pause').hidden); }catch(e){ out.push('pause THROW '+e.message); }
  return out; });
console.log(MODE, res.join(' | '));
console.log('errors', errs.length? errs.join('\n'):'none');
await br.close();
const bad=res.filter(x=>/=false|THROW/.test(x));
if(bad.length||errs.length){ console.log('FAIL', bad.join(' | ')); process.exit(1); } console.log('PASS (흐름 시험 — 강제 홀 완료 포함)');})().catch(e=>{ console.error(e); process.exit(1); });
