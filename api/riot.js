// api/riot.js
async function scrapeFowProfile(name, tag) {
  try {
    const cleanName = name.trim();
    const cleanTag = tag.trim();
    const url = `https://fow.kr/find/${encodeURIComponent(cleanName)}-${encodeURIComponent(cleanTag)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (html.includes('존재하지 않는 소환사')) return null;

    let soloRank = null;
    const soloMatch = html.match(/솔로랭크[\s\S]*?(CHALLENGER|GRANDMASTER|MASTER|DIAMOND|EMERALD|PLATINUM|GOLD|SILVER|BRONZE|IRON)\s*([1-4IVX]*)\s*<\/b>[\s\S]*?(\d+[\d,]*)\s*LP[\s\S]*?(\d+)\s*승[\s\S]*?(\d+)\s*패/i);
    if (soloMatch) {
      const tier = soloMatch[1].toUpperCase();
      let rank = soloMatch[2].trim().toUpperCase() || 'I';
      if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(tier)) rank = 'I';
      const lp = parseInt(soloMatch[3].replace(/,/g, ''), 10) || 0;
      const wins = parseInt(soloMatch[4], 10) || 0;
      const losses = parseInt(soloMatch[5], 10) || 0;
      soloRank = { tier, rank, lp, wins, losses, totalGames: wins + losses, winRate: Math.round((wins / (wins + losses)) * 100) };
    }

    const champCounts = {};
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rMatch;
    while ((rMatch = rowRegex.exec(html)) !== null) {
      const rowHtml = rMatch[1];
      const nameMatch = rowHtml.match(/class=['"]c_name['"][^>]*>([^<]+)<\/td>/i) || rowHtml.match(/>([가-힣A-Za-z\s]{2,12})<\/td>\s*<td[^>]*>\d+<\/td>/i);
      const gamesMatch = rowHtml.match(/<td[^>]*>(\d+)<\/td>/i);
      if (nameMatch && gamesMatch) {
        const cName = nameMatch[1].trim();
        const games = parseInt(gamesMatch[1], 10);
        if (cName && !isNaN(games) && games > 0 && !cName.includes('%') && !['솔로랭크', '자유랭크', '전체', '모든챔피언'].includes(cName)) {
          champCounts[cName] = (champCounts[cName] || 0) + games;
        }
      }
    }
    const sortedChamps = Object.keys(champCounts).sort((a, b) => champCounts[b] - champCounts[a]);

    return {
      name: `${cleanName}#${cleanTag}`,
      soloRank,
      flexRank: null,
      mostChamps: sortedChamps.slice(0, 5),
      playedChamps: sortedChamps
    };
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name, tag, puuid } = req.query;
  const cleanName = (name || '').trim();
  const cleanTag = (tag || 'KR1').trim();
  const cleanPuuid = (puuid || '').trim();
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-403b181c-6b78-4d45-b34a-1e94f1c41401";

  if (!cleanName && !cleanPuuid) {
    return res.status(400).json({ error: "소환사명 또는 PUUID가 필요합니다." });
  }

  // 1차: 공식 라이엇 API 시도 (PUUID 우선 조회 -> 실패 시 Riot ID 폴백)
  try {
    let accData = null;

    if (cleanPuuid) {
      const puuidRes = await fetch(
        `https://asia.api.riotgames.com/riot/account/v1/accounts/by-puuid/${encodeURIComponent(cleanPuuid)}?api_key=${RIOT_API_KEY}`
      );
      if (puuidRes.ok) {
        accData = await puuidRes.json();
      }
    }

    if (!accData && cleanName) {
      const accRes = await fetch(
        `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(cleanName)}/${encodeURIComponent(cleanTag)}?api_key=${RIOT_API_KEY}`
      );
      if (accRes.ok) {
        accData = await accRes.json();
      }
    }

    if (accData && accData.puuid) {
      const latestName = (accData.gameName || cleanName).trim();
      const latestTag = (accData.tagLine || cleanTag).trim();

      const leagueRes = await fetch(
        `https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(accData.puuid)}?api_key=${RIOT_API_KEY}`
      );
      if (leagueRes.ok) {
        const leagueData = await leagueRes.json();
        let soloRank = null, flexRank = null;
        if (Array.isArray(leagueData)) {
          leagueData.forEach(e => {
            if (e.queueType === 'RANKED_SOLO_5x5') {
              soloRank = { tier: e.tier, rank: e.rank, lp: e.leaguePoints, wins: e.wins, losses: e.losses, totalGames: e.wins + e.losses, winRate: Math.round((e.wins / (e.wins + e.losses)) * 100) };
            }
            if (e.queueType === 'RANKED_FLEX_SR') {
              flexRank = { tier: e.tier, rank: e.rank, lp: e.leaguePoints, wins: e.wins, losses: e.losses, totalGames: e.wins + e.losses, winRate: Math.round((e.wins / (e.wins + e.losses)) * 100) };
            }
          });
        }

        // 닉변이 감지되었더라도 최신 닉네임으로 FOW 모스트 챔피언 조회
        const fowFallback = await scrapeFowProfile(latestName, latestTag);
        const mostChamps = (fowFallback && fowFallback.mostChamps && fowFallback.mostChamps.length > 0) ? fowFallback.mostChamps : [];
        const playedChamps = (fowFallback && fowFallback.playedChamps && fowFallback.playedChamps.length > 0) ? fowFallback.playedChamps : [];

        return res.status(200).json({
          name: `${latestName}#${latestTag}`,
          puuid: accData.puuid,
          soloRank,
          flexRank,
          mostChamps,
          playedChamps
        });
      }
    }
  } catch (e) {}

  // 2차: 공식 API 실패 또는 키 만료 시 FOW 전적 스크래핑 폴백
  if (cleanName) {
    const fallbackData = await scrapeFowProfile(cleanName, cleanTag);
    if (fallbackData) return res.status(200).json(fallbackData);
  }

  return res.status(404).json({ error: `[${cleanName ? `${cleanName}#${cleanTag}` : cleanPuuid}] 소환사를 찾을 수 없습니다.` });
}
