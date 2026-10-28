// 라이엇 공식 최신 데이터드래곤 챔피언 매핑 캐시
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
      map[champ.key] = champ.name;
      map[champ.id.toLowerCase()] = champ.name;
    }
    CACHED_CHAMP_MAP = map;
    return map;
  } catch (e) {
    return {};
  }
}

// FOW 3년치/전체 시즌 최다 판수 챔피언 추출 함수
async function fetchFowMostFromBackend(name, tag) {
  try {
    const url = `https://fow.kr/find/${encodeURIComponent(name.trim())}-${encodeURIComponent(tag.trim())}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();

    const champCounts = {};
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      const rowHtml = match[1];
      const nameMatch = rowHtml.match(/class=['"]c_name['"][^>]*>([^<]+)<\/td>/i) ||
                        rowHtml.match(/tipsy_live[^>]*>([^<]+)<\/td>/i) ||
                        rowHtml.match(/>([가-힣A-Za-z\s]{2,10})<\/td>\s*<td[^>]*>\d+<\/td>/i);
      const gamesMatch = rowHtml.match(/<td[^>]*>(\d+)<\/td>/i);

      if (nameMatch && gamesMatch) {
        const cName = nameMatch[1].trim();
        const games = parseInt(gamesMatch[1], 10);
        if (cName && !isNaN(games) && games > 0 && !cName.includes('%') && !['솔로랭크', '자유랭크', '전체'].includes(cName)) {
          champCounts[cName] = (champCounts[cName] || 0) + games;
        }
      }
    }

    const sorted = Object.keys(champCounts).sort((a, b) => champCounts[b] - champCounts[a]);
    return sorted.length > 0 ? sorted.slice(0, 3) : null;
  } catch (e) {
    return null;
  }
}

// Vercel Serverless Function
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
    // 1. 소환사 계정 PUUID 조회
    const accountRes = await fetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RIOT_API_KEY}`
    );
    if (!accountRes.ok) {
      return res.status(accountRes.status).json({ error: `라이엇 계정 조회 실패 (${accountRes.status})` });
    }
    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // 2. 솔랭/자랭 티어 정보 조회
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

    // 3. 🌟 FOW 3년치 누적 모스트 백엔드 직접 수집
    let mostChamps = await fetchFowMostFromBackend(name, tag);

    // 4. FOW 수집 실패 시 라이엇 공식 숙련도로 자동 대체(Fallback)
    if (!mostChamps || mostChamps.length === 0) {
      try {
        const champMap = await getChampionMap();
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
      mostChamps: mostChamps || []
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
