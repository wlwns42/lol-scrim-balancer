// Vercel Serverless Function: Riot API + FOW 시즌 실전 모스트 파싱
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name, tag } = req.query;
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-a6320551-eb63-4c17-ad45-75ce5332f201";

  if (!name || !tag) {
    return res.status(400).json({ error: "소환사명과 태그가 필요합니다." });
  }

  try {
    // 1. 라이엇 공식 계정 정보 조회 (PUUID)
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RIOT_API_KEY}`
    );
    if (!accountRes.ok) {
      return res.status(accountRes.status).json({ error: `라이엇 계정 조회 실패 (${accountRes.status})` });
    }
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. 실시간 랭크 티어 정보 조회
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

    // 3. 🌟 FOW에서 이번 시즌 실시간 최다 플레이 모스트 3개 직접 파싱
    let mostChamps = [];
    try {
      const fowUrl = `https://fow.kr/find/${encodeURIComponent(name)}-${encodeURIComponent(tag)}`;
      const fowRes = await fetch(fowUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (fowRes.ok) {
        const html = await fowRes.text();
        // FOW 챔피언 테이블 행에서 챔피언 한글 이름 추출
        const champMatches = [...html.matchAll(/class=['"]c_name['"][^>]*>([^<]+)<\/td>/gi)];
        if (champMatches.length > 0) {
          mostChamps = champMatches.map(m => m[1].trim()).filter(Boolean).slice(0, 3);
        } else {
          // 대체 테이블 패턴 검색
          const altMatches = [...html.matchAll(/<td[^>]*tipsy_live[^>]*>([^<]+)<\/td>/gi)];
          if (altMatches.length > 0) {
            mostChamps = altMatches.map(m => m[1].trim()).filter(c => !c.includes('%') && isNaN(c)).slice(0, 3);
          }
        }
      }
    } catch (e) {}

    // FOW 조회가 안 될 경우 라이엇 공식 숙련도 Top 3 대체(Fallback)
    if (mostChamps.length === 0) {
      try {
        const masteryRes = await fetch(
          `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3&api_key=${RIOT_API_KEY}`
        );
        const masteryData = await masteryRes.json();
        const ddragonRes = await fetch('https://ddragon.leagueoflegends.com/cdn/14.20.1/data/ko_KR/champion.json');
        const ddragonData = await ddragonRes.json();
        const map = {};
        for (const k in ddragonData.data) {
          map[ddragonData.data[k].key] = ddragonData.data[k].name;
        }
        if (Array.isArray(masteryData)) {
          mostChamps = masteryData.map(m => map[m.championId.toString()] || `챔프(${m.championId})`);
        }
      } catch (e) {}
    }

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
