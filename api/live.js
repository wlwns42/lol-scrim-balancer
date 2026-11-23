// api/live.js - Spectator-V5 실시간 인게임 상태 조회
const QUEUE_LABELS = {
  420: '솔랭',
  440: '자랭',
  400: '일반',
  430: '일반',
  450: '칼바람',
  490: '빠른대전',
  700: '격전',
  1700: '아레나',
  0: '사설'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const raw = (req.query.puuids || '').trim();
  if (!raw) return res.status(200).json({ statuses: {} });

  const puuids = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20);
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-a6320551-eb63-4c17-ad45-75ce5332f201";

  const statuses = {};
  await Promise.all(puuids.map(async (puuid) => {
    try {
      const r = await fetch(
        `https://kr.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(puuid)}?api_key=${RIOT_API_KEY}`
      );
      if (r.ok) {
        const g = await r.json();
        const startMs = g.gameStartTime || 0;
        const minutes = startMs > 0
          ? Math.max(0, Math.floor((Date.now() - startMs) / 60000))
          : Math.max(0, Math.floor((g.gameLength || 0) / 60));
        const queueName = QUEUE_LABELS[g.gameQueueConfigId] || (g.gameType === 'CUSTOM_GAME' ? '사설' : '게임 중');
        statuses[puuid] = { inGame: true, queueName, minutes };
      } else {
        statuses[puuid] = { inGame: false };
      }
    } catch (e) {
      statuses[puuid] = { inGame: false };
    }
  }));

  return res.status(200).json({ statuses, checkedAt: Date.now() });
}
