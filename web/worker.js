// 클라우드플레어 Worker 「arinplay-parkgolf」 코드 (play.arinplay.app/ParkGolf/)
// 원격 설정 /config.json: notice(공지)·notice_th·stop(긴급 정지)·stopMsg·release({pond:'2026-11-14'} 코스 여는 날 바꾸기)
// 설정을 바꾸려면 CONFIG만 고쳐 이 Worker를 다시 올림(토스 심사 필요 없음). 정적 파일은 ASSETS(index.html·art·voice·amb·fonts).
const CONFIG = {"notice":"","notice_th":"","stop":false,"stopMsg":"","release":{}};
export default { async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/config.json')) {
    const h = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: h });
    return new Response(JSON.stringify(CONFIG), { headers: h });
  }
  return env.ASSETS.fetch(request);
} };
