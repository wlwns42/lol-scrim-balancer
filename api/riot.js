// Vercel Serverless Function: Riot Games Official API Proxy
export default async function handler(req, res) {
  // CORS 허용 헤더
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { name, tag } = req.query;
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-a6320551-eb63-4c17-ad45-75ce5332f201";

  if (!name || !tag) {
    return res.status(400).json({ error: "소환사명과 태그가 필요합니다." });
  }

  try {
    // 1. Account-v1: PUUID 획득
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RIOT_API_KEY}`
    );
    
    if (!accountRes.ok) {
      return res.status(accountRes.status).json({ error: `라이엇 계정 조회 실패 (${accountRes.status})` });
    }
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. League-v4: 솔랭 및 자랭 티어, LP, 승/패수 획득
    const leagueRes = await fetch(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`
    );
    const leagueData = await leagueRes.json();

    let soloRank = null;
    let flexRank = null;

    if (Array.isArray(leagueData)) {
      leagueData.forEach(entry => {
        if (entry.queueType === 'RANKED_SOLO_5x5') {
          soloRank = {
            tier: entry.tier,
            rank: entry.rank,
            lp: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            totalGames: entry.wins + entry.losses,
            winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
          };
        } else if (entry.queueType === 'RANKED_FLEX_SR') {
          flexRank = {
            tier: entry.tier,
            rank: entry.rank,
            lp: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            totalGames: entry.wins + entry.losses,
            winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
          };
        }
      });
    }

    // 3. Champion-Mastery-v4: 모스트 상위 3개 챔피언 ID 획득
    const masteryRes = await fetch(
      `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3&api_key=${RIOT_API_KEY}`
    );
    const masteryData = await masteryRes.json();

    // 챔피언 ID -> 한글 이름 매핑 테이블
    const CHAMP_MAP = {
      "202": "진", "81": "이즈리얼", "15": "시비르", "51": "케이틀린", "145": "카이사", 
      "222": "징크스", "236": "루시안", "22": "애쉬", "110": "바루스", "895": "스몰더", 
      "268": "아지르", "61": "오리아나", "517": "사일러스", "157": "야스오", "777": "요네",
      "99": "럭스", "98": "쉔", "25": "모르가나", "111": "노틸러스", "412": "쓰레쉬",
      "83": "요릭", "122": "다리우스", "897": "크산테", "266": "아트록스", "64": "리 신", "113": "세주아니"
    };

    const mostChamps = Array.isArray(masteryData) 
      ? masteryData.map(m => CHAMP_MAP[m.championId.toString()] || `챔피언(${m.championId})`)
      : [];

    return res.status(200).json({
      name: `${accountData.gameName}#${accountData.tagLine}`,
      soloRank,
      flexRank,
      mostChamps
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
