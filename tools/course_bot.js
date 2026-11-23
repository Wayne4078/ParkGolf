// 코스 봇: 홀마다 실제 물리로 「컵까지 남은 거리가 가장 줄어드는 샷」을 골라 치며 몇 타에 들어가는지 잰다(바람 없음·맑음·첫 번째 핀)
// 쓰는 법: (서버 8765 켠 뒤) node tools/course_bot.js lake sea   → 홀마다 타수, 8타 안에 못 넣으면 실패(종료 코드 1)
const {chromium}=require('playwright'); const KS=process.argv.slice(2);
(async()=>{ const br=await chromium.launch(); const pg=await (await br.newContext({viewport:{width:360,height:640}})).newPage();
 await pg.goto((process.env.BASE||'http://localhost:8765')+'/index.html?sim&all'); await pg.waitForTimeout(3800); let bad=0;
 for(const k of KS){ const r=await pg.evaluate(k=>{ const P=__pg, S=P.S; document.querySelectorAll('.screen,#title,#rating,#holeDone').forEach(e=>e.hidden=true);
   P.setCourse(k); P.startRound('practice'); S.wx='clear'; const out=[];
   for(let i=0;i<P.HOLES.length;i++){ S.hi=i; S.pins[i]=0; P.loadHole(); S.intro=null; let n=0, inn=false;
     while(n<8 && !inn){ const start={...S.pos}, c=P.cup(); let best=null;
       for(let a=0;a<72 && !(best&&best.d<0);a++) for(const f of [0.15,0.25,0.35,0.45,0.55,0.7,0.85,1]){ const ang=a/72*Math.PI*2;
         S.pos={...start}; S.vel={x:Math.cos(ang)*P.MAXV*f,y:Math.sin(ang)*P.MAXV*f}; S.moving=true; S.holeOver=false; S.sink=null;
         for(let t=0;t<1500&&S.moving&&!S.holeOver&&!S.sink;t++) P.step(P.H_());
         const done=S.holeOver||!!S.sink, d=Math.hypot(S.pos.x-c[0],S.pos.y-c[1]);
         if(done){ best={ang,f,d:-1}; break; } if(!best||d<best.d) best={ang,f,d,pos:{...S.pos}}; }
       n++; if(best.d<0){ inn=true; break; } S.pos=best.pos; S.vel={x:0,y:0}; S.moving=false; S.sink=null; S.holeOver=false; }
     out.push({n:i+1,par:P.HOLES[i].par,s:inn?n:null}); }
   return out; },k);
   const fail=r.filter(x=>x.s===null); bad+=fail.length;
   console.log(k, r.map(x=>x.n+':'+(x.s??'X')+'/'+x.par).join(' '), fail.length?'못 넣은 홀 '+fail.map(x=>x.n).join(','):'전 홀 들어감'); }
 await br.close(); process.exit(bad?1:0); })();
