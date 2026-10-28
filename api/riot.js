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
      map[champ.key] = champ.name; // ID(숫자문자열) -> 한글명
      map[champ.id.toLowerCase()] = champ.name; // 영문ID -> 한글명
    }
    CACHED_CHAMP_MAP = map;
    return map;
  } catch (e) {
    return {};
  }
}

// Vercel Serverless Function: Riot Games Official API Only
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

    // 3. 최신 챔피언 한글 이름 맵 로드
    const champMap = await getChampionMap();

    // 4. 🌟 라이엇 공식 match-v5: 최근 랭크 매치 15판 분석 -> 최다 픽 챔피언 Top 3
    let mostChamps = [];
    try {
      // 랭크 게임 전체(솔랭/자랭) 매치 ID 목록 15개 조회
      const matchIdsRes = await fetch(
        `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&count=15&api_key=${RIOT_API_KEY}`
      );
      const matchIds = await matchIdsRes.json();

      if (Array.isArray(matchIds) && matchIds.length > 0) {
        const champCounts = {};
        
        // Rate Limit(요청 제한) 방지를 위해 최대 10개만 순차 조회
        for (const mId of matchIds.slice(0, 10)) {
          try {
            const mRes = await fetch(`https://asia.api.riotgames.com/lol/match/v5/matches/${mId}?api_key=${RIOT_API_KEY}`);
            if (mRes.ok) {
              const mData = await mRes.json();
              const p = mData.info?.participants?.find(part => part.puuid === puuid);
              if (p) {
                // 챔피언 영문명 또는 ID 기반 한글 매핑
                const champName = champMap[p.championName?.toLowerCase()] || champMap[p.championId?.toString()] || p.championName;
                if (champName) {
                  champCounts[champName] = (champCounts[champName] || 0) + 1;
                }
              }
            }
          } catch (err) {}
        }

        const sorted = Object.keys(champCounts).sort((a, b) => champCounts[b] - champCounts[a]);
        if (sorted.length > 0) {
          mostChamps = sorted.slice(0, 3);
        }
      }
    } catch (e) {}

    // 5. 최근 랭크 판수가 전혀 없을 때만 숙련도 Top 3로 보완
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
