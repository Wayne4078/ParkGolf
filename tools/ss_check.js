// 슈퍼샷 판 검사기: index.html 안의 SS 코어를 그대로 꺼내, 판마다 각도(1°)·힘(2%)을 전부 쳐 보고 들어간 비율을 냄.
// 0%인 판이 있으면 못 깨는 판. 실행: node tools/ss_check.js [판 번호...]
const fs=require('fs'),path=require('path');
const h=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const a=h.indexOf('const SS=(()=>{'), b=h.indexOf('// ================= 오늘의 슈퍼샷');
const SS=new Function(h.slice(a,b)+';return SS;')();
const only=process.argv.slice(2).map(Number);
let bad=0;
for(const L of SS.LV){ if(only.length&&!only.includes(L.id)) continue; let ok=0,n=0;
  for(let x=-179;x<=-1;x++) for(let p=0.04;p<=1.0001;p+=0.02){ n++; if(SS.simulate(L,x*Math.PI/180,p)) ok++; }
  if(!ok) bad++; console.log(String(L.id).padStart(2), L.ball.padEnd(6), (100*ok/n).toFixed(2)+'%', L.name); }
console.log(bad?('못 깨는 판 '+bad+'개'):'모든 판에 들어가는 길 있음'); process.exit(bad?1:0);
