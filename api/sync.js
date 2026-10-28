// GitHub Gist/Repository 기반 글로벌 동기화 엔드포인트
let memoryCache = null;
let lastUpdate = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. 데이터 조회 (모바일/PC 공통)
  if (req.method === 'GET') {
    try {
      // 1순위: npoint 공용 오픈 스토리지 (인증키 불필요, 100% 무료 무제한 읽기/쓰기)
      const cloudRes = await fetch("https://api.npoint.io/0822e57303d7f0ec689a");
      if (cloudRes.ok) {
        const data = await cloudRes.json();
        if (data && data.summoners && data.summoners.length > 0) {
          return res.status(200).json(data);
        }
      }
    } catch (e) {}

    // 인메모리 캐시 보존
    return res.status(200).json(memoryCache || { summoners: [], updatedAt: lastUpdate });
  }

  // 2. 데이터 저장 (PC에서 19명 푸시)
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      payload.updatedAt = Date.now();
      memoryCache = payload;
      lastUpdate = payload.updatedAt;

      // 인증키 필요 없는 영구 오픈 스토리지에 즉시 기록
      await fetch("https://api.npoint.io/0822e57303d7f0ec689a", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return res.status(200).json({ success: true, timestamp: payload.updatedAt });
    } catch (e) {
      return res.status(200).json({ success: true, memoryOnly: true, timestamp: Date.now() });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
