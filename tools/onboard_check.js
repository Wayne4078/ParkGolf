// 처음 손님 첫 1분 검사(v88, 대표 2026-11-24 17:24 "진행해" — 11/24 혜택탭 손님 564명 흐름 분석 뒤)
// ① 처음 온 손님은 첫 화면 없이 바로 배우기 1번 홀 ② 공 밖 아무 데서나 당겨도 쳐짐 ③ 1번 홀 끝나면 「우리 동네 코스로 ▶」 한 번에 진짜 코스
// ④ 한 번 온 손님은 첫 화면 그대로 ⑤ 서툰 손님 흉내(방향 ±20°·힘 아무렇게)로 1번 홀 5타 안에 넣는 비율 — NEWBIE_MIN(기본 0.8) 이상
const {chromium,devices}=require('playwright');
const R=[]; const ok=(n,c,i)=>{ R.push(!!c); console.log((c?'통과':'실패'),n,i!==undefined?JSON.stringify(i):''); };
const BASE=process.env.BASE||'http://localhost:8765', MIN=+(process.env.NEWBIE_MIN||0.8);
(async()=>{ const br=await chromium.launch();
 const ctx=await br.newContext({...devices['Pixel 5']}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(BASE+'/index.html?sim'); await pg.evaluate(()=>localStorage.clear()); await pg.reload(); await pg.waitForTimeout(1500); const ratingOn=await pg.evaluate(()=>!!document.getElementById('rating')); await pg.waitForTimeout(2600); // 토스 밖에선 등급 표시가 3.2초 덮음
 const s1=await pg.evaluate(()=>({title:!document.getElementById('title').hidden, c:(__pg.COURSE||{}).key, hi:__pg.S.hi, live:__pg.S.live, assist:__pg.S.assist, q:__pg.S.quickLesson}));
 ok('① 처음 손님: 첫 화면 없이 바로 배우기 1번 홀(누르지 않아도)', !s1.title && s1.c==='lesson' && s1.hi===0 && s1.assist && s1.q, s1);
 // ② 공에서 먼 곳을 아래로 당겼다 놓기
 const far=await pg.evaluate(()=>{ const cv=document.querySelector('canvas'), r=cv.getBoundingClientRect(); return {x:r.left+r.width*0.85, y:r.top+r.height*0.3}; });
 await pg.mouse.move(far.x,far.y); await pg.mouse.down(); await pg.mouse.move(far.x,far.y+70,{steps:6}); await pg.mouse.up(); await pg.waitForTimeout(300);
 ok('② 공 밖에서 당겨도 샷이 나감', await pg.evaluate(()=>__pg.S.strokes[0]===1));
 // ③ 1번 홀 끝내기 → 다음 버튼
 await pg.evaluate(()=>{ const S=__pg.S; S.moving=false; S.vel={x:0,y:0}; __pg.holeOut(false,true); });
 await pg.waitForTimeout(900);
 const nx=await pg.evaluate(()=>({vis:!document.getElementById('holeDone').hidden, t:document.getElementById('next').textContent}));
 ok('③ 1번 홀 끝: 버튼 「우리 동네 코스로 ▶」', nx.vis && nx.t==='우리 동네 코스로 ▶', nx);
 await pg.click('#next'); await pg.waitForTimeout(700);
 const s3=await pg.evaluate(()=>({c:(__pg.COURSE||{}).key, live:__pg.S.live, mode:__pg.S.mode, done:localStorage.getItem('opg_lesson_done'), q:__pg.S.quickLesson, screens:[...document.querySelectorAll('.screen')].filter(e=>!e.hidden).map(e=>e.id)}));
 ok('③ 누르면 바로 우리 동네 오늘 라운드 1번 홀, 배우기 끝 표시', s3.c==='home' && s3.mode==='today' && s3.done==='1' && !s3.q && s3.screens.length===0, s3);
 await pg.reload(); await pg.waitForTimeout(1500);
 ok('④ 한 번 온 손님: 첫 화면 그대로', await pg.evaluate(()=>!document.getElementById('title').hidden));
 await pg.evaluate(()=>localStorage.clear()); await pg.goto(BASE+'/index.html?sim&title'); await pg.waitForTimeout(1500);
 ok('④ ?title 붙이면 처음 손님도 첫 화면(광고 소재 녹화용)', await pg.evaluate(()=>!document.getElementById('title').hidden));
 ok('오류 없음', errs.length===0, errs.slice(0,3));
 // ⑤ 서툰 손님 흉내
 const sim=async base=>{ const p2=await (await br.newContext({viewport:{width:360,height:640}})).newPage(); await p2.goto(base+'/index.html?sim&all'); await p2.waitForTimeout(3800);
   const r=await p2.evaluate(()=>{ const P=__pg,S=P.S; document.querySelectorAll('.screen,#title,#rating,#holeDone').forEach(e=>e.hidden=true); P.setCourse('lesson'); P.startRound('practice'); S.wx='clear';
     let seed=7; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648; }; let sunk=0, tot=0, N=300;
     for(let t=0;t<N;t++){ S.hi=0; P.loadHole(); S.intro=null; S.assist=true; let n=0, inn=false;
       while(n<5 && !inn){ const c=P.cup(), base=Math.atan2(c[1]-S.pos.y,c[0]-S.pos.x), ang=base+(rnd()*2-1)*20*Math.PI/180, f=0.3+rnd()*0.7;
         S.vel={x:Math.cos(ang)*P.MAXV*f,y:Math.sin(ang)*P.MAXV*f}; S.moving=true; S.holeOver=false; S.sink=null; n++; S.strokes[0]=n;
         for(let k=0;k<3000&&S.moving&&!S.holeOver&&!S.sink;k++) P.step(P.H_());
         if(S.holeOver||S.sink){ inn=true; } S.vel={x:0,y:0}; S.moving=false; S.sink=null; S.holeOver=false; }
       if(inn){ sunk++; tot+=n; } }
     return {rate:sunk/N, avg:sunk?tot/sunk:null}; });
   await p2.context().close(); return r; };
 const now=await sim(BASE); console.log('   서툰 손님 1번 홀 5타 안 성공률', now);
 if(process.env.OLD_BASE){ const old=await sim(process.env.OLD_BASE); console.log('   (비교) 이전 판', old); }
 ok('⑤ 서툰 손님 흉내 1번 홀 5타 안 비율 '+MIN+' 이상(물리는 v87과 같음 — 바뀌지 않았는지 확인)', now.rate>=MIN, now);
 const bad=R.filter(x=>!x).length; console.log(bad?'실패 '+bad+'개':'모두 통과 ('+R.length+'개)'); await br.close(); process.exit(bad?1:0); })();
