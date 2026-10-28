// 라이엇 최신 데이터드래곤에서 168+ 전 챔피언 한글 맵 자동 캐싱
let CACHED_CHAMP_MAP = null;

async function getChampionMap() {
  if (CACHED_CHAMP_MAP) return CACHED_CHAMP_MAP;
  try {
    const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionRes.json();
    const latestVersion = versions[0];

    const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ko_KR/champion.json`);
    const champData = await champRes.json();

    const map = {};
    for (const key in champData.data) {
      const champ = champData.data[key];
      map[champ.key] = champ.name; // ID(숫자문자열) -> 한글명 (예: "799" -> "암베사")
      map[champ.id.toLowerCase()] = champ.name; // 영문ID -> 한글명 (예: "ambessa" -> "암베사")
    }
    CACHED_CHAMP_MAP = map;
    return map;
  } catch (e) {
    return {};
  }
}

// Vercel Serverless Function: Riot Games Official API Proxy
export default async function handler(req, res) {
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
    // 1. 소환사 PUUID 조회
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RIOT_API_KEY}`
    );
    
    if (!accountRes.ok) {
      return res.status(accountRes.status).json({ error: `라이엇 계정 조회 실패 (${accountRes.status})` });
    }
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. 솔로랭크 / 자유랭크 티어 정보 조회
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

    // 3. 최신 챔피언 한글 맵 로드
    const champMap = await getChampionMap();

    // 4. 🌟 이번 시즌 실시간 솔로랭크(420) 최근 매치 분석 -> 최다 플레이 챔피언 Top 3 추출
    let mostChamps = [];
    try {
      const matchIdsRes = await fetch(
        `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=15&api_key=${RIOT_API_KEY}`
      );
      const matchIds = await matchIdsRes.json();

      if (Array.isArray(matchIds) && matchIds.length > 0) {
        const champCounts = {};
        
        // 최근 랭크 매치 8경기를 병렬 조회하여 챔피언 빈도수 집계
        const targetMatches = matchIds.slice(0, 8);
        await Promise.all(targetMatches.map(async (mId) => {
          try {
            const mRes = await fetch(`https://asia.api.riotgames.com/lol/match/v5/matches/${mId}?api_key=${RIOT_API_KEY}`);
            if (mRes.ok) {
              const mData = await mRes.json();
              const p = mData.info?.participants?.find(part => part.puuid === puuid);
              if (p && p.championName) {
                const korName = champMap[p.championName.toLowerCase()] || champMap[p.championId?.toString()] || p.championName;
                champCounts[korName] = (champCounts[korName] || 0) + 1;
              }
            }
          } catch (e) {}
        }));

        const sorted = Object.keys(champCounts).sort((a, b) => champCounts[b] - champCounts[a]);
        if (sorted.length > 0) {
          mostChamps = sorted.slice(0, 3);
        }
      }
    } catch (e) {}

    // 5. 랭크 판수가 부족하여 매치 모스트가 안 나올 경우 숙련도 Top 3로 자동 대체(Fallback)
    if (mostChamps.length === 0) {
      try {
        const masteryRes = await fetch(
          `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3&api_key=${RIOT_API_KEY}`
        );
        const masteryData = await masteryRes.json();
        if (Array.isArray(masteryData)) {
          mostChamps = masteryData.map(m => champMap[m.championId.toString()] || `챔프(${m.championId})`);
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
