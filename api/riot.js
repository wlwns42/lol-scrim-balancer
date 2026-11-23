// api/riot.js - 공식 라이엇 API 기반 (Account-V1, League-V4, Summoner-V4, Champion-Mastery-V4)
let cachedChampMap = null;
let cachedChampAt = 0;

async function getChampionIdToKoMap() {
  if (cachedChampMap && (Date.now() - cachedChampAt < 12 * 60 * 60 * 1000)) {
    return cachedChampMap;
  }
  try {
    const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!verRes.ok) return cachedChampMap || {};
    const versions = await verRes.json();
    const latest = Array.isArray(versions) ? versions[0] : '15.24.1';
    const champRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/ko_KR/champion.json`);
    if (!champRes.ok) return cachedChampMap || {};
    const champJson = await champRes.json();
    const map = {};
    Object.values(champJson.data || {}).forEach(c => {
      if (c && c.key && c.name) map[String(c.key)] = c.name;
    });
    cachedChampMap = map;
    cachedChampAt = Date.now();
    return map;
  } catch (e) {
    return cachedChampMap || {};
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
  const RIOT_API_KEY = process.env.RIOT_API_KEY || "RGAPI-a6320551-eb63-4c17-ad45-75ce5332f201";

  if (!cleanName && !cleanPuuid) {
    return res.status(400).json({ error: "소환사명 또는 PUUID가 필요합니다." });
  }

  try {
    let accData = null;

    if (cleanPuuid) {
      const puuidRes = await fetch(
        `https://asia.api.riotgames.com/riot/account/v1/accounts/by-puuid/${encodeURIComponent(cleanPuuid)}?api_key=${RIOT_API_KEY}`
      );
      if (puuidRes.ok) accData = await puuidRes.json();
    }

    if (!accData && cleanName) {
      const accRes = await fetch(
        `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(cleanName)}/${encodeURIComponent(cleanTag)}?api_key=${RIOT_API_KEY}`
      );
      if (accRes.ok) accData = await accRes.json();
    }

    if (!accData || !accData.puuid) {
      return res.status(404).json({ error: `[${cleanName ? `${cleanName}#${cleanTag}` : cleanPuuid}] 소환사를 찾을 수 없습니다.` });
    }

    const targetPuuid = accData.puuid;
    const latestName = (accData.gameName || cleanName).trim();
    const latestTag = (accData.tagLine || cleanTag).trim();

    // League-V4, Summoner-V4, Champion-Mastery-V4, DDragon 병렬 조회
    const [leagueRes, summonerRes, masteryRes, champMap] = await Promise.all([
      fetch(`https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(targetPuuid)}?api_key=${RIOT_API_KEY}`),
      fetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(targetPuuid)}?api_key=${RIOT_API_KEY}`),
      fetch(`https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(targetPuuid)}/top?count=15&api_key=${RIOT_API_KEY}`),
      getChampionIdToKoMap()
    ]);

    let soloRank = null;
    let flexRank = null;
    if (leagueRes.ok) {
      const leagueData = await leagueRes.json();
      if (Array.isArray(leagueData)) {
        leagueData.forEach(e => {
          const total = (e.wins || 0) + (e.losses || 0);
          const rankObj = {
            tier: e.tier,
            rank: e.rank,
            lp: e.leaguePoints,
            wins: e.wins,
            losses: e.losses,
            totalGames: total,
            winRate: total > 0 ? Math.round((e.wins / total) * 100) : 0
          };
          if (e.queueType === 'RANKED_SOLO_5x5') soloRank = rankObj;
          if (e.queueType === 'RANKED_FLEX_SR') flexRank = rankObj;
        });
      }
    }

    let profileIconId = null;
    let summonerLevel = null;
    if (summonerRes.ok) {
      const sumData = await summonerRes.json();
      if (sumData) {
        profileIconId = sumData.profileIconId ?? null;
        summonerLevel = sumData.summonerLevel ?? null;
      }
    }

    let mostChamps = [];
    let playedChamps = [];
    if (masteryRes.ok) {
      const masteryData = await masteryRes.json();
      if (Array.isArray(masteryData)) {
        const names = masteryData
          .map(m => champMap[String(m.championId)])
          .filter(Boolean);
        mostChamps = names.slice(0, 5);
        playedChamps = names;
      }
    }

    return res.status(200).json({
      name: `${latestName}#${latestTag}`,
      puuid: targetPuuid,
      profileIconId,
      summonerLevel,
      soloRank,
      flexRank,
      mostChamps,
      playedChamps
    });
  } catch (e) {
    return res.status(500).json({ error: `라이엇 API 조회 오류: ${e.message}` });
  }
}
