/* 계류장 내 위치 — Vercel 미들웨어: 자료·로직 요청을 맥미니로 넘길 때 비밀 머리글·방문자 IP 를 붙인다 (2026-10-29 · noisewatch 와 같은 방식)
 * 비밀값은 Vercel 환경변수 RV_EDGE_SECRET 에만 있다(코드·저장소에 없음) — 맥미니는 그 값이 맞을 때만 받는다(Funnel 직접 접속 차단). */
export const config = { matcher: ['/rv/:path*', '/app/:path*', '/data/:path*', '/vworld/:path*'] };

const ORIGIN = 'https://macmini.tail95ff38.ts.net:8443';

export default async function middleware(request) {
  const u = new URL(request.url);
  const h = new Headers();
  for (const k of ['accept', 'accept-language', 'content-type', 'cookie']) { const v = request.headers.get(k); if (v) h.set(k, v); }
  const ip = (request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0] || '').trim();
  if (ip) h.set('x-rv-client', ip);
  const s = process.env.RV_EDGE_SECRET;
  if (s) h.set('x-rv-edge', s);
  const init = { method: request.method, headers: h, redirect: 'manual' };
  if (request.method === 'POST') init.body = await request.arrayBuffer();
  const r = await fetch(ORIGIN + u.pathname + u.search, init);
  const out = new Headers(r.headers);
  out.delete('content-encoding'); out.delete('content-length');      // 본문은 이미 풀려 있다 — 원래 길이·압축 표시를 두면 브라우저가 깨진다
  return new Response(r.body, { status: r.status, headers: out });
}
