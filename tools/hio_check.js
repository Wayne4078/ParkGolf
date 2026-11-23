// 홀인원 쉬움 재기: 모든 정규 코스·홀의 티에서 "컵 쪽으로 똑바로(±1.5°)" 친다고 할 때 홀인원 확률
// 세기는 두 묶음: 아무 세기(20~100%) / 거의 최대(90~100%, 「파워로 막 쳐도」) — 일반공, 맑음, 바람 없음, 핀 0
// 쓰는 법: (서버 켠 뒤) BASE=http://localhost:8765 node tools/hio_check.js
const {chromium}=require('playwright');
(async()=>{ const br=await chromium.launch(); const pg=await (await br.newContext({viewport:{width:360,height:640}})).newPage();
 await pg.goto((process.env.BASE||'http://localhost:8765')+'/index.html?sim&all'); await pg.waitForTimeout(3800);
 const r=await pg.evaluate(()=>{ const P=__pg,S=P.S; document.querySelectorAll('.screen,#title,#rating,#holeDone').forEach(e=>e.hidden=true);
   let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; }; const gauss=()=>{ let u=0,v=0; while(!u)u=rnd(); while(!v)v=rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
   const out={}; let tot={a:[0,0],f:[0,0]};
   for(const k of ['home','jamsil','hapcheon','pond','ferry','lake','sea','temple','reed','village','sunrise']){ P.setCourse(k); P.startRound('practice'); S.wx='clear'; S.ball='normal';
     let a=[0,0], f=[0,0];
     for(let i=0;i<P.HOLES.length;i++){ S.hi=i; S.pins[i]=0; P.loadHole(); S.intro=null; const t0={...S.pos}, c=P.cup(), base=Math.atan2(c[1]-t0.y,c[0]-t0.x);
       for(const [grp,lo,hi,n] of [['a',0.2,1,60],['f',0.9,1,30]]) for(let j=0;j<n;j++){ const ang=base+gauss()*1.5*Math.PI/180, pw=lo+(hi-lo)*rnd();
         S.pos={...t0}; S.vel={x:Math.cos(ang)*P.MAXV*pw,y:Math.sin(ang)*P.MAXV*pw}; S.moving=true; S.holeOver=false; S.sink=null; S.lip=0;
         for(let t=0;t<2000&&S.moving&&!S.sink;t++) P.step(P.H_()); const hit=S.sink?1:0; S.sink=null;
         if(grp==='a'){a[0]+=hit;a[1]++;} else {f[0]+=hit;f[1]++;} } }
     out[k]=[(100*a[0]/a[1]).toFixed(1),(100*f[0]/f[1]).toFixed(1)]; tot.a[0]+=a[0];tot.a[1]+=a[1];tot.f[0]+=f[0];tot.f[1]+=f[1]; }
   out.ALL=[(100*tot.a[0]/tot.a[1]).toFixed(1),(100*tot.f[0]/tot.f[1]).toFixed(1)]; return out; });
 console.log('코스: 아무세기% / 거의최대%'); for(const k in r) console.log(k, r[k][0], '/', r[k][1]); await br.close(); })();
