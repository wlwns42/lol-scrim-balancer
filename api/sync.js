// Vercel Serverless Sync API: 기기 간 실시간 데이터 동기화 엔드포인트
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 글로벌 무료 KV 저장소 (JSONbin 공용 버킷 사용)
  const BIN_URL = "https://api.jsonbin.io/v3/b/66f5e27fac2843472be9e31d";
  const MASTER_KEY = "$2a$10$wE47qK0b9wAomfI7zGvZf.4H8k8dFjGzE6bQW8j4sU8m5J2xR2e.y";

  if (req.method === 'GET') {
    try {
      const response = await fetch(`${BIN_URL}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY }
      });
      if (!response.ok) return res.status(200).json({ summoners: [] });
      const data = await response.json();
      return res.status(200).json(data.record || {});
    } catch (e) {
      return res.status(200).json({ summoners: [] });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = req.body;
      await fetch(BIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: typeof payload === 'string' ? payload : JSON.stringify(payload)
      });
      return res.status(200).json({ success: true, timestamp: Date.now() });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
