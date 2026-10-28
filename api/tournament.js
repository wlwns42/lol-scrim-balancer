// api/tournament.js - 라이엇 공식 토너먼트 코드 발급 백엔드
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-ebed5956-830d-40ab-a08f-3b932827f94a';
  const TOURNAMENT_ID = 2; // 방금 발급된 Tournament ID

  try {
    // 라이엇 공식 TOURNAMENT-STUB-V5 코드 생성 호출
    const riotRes = await fetch(`https://americas.api.riotgames.com/lol/tournament-stub/v5/codes?tournamentId=${TOURNAMENT_ID}&count=1`, {
      method: 'POST',
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mapType: 'SUMMONERS_RIFT',
        pickType: 'TOURNAMENT_DRAFT',     // 대회용 교차선택(밴픽)
        spectatorType: 'ALL',              // 관전 허용
        teamSize: 5
      })
    });

    const data = await riotRes.json();

    if (!riotRes.ok) {
      return res.status(riotRes.status).json({ error: '라이엇 토너먼트 코드 발급 실패', details: data });
    }

    // data는 ["KR1234-TOURNAMENT-XYZ"] 형태의 배열로 반환됨
    const tournamentCode = Array.isArray(data) ? data[0] : data;
    return res.status(200).json({ success: true, code: tournamentCode });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
