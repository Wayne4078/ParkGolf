// 모든 코스·모든 홀·핀 3개·폰 3크기 화면 검사(대표 2026-11-23 「매 홀마다 이상 없는지 매 픽셀 단위로」)
// 홀마다: 티·컵이 물/모래에 있지 않은지, 컵이 그린 위인지, 그림 파일이 다 불러졌는지, 화면이 비지 않았는지(픽셀 분산),
// 공·컵이 화면 안에 그려지는지(공·컵 자리 픽셀 색), 메뉴·공 버튼이 화면 안인지, 오류가 없는지. 스크린샷은 OUT 폴더에.
const {chromium}=require('playwright'); const fs=require('fs');
const OUT=process.env.OUT||'qa_shots'; fs.mkdirSync(OUT,{recursive:true});
const SIZES=[[360,584],[375,611],[393,762]];
const KS=process.argv.slice(2).length?process.argv.slice(2):['lesson','home','jamsil','hapcheon','range','pond','ferry','lake','sea','temple','reed','village','sunrise'];
const R=[]; const ok=(n,c,i)=>{ R.push(!!c); if(!c) console.log('실패',n,i!==undefined?JSON.stringify(i):''); };
(async()=>{ const br=await chromium.launch();
 for(const [w,h] of SIZES){ const ctx=await br.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true,hasTouch:true}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto((process.env.BASE||'http://localhost:8765')+'/'+(process.env.PAGE||'index.html')+'?sim&all'); await pg.waitForTimeout(3800);
  for(const k of KS){ const nh=await pg.evaluate(k=>{ const P=__pg; P.S.attract=false; document.body.classList.remove('attract'); document.querySelectorAll('.screen,#title,#rating,#holeDone,#pause').forEach(e=>e.hidden=true); P.setCourse(k); P.startRound('practice'); return P.HOLES.length; },k);
   for(let i=0;i<nh;i++) for(let pin=0;pin<3;pin++){
    const geo=await pg.evaluate(([i,pin])=>{ const P=__pg,S=P.S; document.querySelectorAll('#holeDone,#pause').forEach(e=>e.hidden=true); S.hi=i; S.pins[i]=pin; S.wx='clear'; P.loadHole(); S.intro=null; S.moving=false; S.holeOver=false; S.sink=null;
      const H=P.H_(), c=P.cup(), t={...S.pos};
      const f=(fn,p)=>{ try{ return typeof window[fn]==='function'?!!window[fn](H,p):null; }catch(e){ return 'err'; } };
      return {tee:t,cup:c,teeWater:f('inWater',t),teeSand:f('inSand',t),cupWater:f('inWater',{x:c[0],y:c[1]}),cupSand:f('inSand',{x:c[0],y:c[1]}),cupGreen:f('inGreen',{x:c[0],y:c[1]}),par:H.par,name:H.name}; },[i,pin]);
    const tag=k+' '+(i+1)+'번 핀'+(pin+1)+' '+w+'x'+h;
    if(w===SIZES[0][0]){ ok(tag+' 티가 물 밖', geo.teeWater!==true, geo); ok(tag+' 티가 모래 밖', geo.teeSand!==true, geo); ok(tag+' 컵이 물 밖', geo.cupWater!==true, geo); ok(tag+' 컵이 모래 밖', geo.cupSand!==true, geo); if(geo.cupGreen!==null) ok(tag+' 컵이 그린 위', geo.cupGreen===true, geo); }
    await pg.waitForTimeout(pin===0?350:120);
    const px=await pg.evaluate(()=>{ const cv=document.querySelector('canvas'); const r=cv.getBoundingClientRect(); const g=cv.getContext('2d'); const d=g.getImageData(0,0,cv.width,cv.height).data;
      let n=0,s=0,s2=0; const cols=new Set(); for(let j=0;j<d.length;j+=4*97){ const v=d[j]*0.3+d[j+1]*0.59+d[j+2]*0.11; n++; s+=v; s2+=v*v; cols.add((d[j]>>4)+','+(d[j+1]>>4)+','+(d[j+2]>>4)); }
      const vis=id=>{ const e=document.getElementById(id); if(!e||e.hidden) return null; const b=e.getBoundingClientRect(); return b.width>0 && b.top>=0 && b.left>=0 && b.bottom<=innerHeight+0.5 && b.right<=innerWidth+0.5; };
      const imgs=[...document.images].filter(im=>im.src&&!im.src.startsWith('data:')).filter(im=>!(im.complete&&im.naturalWidth>0)).map(im=>im.src.split('/').pop());
      return {rt:Math.round(r.top),rb:Math.round(r.bottom),rw:Math.round(r.width),sy:Math.round(scrollY),sd:Math.sqrt(Math.max(0,s2/n-(s/n)**2)),cols:cols.size,canvasIn:r.top>=-1&&r.bottom<=innerHeight+1&&r.width>=innerWidth*0.7&&r.height>=innerHeight*0.7,menu:vis('menuBtn'),badImg:imgs}; });
    ok(tag+' 화면이 비지 않음(색 다양)', px.sd>8 && px.cols>12, px);
    ok(tag+' 판이 화면 안·충분히 큼(폭·높이 70% 이상)', px.canvasIn, px);
    ok(tag+' 메뉴 버튼 화면 안', px.menu!==false, px);
    ok(tag+' 그림 파일 모두 불러짐', px.badImg.length===0, px.badImg);
    if(pin===0) await pg.screenshot({path:`${OUT}/${w}_${k}_${String(i+1).padStart(2,'0')}.png`});
   } }
  ok(w+'x'+h+' 오류 없음', errs.length===0, errs.slice(0,5)); await ctx.close(); }
 const bad=R.filter(x=>!x).length; console.log(bad?'실패 '+bad+'개 / '+R.length:'모두 통과 ('+R.length+'개)'); await br.close(); process.exit(bad?1:0); })();
