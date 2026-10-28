// Vercel Serverless Function: Riot Games Match-v5 Detail Proxy
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { matchId } = req.query;
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-a6320551-eb63-4c17-ad45-75ce5332f201";

  if (!matchId) {
    return res.status(400).json({ error: "matchId가 필요합니다." });
  }

  // 매치 ID 형식 정규화 (예: 1234567890 -> KR_1234567890)
  const formattedMatchId = matchId.includes('_') ? matchId : (matchId.startsWith('KR-') ? matchId.replace('-', '_') : `KR_${matchId}`);

  try {
    const matchRes = await fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${formattedMatchId}?api_key=${RIOT_API_KEY}`
    );

    if (!matchRes.ok) {
      return res.status(matchRes.status).json({ error: `라이엇 매치 데이터 조회 실패 (${matchRes.status})` });
    }

    const matchData = await matchRes.json();
    const info = matchData.info;

    // 10명의 플레이어 데이터 정제 및 딥롤 AI-Score 계산
    const players = info.participants.map(p => {
      // 딥롤 스타일 퍼포먼스 점수 계산 (KDA, 딜량, CS, 골드, 시야 종합)
      const kdaRatio = p.deaths === 0 ? (p.kills + p.assists) * 1.2 : ((p.kills + p.assists) / p.deaths);
      const damageScore = Math.min(35, (p.totalDamageDealtToChampions / 1000) * 1.5);
      const csScore = Math.min(25, (p.totalMinionsKilled + p.neutralMinionsKilled) / (info.gameDuration / 60) * 3);
      const visionScore = Math.min(15, p.visionScore * 0.5);
      const killPartScore = Math.min(25, (p.killParticipation || 0.5) * 25);
      
      const aiScore = Math.min(99, Math.max(30, Math.round(20 + (kdaRatio * 4) + damageScore + csScore + visionScore)));

      return {
        name: `${p.riotIdGameName || p.summonerName}#${p.riotIdTagline || 'KR1'}`,
        champion: p.championName,
        teamId: p.teamId, // 100: 블루, 200: 레드
        win: p.win,
        role: p.teamPosition || 'NONE',
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        kda: p.deaths === 0 ? 'Perfect' : ((p.kills + p.assists) / p.deaths).toFixed(2),
        damage: p.totalDamageDealtToChampions,
        cs: p.totalMinionsKilled + p.neutralMinionsKilled,
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
        aiScore: aiScore
      };
    });

    // 점수 순 랭킹 및 MVP 선정
    players.sort((a, b) => b.aiScore - a.aiScore);
    const mvp = players.find(p => p.win) || players[0];

    const blueTeam = players.filter(p => p.teamId === 100);
    const redTeam = players.filter(p => p.teamId === 200);
    const blueWin = blueTeam.some(p => p.win);

    return res.status(200).json({
      matchId: formattedMatchId,
      gameDurationMinutes: Math.floor(info.gameDuration / 60),
      winner: blueWin ? 'BLUE' : 'RED',
      mvp: mvp.name,
      blueTeam,
      redTeam
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
